import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgyNDYsImV4cCI6MjA5NDk1NDI0Nn0.NvCxB2sXVxa4kQVGiVPs6_x1cinRi4UFpBJud6sx1Nw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CAT_COLORS = {
  "Ambulancia":        "#38bdf8",
  "Policía":           "#818cf8",
  "Bomberos":          "#fb923c",
  "Sirena":            "#34d399",
  "Violencia de Género":"#f472b6",
  "default":           "#94a3b8",
};
function catColor(cat) {
  return CAT_COLORS[cat] || CAT_COLORS.default;
}

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getHour(horario) {
  if (!horario) return null;
  return parseInt(horario.split(":")[0], 10);
}

function getTurno(hora, esFinde) {
  if (hora === null) return "Sin dato";
  const corte = esFinde ? 12 : 8;
  if (hora >= 6 && hora < 6 + corte)       return "Mañana";
  if (hora >= 6 + corte && hora < 6 + corte * 2) return "Tarde";
  return "Noche";
}

function isFinde(fechaStr) {
  const d = new Date(fechaStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function pct(a, b) {
  if (!b) return null;
  const v = ((a - b) / b) * 100;
  return v.toFixed(1);
}

function groupBy(arr, key) {
  return arr.reduce((acc, row) => {
    const k = row[key] ?? "Sin dato";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function topN(obj, n = 10) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

// ─── SVG MINI CHARTS ─────────────────────────────────────────────────────────
function Sparkline({ values, color = "#38bdf8", w = 100, h = 28 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = values[values.length - 1];
  const lastX = w;
  const lastY = h - 2 - ((last - min) / range) * (h - 4);
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#g${color.replace("#","")})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
}

function HBar({ label, value, max, color, total }) {
  const pctVal = max > 0 ? (value / max) * 100 : 0;
  const pctTotal = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#cbd5e1", fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>
          {fmt(value)} <span style={{ color: "#475569" }}>({pctTotal}%)</span>
        </span>
      </div>
      <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pctVal}%`,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          borderRadius: 3,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
}

function Heatmap({ matrix, rowLabels, colLabels }) {
  const allVals = matrix.flat();
  const max = Math.max(...allVals, 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `56px repeat(${colLabels.length}, 1fr)`, gap: 2, minWidth: 400 }}>
        {/* header */}
        <div />
        {colLabels.map(l => (
          <div key={l} style={{ fontSize: 9, color: "#475569", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", paddingBottom: 4 }}>{l}</div>
        ))}
        {/* rows */}
        {rowLabels.map((row, ri) => (
          <>
            <div key={`l${ri}`} style={{ fontSize: 9, color: "#64748b", display: "flex", alignItems: "center", fontFamily: "'IBM Plex Mono', monospace" }}>{row}</div>
            {colLabels.map((_, ci) => {
              const v = matrix[ri][ci];
              const intensity = v / max;
              const bg = `rgba(56,189,248,${0.04 + intensity * 0.86})`;
              return (
                <div key={`c${ri}-${ci}`} style={{
                  background: bg, borderRadius: 2, aspectRatio: "1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: intensity > 0.5 ? "#f0f9ff" : "#475569",
                  fontFamily: "'IBM Plex Mono', monospace", cursor: "default",
                  transition: "background 0.2s",
                }} title={`${row} ${colLabels[ci]}: ${v}`}>
                  {v > 0 ? v : ""}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, delta, sparkValues, color = "#38bdf8", icon }) {
  const dNum = parseFloat(delta);
  const isPos = dNum > 0;
  const isNeg = dNum < 0;
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      border: "1px solid #1e293b",
      borderTop: `2px solid ${color}`,
      borderRadius: 12,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
        pointerEvents: "none"
      }} />
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10 }}>{sub}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {delta != null ? (
          <div style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            color: isNeg ? "#ef4444" : isPos ? "#34d399" : "#64748b",
            background: isNeg ? "#ef444418" : isPos ? "#34d39918" : "transparent",
            padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4
          }}>
            {isPos ? "▲" : isNeg ? "▼" : "●"} {Math.abs(dNum)}% vs período ant.
          </div>
        ) : <div />}
        {sparkValues && <Sparkline values={sparkValues} color={color} />}
      </div>
    </div>
  );
}

// ─── FILTERS ─────────────────────────────────────────────────────────────────
function Filters({ filters, setFilters, options }) {
  const input = { background: "#0f172a", border: "1px solid #1e293b", color: "#cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", outline: "none", width: "100%" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
      {[["fechaDesde","Desde","date"],["fechaHasta","Hasta","date"]].map(([k,l,t]) => (
        <div key={k}>
          <label style={{ fontSize: 10, color: "#475569", display: "block", marginBottom: 4, letterSpacing: "0.1em", fontFamily: "'IBM Plex Mono', monospace" }}>{l.toUpperCase()}</label>
          <input type={t} value={filters[k]} onChange={e => setFilters(f => ({...f,[k]:e.target.value}))} style={input} />
        </div>
      ))}
      {[["cgm","CGM / Zona","cgms"],["categoria","Categoría","categorias"],["tipo","Tipo","tipos"]].map(([k,l,opt]) => (
        <div key={k}>
          <label style={{ fontSize: 10, color: "#475569", display: "block", marginBottom: 4, letterSpacing: "0.1em", fontFamily: "'IBM Plex Mono', monospace" }}>{l.toUpperCase()}</label>
          <select value={filters[k]} onChange={e => setFilters(f => ({...f,[k]:e.target.value}))} style={input}>
            <option value="">Todos</option>
            {(options[opt] || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <button onClick={() => setFilters({ fechaDesde:"", fechaHasta:"", cgm:"", categoria:"", tipo:"" })}
          style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: "pointer", letterSpacing: "0.08em" }}>
          ↺ LIMPIAR
        </button>
      </div>
    </div>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function ViewEjecutivo({ data, prevData }) {
  // Total alertas
  const total = data.length;
  const totalPrev = prevData.length;

  // Por día para sparkline (últimos 30 días)
  const byDay = useMemo(() => {
    const counts = {};
    data.forEach(r => { counts[r.fecha] = (counts[r.fecha] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => a[0].localeCompare(b[0])).map(([,v]) => v);
  }, [data]);

  // Categorías
  const byCat = useMemo(() => groupBy(data, "categoria"), [data]);
  const topCats = topN(byCat, 20);
  const catMax = Math.max(...topCats.map(([,v]) => v), 1);

  // Tipo Sistema vs Botmarket
  const bySistema = data.filter(r => r.tipo === "Sistema").length;
  const byBot = data.filter(r => r.tipo === "Botmarket").length;

  // Hora pico global
  const byHour = useMemo(() => {
    const h = Array(24).fill(0);
    data.forEach(r => { const hh = getHour(r.horario); if (hh !== null) h[hh]++; });
    return h;
  }, [data]);
  const horaPico = byHour.indexOf(Math.max(...byHour));

  // Turno más cargado
  const byTurno = useMemo(() => {
    const t = { Mañana: 0, Tarde: 0, Noche: 0 };
    data.forEach(r => {
      const h = getHour(r.horario);
      const turno = getTurno(h, isFinde(r.fecha));
      t[turno] = (t[turno] || 0) + 1;
    });
    return t;
  }, [data]);
  const turnoMax = Object.entries(byTurno).sort((a,b) => b[1]-a[1])[0];

  // Día de semana más activo
  const byDow = useMemo(() => {
    const d = Array(7).fill(0);
    data.forEach(r => {
      if (!r.fecha) return;
      const dow = new Date(r.fecha + "T00:00:00").getDay();
      d[dow]++;
    });
    return d;
  }, [data]);
  const dowMax = byDow.indexOf(Math.max(...byDow));

  // Promedio diario
  const uniqueDays = new Set(data.map(r => r.fecha)).size;
  const promDiario = uniqueDays > 0 ? (total / uniqueDays).toFixed(1) : "—";

  // Distribución finde vs semana
  const finde = data.filter(r => isFinde(r.fecha)).length;
  const semana = total - finde;

  const kpiColor = ["#38bdf8","#818cf8","#34d399","#fb923c","#f472b6","#facc15"];

  return (
    <div>
      {/* KPIs row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        <KPI label="Total Alertas" value={fmt(total)} sub={`${uniqueDays} días con registros`}
          delta={pct(total, totalPrev)} sparkValues={byDay.slice(-14)} color="#38bdf8" icon="📡" />
        <KPI label="Promedio Diario" value={promDiario} sub="alertas por día activo"
          color="#818cf8" icon="📊" />
        <KPI label="Hora Pico" value={`${String(horaPico).padStart(2,"0")}:00`}
          sub={`${byHour[horaPico]} alertas en esa hora`} color="#fb923c" icon="⏰" />
        <KPI label="Turno Líder" value={turnoMax?.[0] || "—"}
          sub={`${fmt(turnoMax?.[1])} alertas (${total > 0 ? ((turnoMax?.[1]/total)*100).toFixed(0) : 0}%)`}
          color="#34d399" icon="🔄" />
        <KPI label="Día Más Activo" value={DIAS[dowMax]}
          sub={`${fmt(byDow[dowMax])} alertas históricas`} color="#f472b6" icon="📅" />
        <KPI label="Finde / Semana" value={`${total > 0 ? ((finde/total)*100).toFixed(0) : 0}% finde`}
          sub={`${fmt(finde)} fin de semana · ${fmt(semana)} hábil`} color="#facc15" icon="🗓" />
      </div>

      {/* Distribución por categoría + tipo */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Categorias */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>DISTRIBUCIÓN POR CATEGORÍA</div>
          {topCats.map(([cat, val]) => (
            <HBar key={cat} label={cat} value={val} max={catMax} color={catColor(cat)} total={total} />
          ))}
        </div>

        {/* Tipo + turnos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tipo */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", flex: 1 }}>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>ORIGEN</div>
            {[["Sistema", bySistema, "#38bdf8"], ["Botmarket", byBot, "#fb923c"]].map(([t,v,c]) => (
              <HBar key={t} label={t} value={v} max={Math.max(bySistema,byBot,1)} color={c} total={total} />
            ))}
          </div>
          {/* Turnos */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", flex: 1 }}>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>POR TURNO</div>
            {Object.entries(byTurno).map(([t,v],i) => (
              <HBar key={t} label={t} value={v} max={Math.max(...Object.values(byTurno),1)} color={kpiColor[i]} total={total} />
            ))}
          </div>
        </div>
      </div>

      {/* Serie diaria */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>EVOLUCIÓN DIARIA</div>
        <DailyChart data={data} />
      </div>
    </div>
  );
}

function DailyChart({ data }) {
  const byDay = useMemo(() => {
    const counts = {};
    data.forEach(r => { if (r.fecha) counts[r.fecha] = (counts[r.fecha] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => a[0].localeCompare(b[0]));
  }, [data]);

  if (byDay.length === 0) return <div style={{ color: "#475569", fontSize: 12 }}>Sin datos</div>;

  const values = byDay.map(([,v]) => v);
  const max = Math.max(...values, 1);
  const w = 800, h = 120, pad = 8;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - ((v / max) * (h - pad * 2));
    return [x, y];
  });

  const polyline = pts.map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`;

  // labels: show every ~10 points
  const step = Math.max(1, Math.floor(values.length / 8));

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 120 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline points={polyline} fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" />
        {pts.filter((_, i) => i % step === 0).map(([x, y], i) => {
          const idx = i * step;
          const [fecha] = byDay[idx];
          const d = new Date(fecha + "T00:00:00");
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="2.5" fill="#38bdf8" opacity="0.7" />
              <text x={x} y={h - 1} textAnchor="middle" fontSize="7" fill="#475569" fontFamily="IBM Plex Mono">{DIAS[d.getDay()]} {d.getDate()}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ViewTemporal({ data }) {
  // Heatmap hora x día de semana
  const heatmap = useMemo(() => {
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    data.forEach(r => {
      const h = getHour(r.horario);
      if (h === null || !r.fecha) return;
      const dow = new Date(r.fecha + "T00:00:00").getDay();
      matrix[dow][h]++;
    });
    return matrix;
  }, [data]);

  // Por mes
  const byMes = useMemo(() => {
    const m = {};
    data.forEach(r => {
      if (!r.fecha) return;
      const d = new Date(r.fecha + "T00:00:00");
      const k = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => {
      const [ma, ya] = a[0].split(" ");
      const [mb, yb] = b[0].split(" ");
      return (parseInt(ya)*12+MESES.indexOf(ma)) - (parseInt(yb)*12+MESES.indexOf(mb));
    });
  }, [data]);

  // Por hora distribución
  const byHour = useMemo(() => {
    const h = Array(24).fill(0);
    data.forEach(r => { const hh = getHour(r.horario); if (hh !== null) h[hh]++; });
    return h;
  }, [data]);
  const maxHour = Math.max(...byHour, 1);

  // Semana vs Finde por categoría
  const catFindeVsSem = useMemo(() => {
    const d = {};
    data.forEach(r => {
      const cat = r.categoria || "Sin dato";
      if (!d[cat]) d[cat] = { sem: 0, fin: 0 };
      if (isFinde(r.fecha)) d[cat].fin++;
      else d[cat].sem++;
    });
    return Object.entries(d).sort((a,b) => (b[1].sem+b[1].fin)-(a[1].sem+a[1].fin)).slice(0,8);
  }, [data]);

  const colHours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2,"0"));

  return (
    <div>
      {/* Heatmap hora x día */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>HEATMAP · DÍA DE SEMANA × HORA</div>
        <div style={{ fontSize: 10, color: "#334155", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>Intensidad = cantidad de alertas en ese cruce</div>
        <Heatmap matrix={heatmap} rowLabels={DIAS} colLabels={colHours} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Distribución por hora (bar) */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>ALERTAS POR HORA DEL DÍA</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
            {byHour.map((v, h) => {
              const heightPct = (v / maxHour) * 100;
              const isTurno = (h >= 6 && h < 14) ? "#38bdf8" : (h >= 14 && h < 22) ? "#818cf8" : "#fb923c";
              return (
                <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{
                    width: "100%", height: `${Math.max(2, heightPct)}%`,
                    background: isTurno, borderRadius: "2px 2px 0 0", opacity: 0.85,
                    transition: "height 0.4s"
                  }} title={`${String(h).padStart(2,"0")}:00 → ${v}`} />
                  {h % 6 === 0 && <span style={{ fontSize: 7, color: "#475569", fontFamily: "monospace" }}>{String(h).padStart(2,"0")}</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["#38bdf8","Mañana"],["#818cf8","Tarde"],["#fb923c","Noche"]].map(([c,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por mes */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>EVOLUCIÓN MENSUAL</div>
          {byMes.length === 0 ? <div style={{ color: "#475569", fontSize: 12 }}>Sin datos</div> : (
            <>
              {byMes.map(([mes, val]) => (
                <HBar key={mes} label={mes} value={val} max={Math.max(...byMes.map(([,v])=>v),1)} color="#818cf8" total={data.length} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Semana vs Finde por categoría */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>SEMANA HÁBIL vs. FIN DE SEMANA · POR CATEGORÍA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {catFindeVsSem.map(([cat, { sem, fin }]) => {
            const total = sem + fin;
            const pctFin = total > 0 ? ((fin/total)*100).toFixed(0) : 0;
            const c = catColor(cat);
            return (
              <div key={cat} style={{ background: "#0c1421", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#cbd5e1", fontFamily: "'IBM Plex Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat}</span>
                </div>
                <div style={{ display: "flex", gap: 0, height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${100-pctFin}%`, background: c }} />
                  <div style={{ width: `${pctFin}%`, background: `${c}55` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>
                  <span>Hábil: {fmt(sem)}</span>
                  <span>Finde: {fmt(fin)} ({pctFin}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ViewCGM({ data }) {
  const byCgm = useMemo(() => groupBy(data, "cgm"), [data]);
  const topCgms = topN(byCgm, 15);
  const cgmMax = Math.max(...topCgms.map(([,v])=>v), 1);

  // Categoría principal por CGM
  const cgmCatPrincipal = useMemo(() => {
    const d = {};
    data.forEach(r => {
      const cgm = r.cgm || "Sin dato";
      const cat = r.categoria || "Sin dato";
      if (!d[cgm]) d[cgm] = {};
      d[cgm][cat] = (d[cgm][cat] || 0) + 1;
    });
    const result = {};
    Object.entries(d).forEach(([cgm, cats]) => {
      result[cgm] = Object.entries(cats).sort((a,b) => b[1]-a[1])[0];
    });
    return result;
  }, [data]);

  // Hora pico por CGM (top 8)
  const cgmHoraPico = useMemo(() => {
    const d = {};
    data.forEach(r => {
      const cgm = r.cgm || "Sin dato";
      const h = getHour(r.horario);
      if (h === null) return;
      if (!d[cgm]) d[cgm] = Array(24).fill(0);
      d[cgm][h]++;
    });
    const result = {};
    Object.entries(d).forEach(([cgm, hrs]) => {
      result[cgm] = hrs.indexOf(Math.max(...hrs));
    });
    return result;
  }, [data]);

  // Promedio diario por CGM
  const cgmPromDiario = useMemo(() => {
    const byDate = {};
    data.forEach(r => {
      if (!r.cgm || !r.fecha) return;
      const k = `${r.cgm}|${r.fecha}`;
      byDate[k] = true;
    });
    const dias = {};
    Object.keys(byDate).forEach(k => {
      const [cgm] = k.split("|");
      dias[cgm] = (dias[cgm] || 0) + 1;
    });
    const result = {};
    Object.entries(byCgm).forEach(([cgm, total]) => {
      result[cgm] = dias[cgm] ? (total / dias[cgm]).toFixed(1) : total;
    });
    return result;
  }, [data, byCgm]);

  // Stacked mini por categoría para top CGMs
  const cgmCatDist = useMemo(() => {
    const d = {};
    const cats = [...new Set(data.map(r => r.categoria))].filter(Boolean);
    data.forEach(r => {
      const cgm = r.cgm || "Sin dato";
      if (!d[cgm]) d[cgm] = {};
      const cat = r.categoria || "Sin dato";
      d[cgm][cat] = (d[cgm][cat] || 0) + 1;
    });
    return { d, cats };
  }, [data]);

  const total = data.length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Ranking CGMs */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>RANKING DE ZONAS · TOP 15</div>
          {topCgms.map(([cgm, val], i) => (
            <HBar key={cgm} label={`${String(i+1).padStart(2,"0")}. ${cgm}`} value={val} max={cgmMax} color="#38bdf8" total={total} />
          ))}
        </div>

        {/* Tabla detalle */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px", overflowX: "auto" }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>DETALLE POR ZONA</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Zona","Total","Prom/día","Cat. principal","Hora pico"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "4px 8px", color: "#475569", fontWeight: 400, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCgms.map(([cgm, val]) => {
                const [catMain, catVal] = cgmCatPrincipal[cgm] || ["—", 0];
                const c = catColor(catMain);
                return (
                  <tr key={cgm} style={{ borderBottom: "1px solid #0f172a" }}>
                    <td style={{ padding: "6px 8px", color: "#cbd5e1", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cgm}</td>
                    <td style={{ padding: "6px 8px", color: "#38bdf8" }}>{fmt(val)}</td>
                    <td style={{ padding: "6px 8px", color: "#64748b" }}>{cgmPromDiario[cgm]}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{ background: `${c}22`, color: c, borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>{catMain}</span>
                    </td>
                    <td style={{ padding: "6px 8px", color: "#fb923c" }}>
                      {cgmHoraPico[cgm] !== undefined ? `${String(cgmHoraPico[cgm]).padStart(2,"0")}:00` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribución stacked por categoría para cada CGM */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.12em", marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace" }}>COMPOSICIÓN POR CATEGORÍA · TOP 10 ZONAS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topCgms.slice(0,10).map(([cgm, total]) => {
            const catDist = cgmCatDist.d[cgm] || {};
            const sorted = Object.entries(catDist).sort((a,b) => b[1]-a[1]);
            return (
              <div key={cgm} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: "#64748b", width: 120, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cgm}</span>
                <div style={{ flex: 1, height: 14, borderRadius: 3, overflow: "hidden", display: "flex", gap: 1 }}>
                  {sorted.map(([cat, val]) => (
                    <div key={cat} style={{
                      flex: val,
                      background: catColor(cat),
                      transition: "flex 0.4s"
                    }} title={`${cat}: ${val}`} />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: "#475569", width: 40, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{fmt(total)}</span>
              </div>
            );
          })}
        </div>
        {/* leyenda */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
          {Object.entries(CAT_COLORS).filter(([k]) => k !== "default").map(([cat, c]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("ejecutivo");
  const [filters, setFilters] = useState({ fechaDesde: "", fechaHasta: "", cgm: "", categoria: "", tipo: "" });
  const [loadProgress, setLoadProgress] = useState(0);

  // Load all data in pages
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const PAGE = 10000;
      let offset = 0;
      let all = [];
      try {
        while (true) {
          const { data, error: err } = await supabase
            .from("alertas")
            .select("tipo,fecha,horario,cgm,categoria")
            .range(offset, offset + PAGE - 1)
            .order("fecha", { ascending: false });
          if (err) throw err;
          if (!data || data.length === 0) break;
          all = all.concat(data);
          setLoadProgress(all.length);
          if (data.length < PAGE) break;
          offset += PAGE;
        }
        setAllData(all);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Options for filters
  const options = useMemo(() => ({
    cgms: [...new Set(allData.map(r => r.cgm).filter(Boolean))].sort(),
    categorias: [...new Set(allData.map(r => r.categoria).filter(Boolean))].sort(),
    tipos: [...new Set(allData.map(r => r.tipo).filter(Boolean))].sort(),
  }), [allData]);

  // Date range for previous period comparison
  const filteredData = useMemo(() => {
    return allData.filter(r => {
      if (filters.fechaDesde && r.fecha < filters.fechaDesde) return false;
      if (filters.fechaHasta && r.fecha > filters.fechaHasta) return false;
      if (filters.cgm && r.cgm !== filters.cgm) return false;
      if (filters.categoria && r.categoria !== filters.categoria) return false;
      if (filters.tipo && r.tipo !== filters.tipo) return false;
      return true;
    });
  }, [allData, filters]);

  // Previous period (same duration, shifted back)
  const prevData = useMemo(() => {
    if (!filters.fechaDesde || !filters.fechaHasta) return [];
    const d1 = new Date(filters.fechaDesde + "T00:00:00");
    const d2 = new Date(filters.fechaHasta + "T00:00:00");
    const dur = d2 - d1;
    const pD2 = new Date(d1 - 1);
    const pD1 = new Date(pD2 - dur);
    const pD1s = pD1.toISOString().slice(0,10);
    const pD2s = pD2.toISOString().slice(0,10);
    return allData.filter(r => r.fecha >= pD1s && r.fecha <= pD2s);
  }, [allData, filters]);

  const TABS = [
    { id: "ejecutivo", label: "Ejecutivo", icon: "◈" },
    { id: "temporal",  label: "Temporal",  icon: "◷" },
    { id: "cgm",       label: "Por Zona",  icon: "◉" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d16; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#060d16", color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace" }}>

        {/* Header */}
        <div style={{
          borderBottom: "1px solid #1e293b",
          background: "linear-gradient(180deg, #0a1628 0%, #060d16 100%)",
          padding: "0 32px",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #38bdf8, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>CENTRO DE GESTIÓN MUNICIPAL</div>
                <div style={{ fontSize: 9, color: "#334155", letterSpacing: "0.2em" }}>ANÁLISIS OPERATIVO DE ALERTAS</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#334155", textAlign: "right" }}>
              <div>{loading ? `Cargando… ${loadProgress.toLocaleString()} registros` : `${allData.length.toLocaleString()} registros · ${filteredData.length.toLocaleString()} con filtros`}</div>
              <div style={{ marginTop: 2, color: "#1e293b" }}>{new Date().toLocaleDateString("es-AR", { day:"2-digit", month:"short", year:"numeric" })}</div>
            </div>
          </div>
        </div>

        {/* Loading bar */}
        {loading && (
          <div style={{ height: 2, background: "#0f172a" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #38bdf8, #818cf8)", width: "60%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        )}

        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 32px" }}>

          {error && (
            <div style={{ background: "#1c0a0a", border: "1px solid #ef444444", borderRadius: 10, padding: 16, color: "#ef4444", fontSize: 12, marginBottom: 20 }}>
              ⚠ Error al conectar con Supabase: {error}
            </div>
          )}

          {/* Filters */}
          <Filters filters={filters} setFilters={setFilters} options={options} />

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: "1px solid #1e293b", paddingBottom: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setView(t.id)} style={{
                background: view === t.id ? "#0f172a" : "transparent",
                border: "1px solid",
                borderColor: view === t.id ? "#1e293b" : "transparent",
                borderBottom: view === t.id ? "2px solid #38bdf8" : "2px solid transparent",
                color: view === t.id ? "#f1f5f9" : "#475569",
                borderRadius: "8px 8px 0 0",
                padding: "10px 20px",
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.1em",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.15s",
              }}>
                <span style={{ color: view === t.id ? "#38bdf8" : "#334155" }}>{t.icon}</span>
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* View content */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 16 }}>
              <div style={{ fontSize: 32, opacity: 0.3 }}>⚡</div>
              <div style={{ fontSize: 12, color: "#334155" }}>Cargando {loadProgress.toLocaleString()} registros…</div>
            </div>
          ) : (
            <>
              {view === "ejecutivo" && <ViewEjecutivo data={filteredData} prevData={prevData} />}
              {view === "temporal"  && <ViewTemporal data={filteredData} />}
              {view === "cgm"       && <ViewCGM data={filteredData} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
