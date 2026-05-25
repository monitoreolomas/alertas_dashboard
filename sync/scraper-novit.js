#!/usr/bin/env node
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import "dotenv/config";
import pkg from "xlsx";
const { readFile, utils } = pkg;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_USER   = process.env.NOVIT_USER;
const NOVIT_PASS   = process.env.NOVIT_PASS;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const log = (...args) => console.log(`[${new Date().toTimeString().slice(0,8)}]`, ...args);

// ---------- helpers ----------

function parseFecha(str) {
  if (!str) return null;
  const s = String(str).trim();
  // DD/MM/YYYY o DD/MM/YYYY HH:MM:SS
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, dd, mm, yyyy, hh = "00", mi = "00", ss = "00"] = m;
  const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function generarId(nombre, fechaCreacion, dni) {
  const base = `${String(nombre ?? "").trim().toLowerCase()}|${fechaCreacion ?? ""}|${dni ?? ""}`;
  return crypto.createHash("md5").update(base).digest("hex").slice(0, 24);
}

function normalizar(row) {
  const nombreCompleto = String(row["Nombre"] ?? "").trim();
  // Primera palabra = apellido, resto = nombre (convención argentina)
  const partes = nombreCompleto.split(/\s+/);
  const apellido = partes[0] ?? null;
  const nombre   = partes.slice(1).join(" ") || null;

  const fechaCreacion  = parseFecha(row["Fecha de registro"]);
  const fechaNacimiento = parseFecha(row["Fecha de Nacimiento"]);
  const dni = row["DNI"] ? String(row["DNI"]).trim() : null;

  return {
    id:               generarId(nombreCompleto, fechaCreacion, dni),
    usuario:          row["Email"] ? String(row["Email"]).trim() : null,
    nombre,
    apellido,
    sexo:             row["Sexo"]   ? String(row["Sexo"]).trim()   : null,
    fecha_nacimiento: fechaNacimiento ? fechaNacimiento.slice(0, 10) : null,  // solo fecha
    dni_escaneado:    !!dni,            // true si tiene DNI cargado
    categoria_nombre: row["Categoria"] ? String(row["Categoria"]).trim() : null,
    localidad:        row["Localidad"] ? String(row["Localidad"]).trim() : null,
    barrio:           row["Barrio"]    ? String(row["Barrio"]).trim()    : null,
    activo:           String(row["Activo"] ?? "").trim().toLowerCase() === "sí" || 
                      String(row["Activo"] ?? "").trim().toLowerCase() === "si",
    fecha_creacion:   fechaCreacion,
  };
}

// ---------- scraping ----------

async function descargarXLS() {
  const downloadDir = path.resolve("downloads");
  fs.mkdirSync(downloadDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page    = await context.newPage();

  log("Navegando al login...");
  await page.goto("https://monitoreo.grupocontrol.ar/#/login", { waitUntil: "networkidle" });

  await page.waitForSelector("#mat-input-0", { timeout: 15000 });
  await page.fill("#mat-input-0", NOVIT_USER);
  await page.fill("#mat-input-1", NOVIT_PASS);
  await page.click("button[type=submit]");
  await page.waitForTimeout(3000);
  log("Login OK");

  // Cerrar popups (puede haber 1 o 2)
  log("Cerrando popups...");
  for (let i = 1; i <= 2; i++) {
    try {
      const btn = page.locator("button:has-text('Aceptar'), button:has-text('ACEPTAR'), button:has-text('Cerrar')").first();
      await btn.waitFor({ timeout: 4000 });
      await btn.click();
      log(`  Popup ${i} cerrado`);
      await page.waitForTimeout(1000);
    } catch {
      break;
    }
  }

  // Configuración
  log("Navegando a Configuración...");
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("span")].find(e => e.textContent.trim() === "Configuración");
    el?.click();
  });
  await page.waitForTimeout(2000);

  // Vecinos
  log("Navegando a Vecinos...");
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("span, a")].find(e => e.textContent.trim() === "Vecinos");
    el?.click();
  });
  await page.waitForTimeout(3000);

  // Click XLS
  log("Descargando XLS...");
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const xls  = btns.find(b => b.textContent.includes("XLS"));
    xls?.click();
  });

  // Confirmar diálogo — registrar listener ANTES de hacer click
  log("Esperando diálogo de confirmación...");
  await page.waitForTimeout(1500);

  const downloadPromise = page.waitForEvent("download", { timeout: 90000 });

  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const ok   = btns.find(b => /aceptar/i.test(b.textContent));
    ok?.click();
  });
  log("Diálogo aceptado, esperando descarga...");

  const download = await downloadPromise;
  const filePath = path.join(downloadDir, "vecinos.xlsx");
  await download.saveAs(filePath);
  await browser.close();

  log(`XLS guardado en ${filePath}`);
  return filePath;
}

// ---------- upsert ----------

async function upsertChunk(rows) {
  const { error } = await supabase
    .from("usuarios_cache")
    .upsert(rows, { onConflict: "id" });
  return error;
}

async function escribirSupabase(rows) {
  const CHUNK = 500;
  let escritos = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);

    // Deduplicar por id dentro del chunk (evita ON CONFLICT doble)
    const seen   = new Set();
    const unique = chunk.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    let error = await upsertChunk(unique);

    if (error) {
      // Reintentar de a 1
      log(`  Chunk falló (${error.message}), reintentando de a 1...`);
      for (const row of unique) {
        const e2 = await upsertChunk([row]);
        if (e2) log(`  Saltando ${row.id}: ${e2.message}`);
        else escritos++;
      }
    } else {
      escritos += unique.length;
    }

    log(`  Upserted: ${escritos.toLocaleString()} / ${rows.length.toLocaleString()}`);
  }

  return escritos;
}

// ---------- main ----------

async function main() {
  log("Iniciando scraper Novit");

  const filePath = await descargarXLS();

  log("Procesando Excel...");
  const wb    = readFile(filePath);
  const ws    = wb.Sheets[wb.SheetNames[0]];
  const data  = utils.sheet_to_json(ws);
  log(`Filas en Excel: ${data.length.toLocaleString()}`);

  const rows = data.map(normalizar);
  log(`Filas a escribir: ${rows.length.toLocaleString()}`);

  log("Escribiendo en Supabase...");
  const total = await escribirSupabase(rows);

  log(`Sync completado · ${total.toLocaleString()} usuarios escritos`);

  // Verificación final
  const { count } = await supabase
    .from("usuarios_cache")
    .select("*", { count: "exact", head: true });
  log(`Estado tabla: Total=${count?.toLocaleString()}`);
}

main().catch(err => { console.error(err); process.exit(1); });
