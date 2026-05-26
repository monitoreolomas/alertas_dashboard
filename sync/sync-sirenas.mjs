#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fetch            from "node-fetch";
import "dotenv/config";
import { WebSocket }    from "ws";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_TOKEN  = process.env.NOVIT_TOKEN;
const SIRENAS_API  = "https://apis2.novit.gpesistemas.ar/monitoreo/sirenas";

if (!SUPABASE_URL || !SUPABASE_KEY || !NOVIT_TOKEN) {
  console.error("Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_KEY, NOVIT_TOKEN");
  process.exit(1);
}

const BATCH_SIZE   = 15;
const PARALLEL_REQ = 8;
const INSERT_CHUNK = 200;
const DRY_RUN      = process.argv.includes("--dry-run");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { global: { WebSocket } });

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

function normalizarSirena(s) {
  const d = sanitizar(s);

  const localidadId     = d?.idLocalidad || null;
  const localidadNombre = d?.localidad?.nombre?.trim() || null;

  const lat = d?.ubicacionGps?.lat ?? d?.ubicacionManual?.lat ?? d?.geojson?.coordinates?.[1] ?? null;
  const lng = d?.ubicacionGps?.lng ?? d?.ubicacionManual?.lng ?? d?.geojson?.coordinates?.[0] ?? null;

  return {
    id:                  limpiarStr(d._id),
    chip_id:             limpiarStr(d.chipId),
    activa:              d?.activa === true || d?.activa === "true",
    online:              d?.online === true || d?.online === "true",
    modelo_sirena:       limpiarStr(d?.modeloSirena),
    localidad_id:        limpiarStr(localidadId),
    localidad:           limpiarStr(localidadNombre),
    direccion:           limpiarStr(d?.direccionManual ?? d?.direccionGps),
    lat,
    lng,
    fecha_online:        d?.fechaOnline  || null,
    fecha_offline:       d?.fechaOffline || null,
    fecha_creacion:      d?.fechaCreacion || null,
    rssi:                typeof d?.rssi === "number" ? d.rssi : null,
    version_firmware:    limpiarStr(d?.versionFirmware),
    acumulado_online:    typeof d?.acumuladoOnline  === "number" ? d.acumuladoOnline  : null,
    acumulado_offline:   typeof d?.acumuladoOffline === "number" ? d.acumuladoOffline : null,
    luz_encendida:       d?.luzEncendida    === true || d?.luzEncendida    === "true",
    sonido_encendido:    d?.sonidoEncendido === true || d?.sonidoEncendido === "true",
    actualizando:        d?.actualizando    === true || d?.actualizando    === "true",
    error_actualizacion: d?.errorActualizacion === true || d?.errorActualizacion === "true",
    error_sd:            d?.errorSd === true || d?.errorSd === "true",
    ber:                 typeof d?.ber    === "number" ? d.ber    : null,
    wakeup:              typeof d?.wakeup === "number" ? d.wakeup : null,
    tipo:                limpiarStr(d?.tipo),
    synced_at:           new Date().toISOString(),
  };
}

function buildUrl(page) {
  const populate = JSON.stringify([{ path: "localidad", select: "nombre" }]);
  return `${SIRENAS_API}?limit=${BATCH_SIZE}&page=${page}&populate=${encodeURIComponent(populate)}`;
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

async function traerTodasDeAPI() {
  log("── PASO 1: Trayendo sirenas de la API ──");

  const first = await fetchPage(1);
  const totalEsperado = first.totalCount;
  log(`  totalCount: ${totalEsperado.toLocaleString()}`);

  let rows = [...first.datos.map(normalizarSirena)];
  const totalPages = Math.ceil(totalEsperado / BATCH_SIZE);

  let page = 2;
  while (page <= totalPages) {
    const batch = [];
    for (let p = page; p < page + PARALLEL_REQ && p <= totalPages; p++) {
      batch.push(fetchPage(p));
    }
    const results = await Promise.all(batch);
    let gotAny = false;
    for (const { datos } of results) {
      if (datos.length > 0) gotAny = true;
      rows.push(...datos.map(normalizarSirena));
    }
    log(`  Fetched: ${rows.length.toLocaleString()} / ${totalEsperado.toLocaleString()}`);
    if (!gotAny) break;
    page += PARALLEL_REQ;
    if (page <= totalPages) await new Promise(r => setTimeout(r, 150));
  }

  const unique = Array.from(new Map(rows.map(r => [r.id, r])).values());
  log(`  Después de deduplicar: ${unique.length.toLocaleString()} / ${totalEsperado.toLocaleString()}`);

  if (unique.length < totalEsperado) {
    log(`  ⚠ Faltan ${totalEsperado - unique.length} sirenas — continuando con lo obtenido`);
  }

  const online   = unique.filter(r => r.online).length;
  const offline  = unique.filter(r => !r.online).length;
  const byModelo = unique.reduce((acc, r) => {
    const k = r.modelo_sirena || "null";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  log(`  Online: ${online} · Offline: ${offline}`);
  log(`  Por modelo: ${JSON.stringify(byModelo)}`);
  log(`Total API: ${unique.length.toLocaleString()} sirenas`);
  return unique;
}

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

  const { error } = await supabase.from("sirenas_cache").insert(unique);
  if (!error) return unique.length;

  log(`  Chunk falló (${error.message}), reintentando de a 1...`);
  let ok = 0;
  for (const row of unique) {
    let r;
    try { r = limpiarJsonStr([row])[0]; } catch { continue; }
    const { error: e2 } = await supabase.from("sirenas_cache").insert([r]);
    if (e2) log(`  Saltando ${row.id}: ${e2.message}`);
    else ok++;
  }
  return ok;
}

async function truncateEInsert(rows) {
  log("── PASO 2: Truncate sirenas_cache ──");
  if (!DRY_RUN) {
    const { error } = await supabase.rpc("truncate_sirenas_cache");
    if (error) {
      log(`  RPC no disponible (${error.message}), usando DELETE...`);
      const { error: e2 } = await supabase.from("sirenas_cache").delete().neq("id", "");
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
    if (written % 1000 === 0 || i + INSERT_CHUNK >= rows.length) {
      log(`  Insertado: ${written.toLocaleString()} / ${rows.length.toLocaleString()}`);
    }
  }
  return written;
}

async function main() {
  const t0 = Date.now();
  log(`╔══ sync-sirenas.mjs iniciando${DRY_RUN ? " (DRY-RUN)" : ""} ══╗`);

  const rows    = await traerTodasDeAPI();
  const written = await truncateEInsert(rows);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`╚══ Completado en ${elapsed}s · ${written.toLocaleString()} sirenas escritas ══╝`);

  if (!DRY_RUN) {
    const { count: total }   = await supabase.from("sirenas_cache").select("*", { count: "exact", head: true });
    const { count: online }  = await supabase.from("sirenas_cache").select("*", { count: "exact", head: true }).eq("online", true);
    const { count: offline } = await supabase.from("sirenas_cache").select("*", { count: "exact", head: true }).eq("online", false);
    log(`Estado tabla: Total=${(total||0).toLocaleString()} · Online=${(online||0).toLocaleString()} · Offline=${(offline||0).toLocaleString()}`);
  }
}

main().catch(err => {
  console.error("Error fatal:", err.message);
  process.exit(1);
});
