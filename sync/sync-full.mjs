#!/usr/bin/env node
/**
 * sync-full.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Pipeline completo (una sola vez al día):
 *   1. Trae todos los usuarios de la API Novit en una sola pasada
 *   2. TRUNCATE usuarios_cache
 *   3. INSERT de todos los registros
 * ─────────────────────────────────────────────────────────────────────────────
 * Uso:
 *   node sync-full.mjs            → ejecución normal
 *   node sync-full.mjs --dry-run  → sin escribir en Supabase
 */

import { createClient } from "@supabase/supabase-js";
import fetch            from "node-fetch";
import "dotenv/config";
import { WebSocket }    from "ws";

// ── Env ───────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_TOKEN  = process.env.NOVIT_TOKEN;
const VECINOS_API  = "https://apis2.novit.gpesistemas.ar/monitoreo/configvecinos";

if (!SUPABASE_URL || !SUPABASE_KEY || !NOVIT_TOKEN) {
  console.error("Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_KEY, NOVIT_TOKEN");
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

// ── Normalización — mapea API → columnas de usuarios_cache ───────────────────
//
// Columnas de la tabla (de la imagen):
//   id, usuario, nombre, apellido, sexo, fecha_nacimiento, dni_escaneado,
//   categoria_nombre, localidad, barrio, app_type, activo,
//   fecha_creacion, fecha_actualizacion, synced_at
//
// Campos de la API:
//   _id, activo, app, appType, appVersion, ultimoAcceso,
//   direccion.localidad (populate → nombre), direccion.barrio (populate → nombre),
//   categoria.categoria (populate → nombre),
//   cliente.categoriaDefault (populate → nombre),
//   dniEscaneado,
//   fechaCreacion, fechaActualizacion,
//   datosPersonales.{ dni, email, fechaNacimiento, nombre, sexo, telefono }
//
// NOTA: sexo en la API viene como boolean (true=Masculino, false=Femenino)

function normalizarUsuarioAPI(u) {
  const s = sanitizar(u);

  // Categoría: puede venir de categoria.categoria, array de categoria, o cliente.categoriaDefault
  let categoriaNombre = "Sin categoria";
  if (s?.categoria?.categoria?.nombre) {
    categoriaNombre = s.categoria.categoria.nombre;
  } else if (Array.isArray(s?.categoria) && s.categoria.length > 0) {
    categoriaNombre = s.categoria[0]?.categoria?.nombre || "Sin categoria";
  } else if (s?.cliente?.categoriaDefault?.nombre) {
    categoriaNombre = s.cliente.categoriaDefault.nombre;
  }

  // Sexo: boolean en la API → string legible
  const sexoRaw = s?.datosPersonales?.sexo;
  let sexo = null;
  if (sexoRaw === true  || sexoRaw === "true"  || sexoRaw === "Masculino") sexo = "Masculino";
  if (sexoRaw === false || sexoRaw === "false" || sexoRaw === "Femenino")  sexo = "Femenino";

  return {
    id:                  limpiarStr(s._id),
    usuario:             limpiarStr(s?.datosPersonales?.email),   // email como usuario
    nombre:              limpiarStr(s?.datosPersonales?.nombre),
    apellido:            null,                                     // la API no separa apellido
    sexo,
    fecha_nacimiento:    s?.datosPersonales?.fechaNacimiento?.slice(0, 10) || null,
    dni_escaneado:       s?.dniEscaneado === true || s?.dniEscaneado === "true",
    categoria_nombre:    limpiarStr(categoriaNombre),
    localidad:           limpiarStr(s?.direccion?.localidad?.nombre),
    barrio:              limpiarStr(s?.direccion?.barrio?.nombre),
    app_type:            limpiarStr(s?.appType),
    activo:              s?.activo === true || s?.activo === "true",
    fecha_creacion:      s?.fechaCreacion || null,
    fecha_actualizacion: s?.fechaActualizacion || s?.updatedAt || null,
    synced_at:           new Date().toISOString(),
  };
}

// ── PASO 1: Fetch API ─────────────────────────────────────────────────────────
function buildUrl(page) {
  const populate = JSON.stringify([
    { path: "cliente", select: "categoriaDefault", populate: { path: "categoriaDefault", select: "nombre" } },
    { path: "categoria.categoria", select: "nombre" },
    { path: "direccion.localidad", select: "nombre" },
    { path: "direccion.barrio",    select: "nombre" },
  ]);
  return (
    `${VECINOS_API}?limit=${BATCH_SIZE}&page=${page}&sort=-fechaCreacion` +
    `&populate=${encodeURIComponent(populate)}`
  );
}

async function fetchPage(page, intentos = 3) {
  const url     = buildUrl(page);
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

async function traerTodosDeAPI() {
  log("── PASO 1: Trayendo usuarios de la API ──");

  const first = await fetchPage(1);
  log(`  totalCount: ${first.totalCount.toLocaleString()}`);

  let rows = first.datos.map(normalizarUsuarioAPI);
  let page = 2;

  while (rows.length < first.totalCount) {
    const batch = [];
    for (let p = page; p < page + PARALLEL_REQ; p++) {
      batch.push(fetchPage(p));
    }
    const results = await Promise.all(batch);
    let done = false;
    for (const { datos } of results) {
      rows.push(...datos.map(normalizarUsuarioAPI));
      if (datos.length < BATCH_SIZE) { done = true; break; }
    }
    log(`  Fetched: ${rows.length.toLocaleString()} / ${first.totalCount.toLocaleString()}`);
    if (done || rows.length >= first.totalCount) break;
    page += PARALLEL_REQ;
  }

  // Resumen por appType
  const byType = rows.reduce((acc, r) => {
    const k = r.app_type || "null";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  log(`  Distribución appType: ${JSON.stringify(byType)}`);
  log(`Total API: ${rows.length.toLocaleString()} usuarios`);
  return rows;
}

// ── PASO 2 + 3: Truncate + Insert ────────────────────────────────────────────
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

async function truncateEInsert(rows) {
  log("── PASO 2: Truncate usuarios_cache ──");
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

  log("── PASO 3: Insertando registros ──");
  log(`  Total a insertar: ${rows.length.toLocaleString()}`);

  let written = 0;
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK);
    written += await insertChunk(chunk);
    if (written % 5000 === 0 || i + INSERT_CHUNK >= rows.length) {
      log(`  Insertado: ${written.toLocaleString()} / ${rows.length.toLocaleString()}`);
    }
  }

  return written;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  log(`╔══ sync-full.mjs iniciando${DRY_RUN ? " (DRY-RUN)" : ""} ══╗`);

  const rows    = await traerTodosDeAPI();
  const written = await truncateEInsert(rows);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`╚══ Completado en ${elapsed}s · ${written.toLocaleString()} filas escritas ══╝`);

  // Resumen final directo de la tabla
  if (!DRY_RUN) {
    const { count: total }   = await supabase.from("usuarios_cache").select("*", { count: "exact", head: true });
    const { count: activos } = await supabase.from("usuarios_cache").select("*", { count: "exact", head: true }).eq("activo", true);
    const { count: conDni }  = await supabase.from("usuarios_cache").select("*", { count: "exact", head: true }).eq("dni_escaneado", true);
    log(`Estado tabla: Total=${(total||0).toLocaleString()} · Activos=${(activos||0).toLocaleString()} · Con DNI=${(conDni||0).toLocaleString()}`);
  }
}

main().catch(err => {
  console.error("Error fatal:", err.message);
  process.exit(1);
});
