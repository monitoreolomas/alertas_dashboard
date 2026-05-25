#!/usr/bin/env node
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
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

// Genera un id determinístico a partir de nombre + fecha de registro.
// Mismo usuario siempre genera el mismo id → upsert sin duplicados.
function generarId(nombre, fechaCreacion) {
  const base = `${(nombre || "").trim().toLowerCase()}|${fechaCreacion || ""}`;
  return crypto.createHash("md5").update(base).digest("hex").slice(0, 24);
}

function normalizarFila(row) {
  const fechaCreacion = row["Fecha de registro"]
    ? new Date(row["Fecha de registro"]).toISOString()
    : null;

  const nombreCompleto = limpiarStr(row["Nombre"]) || "";
  const partes = nombreCompleto.split(" ").filter(Boolean);
  // El XLS trae "APELLIDO Nombre(s)" — primer token es apellido
  const apellido = partes[0] || null;
  const nombre   = partes.slice(1).join(" ") || nombreCompleto;

  const id = generarId(nombreCompleto, fechaCreacion);

  return {
    id,
    usuario:             limpiarStr(row["Email"]),   // puede ser null
    nombre,
    apellido,
    sexo:                limpiarStr(row["Sexo"]),
    fecha_nacimiento:    row["Fecha de Nacimiento"]
                           ? new Date(row["Fecha de Nacimiento"]).toISOString().slice(0, 10)
                           : null,
    dni_escaneado:       false,
    categoria_nombre:    limpiarStr(row["Categoria"]) || "Sin categoria",
    localidad:           limpiarStr(row["Localidad"]),
    barrio:              limpiarStr(row["Barrio"]),
    app_type:            null,
    activo:              String(row["Activo"]).toLowerCase() === "si" ||
                         String(row["Activo"]).toLowerCase() === "true" ||
                         row["Activo"] === true,
    fecha_creacion:      fechaCreacion,
    fecha_actualizacion: null,
    synced_at:           new Date().toISOString(),
  };
}

async function upsertChunk(rows) {
  if (DRY_RUN) { log(`  [DRY-RUN] ${rows.length} filas`); return rows.length; }

  const { error } = await supabase
    .from("usuarios_cache")
    .upsert(rows, { onConflict: "id" });  // upsert por id determinístico

  if (!error) return rows.length;

  log(`  Chunk fallo (${error.message}), reintentando de a 1...`);
  let ok = 0;
  for (const row of rows) {
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

  // Esperar explícitamente a que el campo usuario sea visible
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
  // Esperar a que todos los overlays/backdrops desaparezcan
  await page.waitForSelector(".cdk-overlay-backdrop", { state: "hidden", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  // Click via JS para evitar que el cdk-overlay-backdrop bloquee
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
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.includes('XLS') && btn.getAttribute('mattooltip') === 'Exportar') {
          btn.click(); return;
        }
      }
      for (const btn of btns) {
        if (btn.textContent.includes('XLS')) { btn.click(); return; }
      }
    }),
  ]);

  const xlsPath = path.join(downloadDir, "vecinos.xlsx");
  await download.saveAs(xlsPath);
  log(`XLS guardado en ${xlsPath}`);

  await browser.close();

  // ── PROCESAR EXCEL ─────────────────────────────────────────────────────────
  log("Procesando Excel...");
  const wb = XLSX.readFile(xlsPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(ws, { defval: null });
  log(`Filas en Excel: ${rawRows.length.toLocaleString()}`);

  const rows = rawRows.map(normalizarFila);
  const sinId = rows.filter(r => !r.id).length;
  if (sinId > 0) log(`  Advertencia: ${sinId} filas sin id (nombre+fecha vacíos), se omiten`);

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
