#!/usr/bin/env node
/**
 * sync-full.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Pipeline completo (una sola vez al día):
 *   1. Trae todos los usuarios de la API Novit (con sus MongoDB IDs y app_type)
 *   2. Descarga el Excel de Novit vía Playwright
 *   3. Matchea cada fila del Excel con la API por:
 *      → nombre|dni   si tiene DNI
 *      → nombre|fecha si no tiene DNI
 *      → hash MD5 si no matchea por ninguno
 *   4. TRUNCATE usuarios_cache
 *   5. INSERT de todos los registros (API + Excel no-duplicados)
 * ─────────────────────────────────────────────────────────────────────────────
 * Uso:
 *   node sync-full.mjs            → ejecución normal
 *   node sync-full.mjs --dry-run  → sin escribir en Supabase
 */

import { chromium }        from "playwright";
import { createClient }    from "@supabase/supabase-js";
import fetch               from "node-fetch";
import pkg                 from "xlsx";
import crypto              from "crypto";
import path                from "path";
import fs                  from "fs";
import "dotenv/config";
import { WebSocket }       from "ws";

const { readFile, utils } = pkg;

// ── Env ───────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_TOKEN  = process.env.NOVIT_TOKEN;
const NOVIT_USER   = process.env.NOVIT_USER;
const NOVIT_PASS   = process.env.NOVIT_PASS;
const NOVIT_URL    = "https://monitoreo.grupocontrol.ar/#/login";
const VECINOS_API  = "https://apis2.novit.gpesistemas.ar/monitoreo/configvecinos";

