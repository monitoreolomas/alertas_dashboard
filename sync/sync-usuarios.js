#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// sync-usuarios.js
// Trae todos los usuarios activos de la API de Novit y los sincroniza
// en la tabla usuarios_cache de Supabase.
//
// Uso:
//   node sync-usuarios.js                  ← sync incremental (últimos 7 días)
//   node sync-usuarios.js --full           ← sync completo (todos los registros)
//   node sync-usuarios.js --full --dry-run ← simula sin escribir en Supabase
//
// Setup:
//   npm install @supabase/supabase-js node-fetch dotenv
//   cp .env.example .env   ← completar variables
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import "dotenv/config";

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;   // ← service_role key (no la anon)
const NOVIT_TOKEN   = process.env.NOVIT_TOKEN;
const VECINOS_API   = "https://apis2.novit.gpesistemas.ar/monitoreo/configvecinos";

const BATCH_SIZE    = 500;    // registros por página de Novit
const UPSERT_CHUNK  = 200;    // registros por upsert en Supabase
const PARALLEL_REQ  = 3;      // requests paralelos a Novit

const FULL_SYNC     = process.argv.includes("--full");
const DRY_RUN       = process.argv.includes("--dry-run");

// ─── Validación ───────────────────────────────────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_KEY || !NOVIT_TOKEN) {
  console.error("❌ Faltan variables de entorno. Ver .env.example");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`[${new Date().toLocaleTimeString("es-AR")}] ${msg}`);
}

function buildUrl(page, fechaDesde = null) {
  const filter = fechaDesde
    ? JSON.stringify({ $and: [{ activo: "true" }, { fechaCreacion: { $gte: fechaDesde } }] })
    : JSON.stringify({ $and: [{ activo: "true" }] });

  const populate = JSON.stringify([
    { path: "cliente",   select: "categoriaDefault", populate: { path: "categoriaDefault", select: "nombre" } },
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

// ─── Normalizar un usuario de Novit al esquema de Supabase ───────────────────
function normalizar(u) {
  let categoriaNombre = "Sin categoría";
  if (u?.categoria?.categoria?.nombre) {
    categoriaNombre = u.categoria.categoria.nombre;
  } else if (Array.isArray(u?.categoria) && u.categoria.length > 0) {
    categoriaNombre = u.categoria[0]?.categoria?.nombre || "Sin categoría";
  } else if (u?.cliente?.categoriaDefault?.nombre) {
    categoriaNombre = u.cliente.categoriaDefault.nombre;
  }

  const fechaNac = u?.datosPersonales?.fechaNacimiento?.slice(0, 10) || null;
  const fechaCreacion = u?.fechaCreacion || null;
  const fechaActualizacion = u?.fechaActualizacion || u?.updatedAt || null;

  return {
    id:                   u._id,
    usuario:              u.usuario || null,
    nombre:               u?.datosPersonales?.nombre   || null,
    apellido:             u?.datosPersonales?.apellido || null,
    sexo:                 u?.datosPersonales?.sexo ?? null,   // true/false/null
    fecha_nacimiento:     fechaNac,
    dni_escaneado:        u?.dniEscaneado === true || u?.dniEscaneado === "true",
    categoria_nombre:     categoriaNombre,
    localidad:            u?.direccion?.localidad?.nombre || u?.localidad || null,
    barrio:               u?.direccion?.barrio?.nombre   || null,
    app_type:             u?.appType || null,
    activo:               u?.activo === true || u?.activo === "true",
    fecha_creacion:       fechaCreacion,
    fecha_actualizacion:  fechaActualizacion,
    synced_at:            new Date().toISOString(),
  };
}

// ─── Fetch paginado con reintentos ────────────────────────────────────────────
async function fetchPage(page, fechaDesde, intentos = 3) {
  const url = buildUrl(page, fechaDesde);
  const headers = { Authorization: `Bearer ${NOVIT_TOKEN}` };

  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return {
        datos:      json.datos || [],
        totalCount: json.totalCount || 0,
      };
    } catch (err) {
      if (i === intentos - 1) throw err;
      log(`⚠ Página ${page} falló (intento ${i + 1}/${intentos}): ${err.message}. Reintentando...`);
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

// ─── Upsert en chunks ─────────────────────────────────────────────────────────
async function upsertChunk(rows) {
  if (DRY_RUN) {
    log(`  [DRY-RUN] Simularía upsert de ${rows.length} filas`);
    return;
  }
  const { error } = await supabase
    .from("usuarios_cache")
    .upsert(rows, { onConflict: "id" });

  if (error) throw new Error(`Supabase upsert error: ${error.message}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  log(`🚀 Iniciando sync ${FULL_SYNC ? "COMPLETO" : "INCREMENTAL"}${DRY_RUN ? " (DRY-RUN)" : ""}`);

  // En sync incremental: últimos 7 días (con superposición para no perder nada)
  const fechaDesde = FULL_SYNC
    ? null
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  if (fechaDesde) log(`📅 Filtrando desde: ${fechaDesde.slice(0, 10)}`);

  // Primera página para obtener el total
  log("📡 Consultando primera página...");
  const first = await fetchPage(1, fechaDesde);
  const totalCount  = first.totalCount;
  const totalPages  = Math.ceil(totalCount / BATCH_SIZE);

  log(`📊 Total registros: ${totalCount.toLocaleString()} → ${totalPages} páginas`);

  let allRows = first.datos.map(normalizar);
  let processed = first.datos.length;

  // Páginas restantes en paralelo por lotes
  for (let page = 2; page <= totalPages; page += PARALLEL_REQ) {
    const pagesToFetch = [];
    for (let p = page; p < page + PARALLEL_REQ && p <= totalPages; p++) {
      pagesToFetch.push(p);
    }

    const results = await Promise.all(
      pagesToFetch.map(p => fetchPage(p, fechaDesde))
    );

    for (const { datos } of results) {
      allRows.push(...datos.map(normalizar));
      processed += datos.length;
    }

    const pct = ((processed / totalCount) * 100).toFixed(0);
    log(`  ↳ Fetched: ${processed.toLocaleString()} / ${totalCount.toLocaleString()} (${pct}%)`);
  }

  log(`✅ Fetch completo: ${allRows.length.toLocaleString()} usuarios normalizados`);

  // Upsert en Supabase por chunks
  log("💾 Escribiendo en Supabase...");
  let written = 0;

  for (let i = 0; i < allRows.length; i += UPSERT_CHUNK) {
    const chunk = allRows.slice(i, i + UPSERT_CHUNK);
    await upsertChunk(chunk);
    written += chunk.length;

    if (written % 1000 === 0 || written === allRows.length) {
      log(`  ↳ Upserted: ${written.toLocaleString()} / ${allRows.length.toLocaleString()}`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`🎉 Sync completado en ${elapsed}s · ${allRows.length.toLocaleString()} usuarios`);

  // Resumen final desde Supabase
  if (!DRY_RUN) {
    const { data: resumen } = await supabase.from("v_usuarios_resumen").select("*").single();
    if (resumen) {
      log(`📈 Estado de la tabla:`);
      log(`   Total: ${Number(resumen.total).toLocaleString()}`);
      log(`   Activos: ${Number(resumen.activos).toLocaleString()}`);
      log(`   Con DNI: ${Number(resumen.con_dni).toLocaleString()}`);
      log(`   Altas este mes: ${Number(resumen.altas_mes_actual).toLocaleString()}`);
    }
  }
}

main().catch(err => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});
