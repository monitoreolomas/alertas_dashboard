// ─── Fuente de datos (planilla publicada de Google Sheets, formato CSV) ───────
export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2PACX-1vRBFU12b6jgWRdNJbj5yKqKJ0iucps7HFJlkmKyjNi2DeccbtnnBM4aQEEbxKOAgKL78DUZJwFIJauX" +
  "/pub?gid=2079582736&single=true&output=csv";

const RIESGO_MAP = {
  Robo: 3,
  Hurto: 2,
  Heridos: 5,
  Obito: 5,
  Violencia: 4,
  Persecución: 3,
  "Accidente de tránsito": 2,
  Conflicto: 2,
  Incendios: 3,
  Otros: 1,
};

export const DIAS_ORDEN = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const TURNOS_ORDEN = ["Mañana", "Tarde", "Noche"];
const FRANJAS = ["00-03", "03-06", "06-09", "09-12", "12-15", "15-18", "18-21", "21-00"];

const RENOMBRES = {
  Categoria: "Categoría",
  Comisaria: "Comisaría",
  "Camara del Evento": "Cámara",
};

// Parser CSV mínimo con soporte de campos entre comillas (comas/saltos de línea incluidos).
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignorar, lo maneja el \n siguiente
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] ?? "").trim();
      });
      return obj;
    });
}

function parseTimestamp(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const [, d, mo, y, h, mi, se] = m;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(se || 0));
    return isNaN(dt.getTime()) ? null : dt;
  }

  // Fallback: serial de fecha de Excel/Google Sheets (días desde 1899-12-30).
  const num = Number(s);
  if (!isNaN(num) && num > 0) {
    const dt = new Date(Date.UTC(1899, 11, 30) + Math.round(num * 86400000));
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

// JS: 0=Domingo..6=Sábado → Python-style: 0=Lunes..6=Domingo
function weekdayLunesBase(date) {
  return (date.getDay() + 6) % 7;
}

function calcularTurno(hora, weekday) {
  if (weekday < 5) {
    if (hora >= 6 && hora < 14) return "Mañana";
    if (hora >= 14 && hora < 22) return "Tarde";
    return "Noche";
  }
  return hora >= 6 && hora < 18 ? "Mañana" : "Noche";
}

function calcularFranja(hora) {
  return FRANJAS[Math.min(Math.floor(hora / 3), 7)];
}

// Algunas filas de la planilla traen basura tipo "FALSE"/"TRUE" en columnas
// de texto (arrastre de una celda booleana mal alineada). Las tratamos como
// dato faltante en vez de mostrarlas como si fueran un valor real.
function limpiarTexto(valor, fallback) {
  const v = (valor || "").trim();
  if (!v || /^(true|false|null|undefined|nan|0)$/i.test(v)) return fallback;
  return v;
}

function fechaISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function derivarFilas(csvText) {
  const raw = parseCSV(csvText);
  if (!raw.length) return [];

  const headers = Object.keys(raw[0]);
  const colSubcategoriaUnica = headers.includes("Subcategoria");
  const colsSubcategoriaMultiples = headers.filter((h) => h.startsWith("Subcategoria "));

  const filas = [];
  for (const r0 of raw) {
    const ts = parseTimestamp(r0["Marca temporal"]);
    if (!ts) continue;

    const r = {};
    for (const [k, v] of Object.entries(r0)) r[RENOMBRES[k] || k] = v;

    let subcategoria = "";
    if (colSubcategoriaUnica) {
      subcategoria = r0["Subcategoria"] || "";
    } else {
      for (const c of colsSubcategoriaMultiples) {
        if (r0[c]) {
          subcategoria = r0[c];
          break;
        }
      }
    }

    const hora = ts.getHours();
    const weekday = weekdayLunesBase(ts);
    const categoria = r["Categoría"] || "Sin dato";

    filas.push({
      fecha: fechaISO(ts),
      mes: `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, "0")}`,
      hora,
      weekday,
      Turno: calcularTurno(hora, weekday),
      DiaNom: DIAS_ORDEN[weekday],
      TipoDia: weekday < 5 ? "Semana" : "Fin de semana",
      Franja: calcularFranja(hora),
      Categoría: categoria,
      Subcategoria: subcategoria,
      Comisaría: limpiarTexto(r["Comisaría"], "Sin dato"),
      CGM: limpiarTexto(r["CGM"], "Sin CGM"),
      con_camara: String(r["¿Se ve por cámara?"] || "").toUpperCase() === "SI",
      riesgo: RIESGO_MAP[categoria] ?? 1,
    });
  }
  return filas;
}

export async function fetchTarimaData() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`No se pudo descargar la planilla (HTTP ${res.status}).`);
  const text = await res.text();
  return derivarFilas(text);
}