if (!SUPABASE_URL || !SUPABASE_KEY || !NOVIT_TOKEN || !NOVIT_USER || !NOVIT_PASS) {
  console.error("Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_KEY, NOVIT_TOKEN, NOVIT_USER, NOVIT_PASS");
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────────────
const BATCH_SIZE   = 500;
const PARALLEL_REQ = 3;
const INSERT_CHUNK = 200;
const DRY_RUN      = process.argv.includes("--dry-run");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { global: { WebSocket } });

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[${new Date().toLocaleTimeString("es-AR")}] ${msg}`);
}

function limpiarStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v)
    .replace(/\u0000/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
  return s || null;
}

function sanitizar(obj) {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === "string") return limpiarStr(obj);
  if (typeof obj !== "object" || Array.isArray(obj)) return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizar(v)]));
}

function limpiarJsonStr(rows) {
  let json = JSON.stringify(rows);
  json = json
    .replace(/\\u0000/g, "")
    .replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F"])/g, "");
  return JSON.parse(json);
}

/** Normaliza un nombre para usar como clave de match */
function normalizarNombre(nombre) {
  if (!nombre) return "";
  return String(nombre)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // saca tildes
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Normaliza un DNI: solo dígitos */
function normalizarDni(dni) {
  if (!dni) return "";
  return String(dni).replace(/\D/g, "").trim();
}

/**
 * Claves de match para un usuario de la API.
 * Devuelve un array porque un usuario puede tener DNI y/o fecha,
 * y queremos indexar ambas claves.
 *   - con DNI:   "nombre|dni"
 *   - con fecha: "nombre|fecha"
 */
function clavesMatchAPI(nombreCompleto, dni, fechaCreacion) {
  const nombre = normalizarNombre(nombreCompleto);
  const claves = [];
  const dniNorm = normalizarDni(dni);
  if (dniNorm) claves.push(`${nombre}|dni:${dniNorm}`);
  if (fechaCreacion) claves.push(`${nombre}|fecha:${String(fechaCreacion).slice(0, 10)}`);
  return claves;
}

/**
 * Clave de match para una fila del Excel.
 * Prioriza DNI; si no tiene, usa fecha.
 */
function claveMatchExcel(nombreCompleto, dni, fechaCreacion) {
  const nombre  = normalizarNombre(nombreCompleto);
  const dniNorm = normalizarDni(dni);
  if (dniNorm) return `${nombre}|dni:${dniNorm}`;
  if (fechaCreacion) return `${nombre}|fecha:${String(fechaCreacion).slice(0, 10)}`;
  return null;
}

/** Genera un ID hash MD5 de 24 chars como fallback */
function generarIdHash(nombre, fechaCreacion, dni) {
  const base = `${normalizarNombre(nombre)}|${fechaCreacion || ""}|${normalizarDni(dni)}`;
  return crypto.createHash("md5").update(base).digest("hex").slice(0, 24);
}

// ── PASO 1: Traer todos los usuarios de la API ────────────────────────────────

function buildUrl(page, appType) {
  const filterObj = { appType };
  const filter = JSON.stringify(filterObj);
  const populate = JSON.stringify([
    { path: "cliente", select: "categoriaDefault", populate: { path: "categoriaDefault", select: "nombre" } },
    { path: "categoria.categoria", select: "nombre" },
    { path: "direccion.localidad", select: "nombre" },
    { path: "direccion.barrio",    select: "nombre" },
  ]);
  return (
    `${VECINOS_API}?limit=${BATCH_SIZE}&page=${page}&sort=-fechaCreacion` +
    `&populate=${encodeURIComponent(populate)}` +
    `&filter=${encodeURIComponent(filter)}`
  );
}

function normalizarUsuarioAPI(u) {
  const s = sanitizar(u);

  let categoriaNombre = "Sin categoria";
  if (s?.categoria?.categoria?.nombre) {
    categoriaNombre = s.categoria.categoria.nombre;
  } else if (Array.isArray(s?.categoria) && s.categoria.length > 0) {
    categoriaNombre = s.categoria[0]?.categoria?.nombre || "Sin categoria";
  } else if (s?.cliente?.categoriaDefault?.nombre) {
    categoriaNombre = s.cliente.categoriaDefault.nombre;
  }

  const nombreCompleto = [s?.datosPersonales?.apellido, s?.datosPersonales?.nombre]
    .filter(Boolean).join(" ");

  const dni = limpiarStr(s?.datosPersonales?.dni);

  return {
    id:                  limpiarStr(s._id),
    usuario:             limpiarStr(s.usuario),
    nombre:              limpiarStr(s?.datosPersonales?.nombre),
    apellido:            limpiarStr(s?.datosPersonales?.apellido),
    nombre_completo:     nombreCompleto,  // solo para match, no se guarda
    dni,                                  // se guarda en la nueva columna
    sexo:                s?.datosPersonales?.sexo ?? null,
    fecha_nacimiento:    s?.datosPersonales?.fechaNacimiento?.slice(0, 10) || null,
    dni_escaneado:       s?.dniEscaneado === true || s?.dniEscaneado === "true",
    categoria_nombre:    limpiarStr(categoriaNombre),
    localidad:           limpiarStr(s?.direccion?.localidad?.nombre || s?.localidad),
    barrio:              limpiarStr(s?.direccion?.barrio?.nombre),
    app_type:            limpiarStr(s?.appType),
    activo:              s?.activo === true || s?.activo === "true",
    fecha_creacion:      s?.fechaCreacion || null,
    fecha_actualizacion: s?.fechaActualizacion || s?.updatedAt || null,
    synced_at:           new Date().toISOString(),
  };
}

async function fetchPage(page, appType, intentos = 3) {
  const url = buildUrl(page, appType);
  const headers = { Authorization: `Bearer ${NOVIT_TOKEN}` };
  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { datos: json.datos || [], totalCount: json.totalCount || 0 };
    } catch (err) {
      if (i === intentos - 1) throw err;
      log(`  Página ${page} falló (intento ${i+1}/${intentos}): ${err.message}. Reintentando...`);
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

async function fetchGrupoAPI(appType) {
  const label = appType === null ? "sin app" : appType;
  log(`  Grupo API: ${label}`);

  const first = await fetchPage(1, appType);
  log(`    totalCount: ${first.totalCount.toLocaleString()}`);

  let rows = first.datos.map(normalizarUsuarioAPI);
  let page = 2;

  if (first.datos.length >= BATCH_SIZE) {
    while (true) {
      const batch = [];
      for (let p = page; p < page + PARALLEL_REQ; p++) {
        batch.push(fetchPage(p, appType));
      }
      const results = await Promise.all(batch);
      let done = false;
      for (const { datos } of results) {
        rows.push(...datos.map(normalizarUsuarioAPI));
        if (datos.length < BATCH_SIZE) { done = true; break; }
      }
      log(`    Fetched: ${rows.length.toLocaleString()}`);
      if (done) break;
      page += PARALLEL_REQ;
    }
  }

  log(`    Total: ${rows.length.toLocaleString()}`);
  return rows;
}

async function traerTodosDeAPI() {
  log("── PASO 1: Trayendo usuarios de la API ──");
  const grupos = await Promise.all(
    ["ios", "android", "web", null].map(fetchGrupoAPI)
  );
  const todos = grupos.flat();
  log(`Total API: ${todos.length.toLocaleString()} usuarios`);
  return todos;
}

// ── PASO 2: Descargar Excel vía Playwright ────────────────────────────────────

async function descargarExcel() {
  log("── PASO 2: Descargando Excel de Novit ──");

  const downloadDir = path.resolve("./downloads");
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
  fs.readdirSync(downloadDir).forEach(f => fs.unlinkSync(path.join(downloadDir, f)));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page    = await context.newPage();

  log("  Navegando al login...");
  await page.goto(NOVIT_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector("#mat-input-0", { timeout: 15000 });
  await page.fill("#mat-input-0", NOVIT_USER);
  await page.fill("#mat-input-1", NOVIT_PASS);
  await page.click('button:has-text("Ingresar")');
  await page.waitForURL(/\#\/(dashboard|home|inicio)/, { timeout: 15000 }).catch(() => {});
  log("  Login OK");

  for (let i = 0; i < 3; i++) {
    try {
      const btn = page.locator('button:has-text("Aceptar")').first();
      await btn.waitFor({ timeout: 3000 });
      await btn.click();
      await page.waitForTimeout(500);
    } catch { break; }
  }

  await page.waitForSelector(".cdk-overlay-backdrop", { state: "hidden", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("p, span, a")) {
      if (el.textContent.trim() === "Configuración") { el.click(); break; }
    }
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("p, span, a, mat-list-item")) {
      if (el.textContent.trim() === "Vecinos") { el.click(); break; }
    }
  });
  await page.waitForTimeout(2000);

  log("  Descargando XLS...");
  await page.evaluate(() => {
    const btns = document.querySelectorAll("button");
    for (const btn of btns) {
      if (btn.textContent.includes("XLS") && btn.getAttribute("mattooltip") === "Exportar") {
        btn.click(); return;
      }
    }
    for (const btn of btns) {
      if (btn.textContent.includes("XLS")) { btn.click(); return; }
    }
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    for (const btn of document.querySelectorAll("button")) {
      if (btn.textContent.trim() === "Aceptar") { btn.click(); return; }
    }
  });

  const download = await page.waitForEvent("download", { timeout: 60000 });
  const xlsPath  = path.join(downloadDir, "vecinos.xlsx");
  await download.saveAs(xlsPath);
  await browser.close();
  log(`  Excel guardado: ${xlsPath}`);
  return xlsPath;
}

// ── PASO 3: Normalizar Excel y hacer match con API ────────────────────────────

function normalizarFilaExcel(row, apiMap) {
  let fechaCreacion = null;
  try {
    if (row["Fecha de registro"]) {
      const parts = String(row["Fecha de registro"]).split(/[\/ :]/);
      if (parts.length >= 3) {
        const d = new Date(parts[2], parts[1] - 1, parts[0],
          parts[3] || 0, parts[4] || 0, parts[5] || 0);
        if (!isNaN(d.getTime())) fechaCreacion = d.toISOString();
      }
    }
  } catch (e) {}

  const nombreCompleto = limpiarStr(row["Nombre"]) || "";
  const partes   = nombreCompleto.split(" ").filter(Boolean);
  const apellido = partes[0] || null;
  const nombre   = partes.slice(1).join(" ") || nombreCompleto;
  const dni      = limpiarStr(row["DNI"]);

  // Match: primero por nombre|dni, luego por nombre|fecha
  const clave    = claveMatchExcel(nombreCompleto, dni, fechaCreacion);
  const apiMatch = clave ? apiMap.get(clave) : null;

  const id       = apiMatch ? apiMatch.id       : generarIdHash(nombreCompleto, fechaCreacion, dni);
  const app_type = apiMatch ? apiMatch.app_type : null;

  return {
    id,
    usuario:          limpiarStr(row["Email"]),
    nombre,
    apellido,
    dni:              dni,
    sexo:             limpiarStr(row["Sexo"]),
    fecha_nacimiento: (() => {
      try {
        if (!row["Fecha de Nacimiento"]) return null;
        const parts = String(row["Fecha de Nacimiento"]).split(/[\/ :]/);
        if (parts.length >= 3) {
          const d = new Date(parts[2], parts[1] - 1, parts[0]);
          return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
        }
        return null;
      } catch (e) { return null; }
    })(),
    dni_escaneado:    !!dni,
    categoria_nombre: limpiarStr(row["Categoria"]) || "Sin categoria",
    localidad:        limpiarStr(row["Localidad"]),
    barrio:           limpiarStr(row["Barrio"]),
    app_type,
    activo: (() => {
      const v = String(row["Activo"] ?? "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      return v === "si" || v === "true";
    })(),
    fecha_creacion:      fechaCreacion,
    fecha_actualizacion: null,
    synced_at:           new Date().toISOString(),
  };
}

function procesarExcel(xlsPath, apiMap) {
  log("── PASO 3: Procesando Excel y haciendo match ──");
  const wb      = readFile(xlsPath);
  const ws      = wb.Sheets[wb.SheetNames[0]];
  const rawRows = utils.sheet_to_json(ws, { defval: null });
  log(`  Filas en Excel: ${rawRows.length.toLocaleString()}`);

  const rows = rawRows.map(row => normalizarFilaExcel(row, apiMap));

  let matcheados = 0;
  let matchDni   = 0;
  let matchFecha = 0;
  const sinMatch = [];

  for (const r of rows) {
    const dniNorm  = normalizarDni(r.dni);
    const nombre   = normalizarNombre([r.apellido, r.nombre].filter(Boolean).join(" "));
    const claveDni = dniNorm  ? `${nombre}|dni:${dniNorm}` : null;
    const claveFecha = r.fecha_creacion ? `${nombre}|fecha:${String(r.fecha_creacion).slice(0, 10)}` : null;

    if (claveDni && apiMap.has(claveDni)) {
      matcheados++; matchDni++;
    } else if (claveFecha && apiMap.has(claveFecha)) {
      matcheados++; matchFecha++;
    } else {
      sinMatch.push(r);
    }
  }

  const pct = rows.length > 0 ? ((matcheados / rows.length) * 100).toFixed(1) : "0.0";
  log(`  Matcheados con API: ${matcheados.toLocaleString()} / ${rows.length.toLocaleString()} (${pct}%)`);
  log(`    → por DNI:   ${matchDni.toLocaleString()}`);
  log(`    → por fecha: ${matchFecha.toLocaleString()}`);
  log(`  Sin match (hash fallback): ${sinMatch.length.toLocaleString()}`);

  if (sinMatch.length > 0 && sinMatch.length <= 20) {
    log("  Detalle sin match:");
    for (const r of sinMatch) {
      log(`    · "${[r.apellido, r.nombre].filter(Boolean).join(" ")}" | dni:${r.dni ?? "-"} | ${r.fecha_creacion?.slice(0, 10) ?? "sin fecha"}`);
    }
  } else if (sinMatch.length > 20) {
    log("  Primeros 20 sin match:");
    for (const r of sinMatch.slice(0, 20)) {
      log(`    · "${[r.apellido, r.nombre].filter(Boolean).join(" ")}" | dni:${r.dni ?? "-"} | ${r.fecha_creacion?.slice(0, 10) ?? "sin fecha"}`);
    }
    log(`    ... y ${sinMatch.length - 20} más`);
  }

  return rows.filter(r => r.id);
}

// ── PASO 4 + 5: Truncate + Insert ─────────────────────────────────────────────

async function insertChunk(rows) {
  if (DRY_RUN) { log(`  [DRY-RUN] ${rows.length} filas`); return rows.length; }

  let rowsLimpios;
  try { rowsLimpios = limpiarJsonStr(rows); }
  catch (e) { log(`  Error serializando chunk: ${e.message}`); return 0; }

  const seen   = new Set();
  const unique = rowsLimpios.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id); return true;
  });

  const { error } = await supabase.from("usuarios_cache").insert(unique);
  if (!error) return unique.length;

  log(`  Chunk falló (${error.message}), reintentando de a 1...`);
  let ok = 0;
  for (const row of unique) {
    let r;
    try { r = limpiarJsonStr([row])[0]; } catch { continue; }
    const { error: e2 } = await supabase.from("usuarios_cache").insert([r]);
    if (e2) log(`  Saltando ${row.id}: ${e2.message}`);
    else ok++;
  }
  return ok;
}

async function truncateEInsert(apiRows, excelRows) {
  log("── PASO 4: Truncate usuarios_cache ──");
  if (!DRY_RUN) {
    const { error } = await supabase.rpc("truncate_usuarios_cache");
    if (error) {
      log(`  RPC no disponible (${error.message}), usando DELETE...`);
      const { error: e2 } = await supabase.from("usuarios_cache").delete().neq("id", "");
      if (e2) throw new Error(`Truncate falló: ${e2.message}`);
    }
    log("  Truncate OK");
  } else {
    log("  [DRY-RUN] Truncate omitido");
  }

  log("── PASO 5: Insertando todos los registros ──");

  const apiIds    = new Set(apiRows.map(r => r.id));
  const excelSolo = excelRows.filter(r => !apiIds.has(r.id));
  log(`  API rows: ${apiRows.length.toLocaleString()}`);
  log(`  Excel rows nuevos (sin duplicar): ${excelSolo.length.toLocaleString()}`);

  const toInsert = [
    ...apiRows.map(({ nombre_completo, ...r }) => r),
    ...excelSolo,
  ];
  log(`  Total a insertar: ${toInsert.length.toLocaleString()}`);

  let written = 0;
  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
    const chunk = toInsert.slice(i, i + INSERT_CHUNK);
    written += await insertChunk(chunk);
    if (written % 5000 === 0 || i + INSERT_CHUNK >= toInsert.length) {
      log(`  Insertado: ${written.toLocaleString()} / ${toInsert.length.toLocaleString()}`);
    }
  }

  return written;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  const t0 = Date.now();
  log(`╔══ sync-full.mjs iniciando${DRY_RUN ? " (DRY-RUN)" : ""} ══╗`);

  // 1. Traer API
  const apiRows = await traerTodosDeAPI();

  // Construir mapa de match con dos claves por usuario: nombre|dni y nombre|fecha
  const apiMap = new Map();
  for (const u of apiRows) {
    if (!u.nombre_completo) continue;
    for (const clave of clavesMatchAPI(u.nombre_completo, u.dni, u.fecha_creacion)) {
      if (!apiMap.has(clave)) apiMap.set(clave, { id: u.id, app_type: u.app_type });
    }
  }
  log(`Mapa de match construido: ${apiMap.size.toLocaleString()} entradas`);

  // 2. Descargar Excel
  const xlsPath = await descargarExcel();

  // 3. Procesar Excel + match
  const excelRows = procesarExcel(xlsPath, apiMap);

  // 4 + 5. Truncate + Insert
  const written = await truncateEInsert(apiRows, excelRows);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`╚══ Completado en ${elapsed}s · ${written.toLocaleString()} filas escritas ══╝`);

  if (!DRY_RUN) {
    const { data: resumen } = await supabase.from("v_usuarios_resumen").select("*").single();
    if (resumen) {
      log(`Estado tabla: Total=${Number(resumen.total).toLocaleString()} · Activos=${Number(resumen.activos).toLocaleString()} · Con DNI=${Number(resumen.con_dni).toLocaleString()}`);
    }
  }
}

main().catch(err => {
  console.error("Error fatal:", err.message);
  process.exit(1);
});
