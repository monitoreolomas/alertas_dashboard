import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_KEY;
const NOVIT_TOKEN       = "38ca1abbbd83712288d97e05fe7333d7b4544d98";
const SIRENAS_API       = "https://apis2.novit.gpesistemas.ar/monitoreo/sirenas";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAllSirenas() {
  const PAGE     = 100;
  const headers  = { Authorization: `Bearer ${NOVIT_TOKEN}` };
  const populate = encodeURIComponent(JSON.stringify([{ path: "localidad", select: "nombre" }]));

  const first      = await fetch(`${SIRENAS_API}?limit=${PAGE}&page=1&populate=${populate}`, { headers }).then(r => r.json());
  const total      = first.totalCount || 0;
  const totalPages = Math.ceil(total / PAGE);

  console.log(`Total en API: ${total} · Páginas: ${totalPages}`);

  let all = [...(first.datos || [])];

  for (let page = 2; page <= totalPages; page++) {
    const json = await fetch(`${SIRENAS_API}?limit=${PAGE}&page=${page}&populate=${populate}`, { headers }).then(r => r.json());
    all.push(...(json.datos || []));
    await new Promise(r => setTimeout(r, 80));
  }

  return Array.from(new Map(all.map(s => [s._id, s])).values());
}

function normalize(s) {
  return {
    id:                  s._id,
    chip_id:             s.chipId                  || null,
    activa:              s.activa                  ?? true,
    online:              s.online                  ?? false,
    modelo_sirena:       s.modeloSirena || s.tipo  || null,
    localidad_id:        s.localidad?._id || (typeof s.localidad === "string" ? s.localidad : null),
    localidad:           s.localidad?.nombre?.trim() || null,
    direccion:           s.direccionManual || s.direccionGps || null,
    lat:                 s.ubicacionGps?.lat ?? s.ubicacionManual?.lat ?? null,
    lng:                 s.ubicacionGps?.lng ?? s.ubicacionManual?.lng ?? null,
    fecha_online:        s.fechaOnline        || null,
    fecha_offline:       s.fechaOffline       || null,
    fecha_creacion:      s.createdAt          || null,
    rssi:                typeof s.rssi   === "number" ? s.rssi   : typeof s.senal === "number" ? s.senal : null,
    version_firmware:    s.datosSw?.version  || s.versionFirmware || null,
    acumulado_online:    s.acumuladoOnline    ?? null,
    acumulado_offline:   s.acumuladoOffline   ?? null,
    luz_encendida:       s.luzEncendida       ?? null,
    sonido_encendido:    s.sonidoEncendido    ?? null,
    actualizando:        s.actualizando       ?? null,
    error_actualizacion: s.errorActualizacion ?? null,
    error_sd:            s.errorSd            ?? null,
    ber:                 typeof s.ber    === "number" ? s.ber    : null,
    wakeup:              typeof s.wakeup === "number" ? s.wakeup : null,
    tipo:                s.tipo               || null,
    synced_at:           new Date().toISOString(),
  };
}

async function sync() {
  console.log("=== Sync sirenas iniciado ===");
  const raw  = await fetchAllSirenas();
  const rows = raw.map(normalize);
  console.log(`Normalizadas: ${rows.length} sirenas`);

  await supabase.rpc("truncate_sirenas_cache");
  console.log("Tabla truncada");

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("sirenas_cache").insert(batch);
    if (error) console.error(`Error batch ${i}:`, error.message);
    else console.log(`Insertadas ${i + batch.length}/${rows.length}`);
  }

  console.log("=== Sync completo ===");
}

sync().catch(e => { console.error(e); process.exit(1); });
