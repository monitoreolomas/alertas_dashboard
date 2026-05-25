#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import "dotenv/config";

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_TOKEN   = process.env.NOVIT_TOKEN;
const VECINOS_API   = "https://apis2.novit.gpesistemas.ar/monitoreo/configvecinos";

const BATCH_SIZE   = 500;
const UPSERT_CHUNK = 200;
const PARALLEL_REQ = 3;
const FULL_SYNC    = process.argv.includes("--full");
const DRY_RUN      = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_KEY || !NOVIT_TOKEN) {
  console.error("Faltan variables de entorno.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString("es-AR")}] ${msg}`);
}

function limpiarStr(v) {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") return v;
  return v
    .replace(/\u0000/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/\\u[0-9a-fA-F]{0,3}(?!\w)/gi, "")
    .trim() || null;
}

function sanitizar(obj) {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === "string") return limpiarStr(obj);
  if (typeof obj !== "object" || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, sanitizar(v)])
  );
}

function limpiarJsonStr(rows) {
  let json = JSON.stringify(rows);
  json = json
    .replace(/\\u0000/g, "")
    .replace(/\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F"])/g, "");
  return JSON.parse(json);
}

// appType: "ios" | "android" | "web" | null | undefined
// - undefined = sin filtro de appType (modo incremental)
// - null      = usuarios sin appType
// - string    = usuarios con ese appType
function buildUrl(page, fechaDesde = null, appType = undefined) {
  let filterObj = {};

  if (fechaDesde) {
    filterObj = { $and: [{ activo: "true" }, { fechaCreacion: { $gte: fechaDesde } }] };
  }

  if (appType !== undefined) {
    filterObj.appType = appType; // null o "ios"/"android"/"web"
  }

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

function normalizar(u) {
  const s = sanitizar(u);

  let categoriaNombre = "Sin categoria";
  if (s?.categoria?.categoria?.nombre) {
    categoriaNombre = s.categoria.categoria.nombre;
  } else if (Array.isArray(s?.categoria) && s.categoria.length > 0) {
    categoriaNombre = s.categoria[0]?.categoria?.nombre || "Sin categoria";
  } else if (s?.cliente?.categoriaDefault?.nombre) {
    categoriaNombre = s.cliente.categoriaDefault.nombre;
  }

  return {
    id:                  limpiarStr(s._id),
    usuario:             limpiarStr(s.usuario),
    nombre:              limpiarStr(s?.datosPersonales?.nombre),
    apellido:            limpiarStr(s?.datosPersonales?.apellido),
    sexo:                s?.datosPersonales?.sexo ?? null,
    fecha_nacimiento:    s?.datosPersonales?.fechaNacimiento?.slice(0, 10) || null,
    dni_escaneado:       s?.dniEscaneado === true || s?.dniEscaneado === "true",
    categoria_nombre:    limpiarStr(categoriaNombre),
    localidad:           limpiarStr(s?.direccion?.localidad?.nombre || s?.localidad),
    barrio:              limpiarStr(s?.direccion?.barrio?.nombre),
    app_type:            limpiarStr(s?.appType),   // "ios" | "android" | "web" | null
    activo:              s?.activo === true || s?.activo === "true",
    fecha_creacion:      s?.fechaCreacion || null,
    fecha_actualizacion: s?.fechaActualizacion || s?.updatedAt || null,
    synced_at:           new Date().toISOString(),
  };
}

async function fetchPage(page, fechaDesde, appType, intentos = 3) {
  const url = buildUrl(page, fechaDesde, appType);
  const headers = { Authorization: `Bearer ${NOVIT_TOKEN}` };
  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { datos: json.datos || [], totalCount: json.totalCount || 0 };
    } catch (err) {
      if (i === intentos - 1) throw err;
      log(`Pagina ${page} fallo (intento ${i+1}/${intentos}): ${err.message}. Reintentando...`);
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

async function upsertChunk(rows) {
  if (DRY_RUN) { log(`  [DRY-RUN] ${rows.length} filas`); return rows.length; }

  let rowsLimpios;
  try {
    rowsLimpios = limpiarJsonStr(rows);
  } catch (e) {
    log(`  Error serializando chunk: ${e.message}`);
    return 0;
  }

  const { error } = await supabase
    .from("usuarios_cache")
    .upsert(rowsLimpios, { onConflict: "id" });

  if (!error) return rowsLimpios.length;

  log(`  Chunk fallo (${error.message}), reintentando de a 1...`);
  let ok = 0;
  for (const row of rowsLimpios) {
    let rowLimpio;
    try { rowLimpio = limpiarJsonStr([row])[0]; } catch { continue; }
    const { error: e2 } = await supabase
      .from("usuarios_cache")
      .upsert([rowLimpio], { onConflict: "id" });
    if (e2) log(`  Saltando ${row.id}: ${e2.message}`);
    else ok++;
  }
  return ok;
}

// Trae y escribe todos los usuarios para un filtro dado
async function syncGrupo(fechaDesde, appType) {
  const label = appType === undefined ? "todos"
              : appType === null      ? "sin app"
              : appType;

  log(`── Grupo: ${label} ──`);

  const first = await fetchPage(1, fechaDesde, appType);
  log(`  totalCount API: ${first.totalCount.toLocaleString()}`);

  let allRows = first.datos.map(normalizar);
  let page = 2;

  if (first.datos.length >= BATCH_SIZE) {
    while (true) {
      const batch = [];
      for (let p = page; p < page + PARALLEL_REQ; p++) {
        batch.push(fetchPage(p, fechaDesde, appType));
      }
      const results = await Promise.all(batch);

      let done = false;
      for (const { datos } of results) {
        allRows.push(...datos.map(normalizar));
        if (datos.length < BATCH_SIZE) { done = true; break; }
      }

      log(`  Fetched: ${allRows.length.toLocaleString()}`);
      if (done) break;
      page += PARALLEL_REQ;
    }
  }

  log(`  Total traídos: ${allRows.length.toLocaleString()}`);

  let written = 0;
  for (let i = 0; i < allRows.length; i += UPSERT_CHUNK) {
    const chunk = allRows.slice(i, i + UPSERT_CHUNK);
    written += await upsertChunk(chunk);
  }

  log(`  Escritos: ${written.toLocaleString()}`);
  return written;
}

async function main() {
  const t0 = Date.now();
  log(`Iniciando sync ${FULL_SYNC ? "COMPLETO" : "INCREMENTAL"}${DRY_RUN ? " (DRY-RUN)" : ""}`);

  let totalWritten = 0;

  if (FULL_SYNC) {
    // Full sync: 4 grupos por appType para no superar el límite de la API
    // ios (~4k) + android (~29k) + web (~2) + null (~2k) = todos sin truncar
    for (const appType of ["ios", "android", "web", null]) {
      totalWritten += await syncGrupo(null, appType);
    }
  } else {
    // Incremental: últimos 7 días, sin split por appType (volumen bajo)
    const fechaDesde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    log(`Filtrando desde: ${fechaDesde.slice(0, 10)}`);
    totalWritten += await syncGrupo(fechaDesde, undefined);
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`Sync completado en ${elapsed}s · ${totalWritten.toLocaleString()} usuarios escritos`);

  if (!DRY_RUN) {
    const { data: resumen } = await supabase.from("v_usuarios_resumen").select("*").single();
    if (resumen) {
      log(`Estado tabla: Total=${Number(resumen.total).toLocaleString()} · Activos=${Number(resumen.activos).toLocaleString()} · Con DNI=${Number(resumen.con_dni).toLocaleString()}`);
    }
  }
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(0);
});
