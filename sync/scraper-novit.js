#!/usr/bin/env node
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import pkg from "xlsx";
const { readFile, utils } = pkg;
import crypto from "crypto";
import path from "path";
import fs from "fs";
import "dotenv/config";
import { WebSocket } from "ws";

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_USER    = process.env.NOVIT_USER;
const NOVIT_PASS    = process.env.NOVIT_PASS;
const NOVIT_URL     = "https://monitoreo.grupocontrol.ar/#/login";

const UPSERT_CHUNK  = 200;
const DRY_RUN       = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_KEY || !NOVIT_USER || !NOVIT_PASS) {
  console.error("Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_KEY, NOVIT_USER, NOVIT_PASS");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { global: { WebSocket } });

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString("es-AR")}] ${msg}`);
}

function limpiarStr(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\u0000/g, "").replace(/[\x00-\x1F\x7F]/g, "").trim();
  return s || null;
}

// FIX 1: agrega DNI al hash para evitar colisiones entre personas con mismo nombre y fecha
function generarId(nombre, fechaCreacion, dni) {
  const base = `${(nombre || "").trim().toLowerCase()}|${fechaCreacion || ""}|${dni || ""}`;
  return crypto.createHash("md5").update(base).digest("hex").slice(0, 24);
}

function normalizarFila(row) {
  let fechaCreacion = null;
  try {
    if (row["Fecha de registro"]) {
      const parts = String(row["Fecha de registro"]).split(/[\/ :]/);
      if (parts.length >= 3) {
        const d = new Date(parts[2], parts[1]-1, parts[0],
          parts[3]||0, parts[4]||0, parts[5]||0);
        if (!isNaN(d.getTime())) fechaCreacion = d.toISOString();
      }
    }
  } catch(e) {}

  const nombreCompleto = limpiarStr(row["Nombre"]) || "";
  const partes = nombreCompleto.split(" ").filter(Boolean);
  const apellido = partes[0] || null;
  const nombre   = partes.slice(1).join(" ") || nombreCompleto;

  // FIX 2: pasar DNI al generarId
  const dni = limpiarStr(row["DNI"]);
  const id  = generarId(nombreCompleto, fechaCreacion, dni);

  return {
    id,
    usuario:          limpiarStr(row["Email"]),
    nombre,
    apellido,
    sexo:             limpiarStr(row["Sexo"]),
    fecha_nacimiento: (() => {
      try {
        if (!row["Fecha de Nacimiento"]) return null;
        const parts = String(row["Fecha de Nacimiento"]).split(/[\/ :]/);
        if (parts.length >= 3) {
          const d = new Date(parts[2], parts[1]-1, parts[0]);
          return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
        }
        return null;
      } catch(e) { return null; }
    })(),
    // FIX 3: true si tiene DNI cargado, false si está vacío
    dni_escaneado:    !!dni,
    categoria_nombre: limpiarStr(row["Categoria"]) || "Sin categoria",
    localidad:        limpiarStr(row["Localidad"]),
    barrio:           limpiarStr(row["Barrio"]),
    app_type:         null,
    // FIX 4: "Sí" con tilde — normalizar antes de comparar
    activo: (() => {
      const v = String(row["Activo"] ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      return v === "si" || v === "true";
    })(),
    fecha_creacion:      fechaCreacion,
    fecha_actualizacion: null,
    synced_at:           new Date().toISOString(),
  };
}

async function upsertChunk(rows) {
  if (DRY_RUN) { log(`  [DRY-RUN] ${rows.length} filas`); return rows.length; }

  // FIX 5: deduplicar por id dentro del chunk para evitar "ON CONFLICT DO UPDATE
  //         command cannot affect row a second time"
  const seen   = new Set();
  const unique = rows.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  const { error } = await supabase
    .from("usuarios_cache")
    .upsert(unique, { onConflict: "id" });

  if (!error) return unique.length;

  log(`  Chunk fallo (${error.message}), reintentando de a 1...`);
  let ok = 0;
  for (const row of unique) {
    const { error: e2 } = await supabase
      .from("usuarios_cache")
      .upsert([row], { onConflict: "id" });
    if (e2) log(`  Saltando ${row.id}: ${e2.message}`);
    else ok++;
  }
  return ok;
}

async function main() {
  const t0 = Date.now();
  log(`Iniciando scraper Novit${DRY_RUN ? " (DRY-RUN)" : ""}`);

  const downloadDir = path.resolve("./downloads");
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
  fs.readdirSync(downloadDir).forEach(f => fs.unlinkSync(path.join(downloadDir, f)));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  log("Navegando al login...");
  await page.goto(NOVIT_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector('#mat-input-0', { timeout: 15000 });
  await page.fill('#mat-input-0', NOVIT_USER, { timeout: 10000 });
  await page.fill('#mat-input-1', NOVIT_PASS, { timeout: 10000 });
  await page.click('button:has-text("Ingresar")');
  await page.waitForURL(/\#\/(dashboard|home|inicio)/, { timeout: 15000 }).catch(() => {});
  log("Login OK");

  // ── CERRAR POPUPS ──────────────────────────────────────────────────────────
  log("Cerrando popups...");
  for (let i = 0; i < 3; i++) {
    try {
      const btn = page.locator('button:has-text("Aceptar")').first();
      await btn.waitFor({ timeout: 3000 });
      await btn.click();
      log(`  Popup ${i + 1} cerrado`);
      await page.waitForTimeout(500);
    } catch {
      break;
    }
  }

  // ── NAVEGAR A CONFIGURACIÓN > VECINOS ──────────────────────────────────────
  log("Navegando a Configuración...");
  await page.waitForSelector(".cdk-overlay-backdrop", { state: "hidden", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const els = document.querySelectorAll("p, span, a");
    for (const el of els) {
      if (el.textContent.trim() === "Configuración") { el.click(); break; }
    }
  });
  await page.waitForTimeout(1000);

  log("Navegando a Vecinos...");
  await page.evaluate(() => {
    const els = document.querySelectorAll("p, span, a, mat-list-item");
    for (const el of els) {
      if (el.textContent.trim() === "Vecinos") { el.click(); break; }
    }
  });
  await page.waitForTimeout(2000);

  // ── DESCARGAR XLS ──────────────────────────────────────────────────────────
  log("Descargando XLS...");
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.includes('XLS') && btn.getAttribute('mattooltip') === 'Exportar') {
        btn.click(); return;
      }
    }
    for (const btn of btns) {
      if (btn.textContent.includes('XLS')) { btn.click(); return; }
    }
  });

  log("Esperando diálogo de confirmación...");
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim() === 'Aceptar') { btn.click(); return; }
    }
  });
  log("Diálogo aceptado, esperando descarga...");

  const download = await page.waitForEvent("download", { timeout: 60000 });
  const xlsPath = path.join(downloadDir, "vecinos.xlsx");
  await download.saveAs(xlsPath);
  log(`XLS guardado en ${xlsPath}`);
  await browser.close();

  // ── PROCESAR EXCEL ─────────────────────────────────────────────────────────
  log("Procesando Excel...");
  const wb = readFile(xlsPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = utils.sheet_to_json(ws, { defval: null });
  log(`Filas en Excel: ${rawRows.length.toLocaleString()}`);

  const rows = rawRows.map(normalizarFila);
  const sinId = rows.filter(r => !r.id).length;
  if (sinId > 0) log(`  Advertencia: ${sinId} filas sin id, se omiten`);

  const rowsValidos = rows.filter(r => r.id);
  log(`Filas a escribir: ${rowsValidos.length.toLocaleString()}`);
  log("Escribiendo en Supabase...");

  let written = 0;
  for (let i = 0; i < rowsValidos.length; i += UPSERT_CHUNK) {
    const chunk = rowsValidos.slice(i, i + UPSERT_CHUNK);
    written += await upsertChunk(chunk);
    if (written % 2000 === 0 || i + UPSERT_CHUNK >= rowsValidos.length) {
      log(`  Upserted: ${written.toLocaleString()} / ${rowsValidos.length.toLocaleString()}`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`Scraper completado en ${elapsed}s · ${written.toLocaleString()} filas escritas`);

  if (!DRY_RUN) {
    const { data: resumen } = await supabase.from("v_usuarios_resumen").select("*").single();
    if (resumen) {
      log(`Estado tabla: Total=${Number(resumen.total).toLocaleString()} · Activos=${Number(resumen.activos).toLocaleString()} · Con DNI=${Number(resumen.con_dni).toLocaleString()}`);
    }
  }
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
