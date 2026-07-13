import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import * as XLSX from "xlsx";
import { T } from "./theme.js";
import { DIAS_ORDEN, TURNOS_ORDEN } from "./tarimaData.js";

const SEQ_DIV = [T.green, T.accent, T.amber, T.red, "#38bdf8", "#f472b6", "#a3e635"];
const RANK_COLORS = [T.red, T.amber, T.accent, "#4c1d95"];

const RIESGO_LABEL_COLOR = (r) => (r >= 4 ? T.red : r === 3 ? T.amber : T.accent);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("es-AR");
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function colorScale(stops, t) {
  t = Math.max(0, Math.min(1, isNaN(t) ? 0 : t));
  const n = stops.length - 1;
  const seg = Math.min(Math.floor(t * n), n - 1);
  const localT = t * n - seg;
  const c0 = hexToRgb(stops[seg]);
  const c1 = hexToRgb(stops[seg + 1]);
  return rgbToHex(c0.map((v, i) => v + (c1[i] - v) * localT));
}

function addDaysISO(iso, delta) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
function diffDaysISO(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000);
}
function rangoFechas(d0, d1) {
  const out = [];
  let cur = d0;
  let guard = 0;
  while (cur <= d1 && guard < 5000) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
    guard++;
  }
  return out;
}

function contar(rows, key) {
  const acc = {};
  for (const r of rows) {
    const k = r[key] || "Sin dato";
    acc[k] = (acc[k] || 0) + 1;
  }
  return acc;
}
function topOrdenado(counts, n = 9999) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, value]) => ({ label, value }));
}

// ─── SUB-COMPONENTES DE UI ────────────────────────────────────────────────────
function Kpi({ icon, label, value, delta, sub, invert }) {
  let deltaEl = null;
  if (delta != null) {
    let color, arrow;
    if (delta > 0) {
      color = invert ? T.red : T.green;
      arrow = "▲";
    } else if (delta < 0) {
      color = invert ? T.green : T.red;
      arrow = "▼";
    } else {
      color = T.muted;
      arrow = "●";
    }
    deltaEl = (
      <div style={{ fontSize: 11, fontWeight: 600, color }}>
        {arrow} {Math.abs(delta).toFixed(1)}% vs período ant.
      </div>
    );
  }
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${T.accent},${T.accent2})` }} />
      <div style={{ fontSize: 20, marginBottom: 4, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 11, color: T.text2, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 25, fontWeight: 800, color: T.text, margin: "3px 0", lineHeight: 1.15 }}>{value}</div>
      {deltaEl}
      {sub && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ title, icon, children, style = {} }) {
  return (
    <div style={{ background: T.card, border: "1px solid rgba(139,92,246,0.14)", borderRadius: 16, padding: "16px 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", ...style }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid rgba(139,92,246,0.15)", paddingBottom: 8, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
        {icon && <span>{icon}</span>}
        {title}
      </div>
      {children}
    </div>
  );
}

function MultiSelect({ label, options, value, onChange, placeholder = "Todos" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  function toggle(opt) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }
  const labelTxt = value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value.length} seleccionados`;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ fontSize: 11, color: T.text2, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 5, display: "block" }}>{label}</label>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", textAlign: "left", background: "#0d0d1f", border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "7px 10px", fontSize: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Inter',sans-serif" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{labelTxt}</span>
        <span style={{ color: T.muted, fontSize: 10 }}>▼</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, maxHeight: 220, overflowY: "auto", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
          {options.length === 0 && <div style={{ padding: "8px 10px", fontSize: 11, color: T.muted }}>Sin opciones</div>}
          {options.map((opt) => (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 12, color: T.text2, cursor: "pointer" }}>
              <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function BarRanking({ items, colorFn, total, showPct = true }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  if (!items.length) return <div style={{ color: T.muted, fontSize: 11 }}>Sin datos</div>;
  return (
    <div>
      {items.map((it, i) => {
        const pct = total ? ((it.value / total) * 100).toFixed(0) : null;
        return (
          <div key={it.label} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: T.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>{it.label}</span>
              <span style={{ fontSize: 11, color: T.muted, whiteSpace: "nowrap" }}>
                {fmt(it.value)}
                {showPct && pct != null ? ` (${pct}%)` : ""}
              </span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(it.value / max) * 100}%`, background: colorFn(it, i), borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeatGrid({ matrix, rowLabels, colLabels }) {
  if (!rowLabels.length || !colLabels.length) return <div style={{ color: T.muted, fontSize: 11 }}>Sin datos</div>;
  const max = Math.max(...matrix.flat(), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `72px repeat(${colLabels.length},1fr)`, gap: 2, minWidth: 260 }}>
        <div />
        {colLabels.map((l) => (
          <div key={l} style={{ fontSize: 9, color: T.muted, textAlign: "center", paddingBottom: 4 }}>{l}</div>
        ))}
        {rowLabels.map((row, ri) => (
          <Fragment key={row}>
            <div style={{ fontSize: 10, color: T.text2, display: "flex", alignItems: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row}</div>
            {colLabels.map((_, ci) => {
              const v = matrix[ri][ci];
              const t = v / max;
              const bg = t < 0.02 ? "rgba(255,255,255,0.03)" : `rgba(139,92,246,${0.1 + t * 0.8})`;
              return (
                <div key={ci} style={{ background: bg, borderRadius: 3, aspectRatio: "1.5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: t > 0.5 ? "#fff" : T.muted }}>
                  {v > 0 ? v : ""}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Donut({ data }) {
  const totalReal = data.reduce((a, b) => a + b.value, 0);
  const total = totalReal || 1;
  const r = 62, cx = 90, cy = 90, strokeW = 24;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map((d, i) => {
    const frac = d.value / total;
    const dash = frac * circ;
    const seg = { color: SEQ_DIV[i % SEQ_DIV.length], dash, gap: circ - dash, offset: -acc, pct: frac * 100 };
    acc += dash;
    return { ...d, ...seg };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
        {segs.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW} strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={s.offset} transform={`rotate(-90 ${cx} ${cy})`} />
        ))}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize="18" fontWeight="800" fill={T.text}>{fmt(totalReal)}</text>
        <text x={cx} y={cy + 15} textAnchor="middle" fontSize="9" fill={T.muted}>Total</text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {segs.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.text2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            {s.label} · {s.pct.toFixed(0)}%
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedBars({ groups, seriesKeys, height = 250 }) {
  if (!groups.length) return <div style={{ color: T.muted, fontSize: 11 }}>Sin datos</div>;
  const max = Math.max(...groups.map((g) => g.total), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, overflowX: "auto", paddingBottom: 4 }}>
        {groups.map((g) => (
          <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 30, flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column-reverse", width: 24, height: height - 46, borderRadius: "4px 4px 0 0", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
              {seriesKeys.map((k, ki) => {
                const v = g.values[k] || 0;
                if (!v) return null;
                const h = (v / max) * (height - 46);
                return <div key={k} style={{ height: `${h}px`, background: SEQ_DIV[ki % SEQ_DIV.length] }} title={`${k}: ${v}`} />;
              })}
            </div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 6, writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: 90, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
        {seriesKeys.map((k, ki) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.text2 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: SEQ_DIV[ki % SEQ_DIV.length] }} />
            {k}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvolChart({ labels, current, previous, movingAvg }) {
  if (current.length < 2) return <div style={{ color: T.muted, fontSize: 11 }}>Sin datos suficientes</div>;
  const W = 800, H = 230, PAD = 10, BOTTOM = 26;
  const max = Math.max(...current, ...(previous || [0]), ...(movingAvg || [0]), 1);
  const n = current.length;
  const xAt = (i) => PAD + (i / (n - 1 || 1)) * (W - PAD * 2);
  const yAt = (v) => H - BOTTOM - (v / max) * (H - PAD - BOTTOM);
  const curPts = current.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const curArea = `${PAD},${H - BOTTOM} ${curPts} ${W - PAD},${H - BOTTOM}`;
  const prevPts = previous ? previous.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ") : null;
  const maPts = movingAvg ? movingAvg.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ") : null;
  const step = Math.max(1, Math.floor(n / 7));
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 6, fontSize: 10, color: T.text2 }}>
        <span><span style={{ display: "inline-block", width: 14, height: 2, background: T.accent, marginRight: 5, verticalAlign: "middle" }} />Actual</span>
        {previous && <span><span style={{ display: "inline-block", width: 14, height: 2, background: "rgba(148,163,184,0.6)", marginRight: 5, verticalAlign: "middle" }} />Anterior</span>}
        {movingAvg && <span><span style={{ display: "inline-block", width: 14, height: 2, background: T.amber, marginRight: 5, verticalAlign: "middle" }} />Media 7d</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 230 }}>
        <defs>
          <linearGradient id="tarimaEvolGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={curArea} fill="url(#tarimaEvolGrad)" />
        {prevPts && <polyline points={prevPts} fill="none" stroke="rgba(148,163,184,0.55)" strokeWidth="1.4" strokeDasharray="3,3" />}
        {maPts && <polyline points={maPts} fill="none" stroke={T.amber} strokeWidth="1.6" strokeDasharray="5,4" />}
        <polyline points={curPts} fill="none" stroke={T.accent} strokeWidth="2.4" strokeLinejoin="round" />
        {current.map((v, i) => (i % step === 0 ? <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2.5" fill={T.accent} /> : null))}
        {labels.map((l, i) => (i % step === 0 ? <text key={i} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize="8" fill={T.muted}>{l}</text> : null))}
      </svg>
    </div>
  );
}

function RiskLegend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
      <span style={{ fontSize: 9, color: T.muted }}>1</span>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: `linear-gradient(90deg,${T.green},${T.amber},${T.red})` }} />
      <span style={{ fontSize: 9, color: T.muted }}>5</span>
    </div>
  );
}

// ─── VISTA EJECUTIVA ──────────────────────────────────────────────────────────
function VistaEjecutiva({ dfc, dfp, sd, ed, kpis, pieMode, setPieMode }) {
  const { nCur, dPct, camPct, dCam, riesgoMed, dRiesgo, horaPico, catTop, catTopN, cgmTop } = kpis;
  const camCount = dfc.filter((r) => r.con_camara).length;
  const cgmCount = nCur ? contar(dfc, "CGM")[cgmTop] || 0 : 0;
  const franjaIni = Math.floor(horaPico / 3) * 3;

  const fechas = useMemo(() => rangoFechas(sd, ed), [sd, ed]);
  const evol = useMemo(() => {
    const countsC = contar(dfc, "fecha");
    const current = fechas.map((f) => countsC[f] || 0);
    let previous = null;
    if (dfp.length) {
      const prevLen = fechas.length;
      const prevStart = addDaysISO(sd, -prevLen);
      const prevFechas = rangoFechas(prevStart, addDaysISO(sd, -1));
      const countsP = contar(dfp, "fecha");
      previous = prevFechas.slice(-prevLen).map((f) => countsP[f] || 0);
    }
    let movingAvg = null;
    if (current.length >= 7) {
      movingAvg = current.map((_, i) => {
        const win = current.slice(Math.max(0, i - 6), i + 1);
        return win.reduce((a, b) => a + b, 0) / win.length;
      });
    }
    const labels = fechas.map((f) => {
      const [, m, d] = f.split("-");
      return `${d}/${m}`;
    });
    return { current, previous, movingAvg, labels };
  }, [dfc, dfp, fechas, sd]);

  const heat = useMemo(() => {
    const rowLabels = DIAS_ORDEN.filter((d) => dfc.some((r) => r.DiaNom === d));
    const colLabels = TURNOS_ORDEN.filter((t) => dfc.some((r) => r.Turno === t));
    const matrix = rowLabels.map((d) => colLabels.map((t) => dfc.filter((r) => r.DiaNom === d && r.Turno === t).length));
    return { rowLabels, colLabels, matrix };
  }, [dfc]);

  const catItems = useMemo(() => {
    const counts = contar(dfc, "Categoría");
    const riesgoPorCat = {};
    dfc.forEach((r) => { riesgoPorCat[r.Categoría] = r.riesgo; });
    return topOrdenado(counts).map((it) => ({ ...it, riesgo: riesgoPorCat[it.label] ?? 1 }));
  }, [dfc]);

  const donutData = useMemo(() => {
    const key = pieMode === "turno" ? "Turno" : "TipoDia";
    return topOrdenado(contar(dfc, key));
  }, [dfc, pieMode]);

  const comisariasTop = useMemo(() => topOrdenado(contar(dfc, "Comisaría"), 10), [dfc]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
        <Kpi icon="📋" label="Total Novedades" value={fmt(nCur)} delta={dPct} invert />
        <Kpi icon="📷" label="Con Cámara" value={`${camPct.toFixed(1)}%`} delta={dCam} sub={`${fmt(camCount)} eventos`} />
        <Kpi icon="⚠️" label="Índice de Riesgo" value={riesgoMed.toFixed(2)} delta={dRiesgo} invert sub="Escala 1–5" />
        <Kpi icon="🏘️" label="CGM más activo" value={cgmTop} sub={nCur ? `${fmt(cgmCount)} casos` : ""} />
        <Kpi icon="🕐" label="Hora Pico" value={`${String(horaPico).padStart(2, "0")}:00`} sub={`Franja ${String(franjaIni).padStart(2, "0")}–${String(franjaIni + 3).padStart(2, "0")}hs`} />
        <Kpi icon="🔺" label="Cat. Líder" value={catTop} sub={`${fmt(catTopN)} casos`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 14 }}>
        <Card title="Evolución Diaria" icon="📈">
          <EvolChart labels={evol.labels} current={evol.current} previous={evol.previous} movingAvg={evol.movingAvg} />
        </Card>
        <Card title="Intensidad Día × Turno" icon="🌡️">
          <HeatGrid matrix={heat.matrix} rowLabels={heat.rowLabels} colLabels={heat.colLabels} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1.6fr 2fr", gap: 14 }}>
        <Card title="Novedades por Categoría · color = nivel de riesgo" icon="📂">
          <BarRanking items={catItems} total={nCur} colorFn={(it) => RIESGO_LABEL_COLOR(it.riesgo)} />
          <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
            {[[T.red, "Alto"], [T.amber, "Medio"], [T.accent, "Bajo"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.text2 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Participación Turno / Día" icon="🌙">
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setPieMode("turno")} style={{ flex: 1, background: pieMode === "turno" ? "rgba(139,92,246,0.15)" : "transparent", border: `1px solid ${pieMode === "turno" ? T.accent : T.border}`, color: pieMode === "turno" ? T.text : T.text2, borderRadius: 8, padding: "6px 0", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Turno</button>
            <button onClick={() => setPieMode("dia")} style={{ flex: 1, background: pieMode === "dia" ? "rgba(139,92,246,0.15)" : "transparent", border: `1px solid ${pieMode === "dia" ? T.accent : T.border}`, color: pieMode === "dia" ? T.text : T.text2, borderRadius: 8, padding: "6px 0", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Día</button>
          </div>
          <Donut data={donutData} />
        </Card>
        <Card title="Ranking Comisarías" icon="🏆">
          <BarRanking items={comisariasTop} total={nCur} showPct={false} colorFn={(it, i) => RANK_COLORS[Math.min(i, 3)]} />
        </Card>
      </div>
    </div>
  );
}

// ─── VISTA TERRITORIAL ────────────────────────────────────────────────────────
function VistaTerritorial({ dfc }) {
  const nCur = dfc.length;
  const comCounts = contar(dfc, "Comisaría");
  const comOrdenado = topOrdenado(comCounts);
  const nComs = comOrdenado.length;
  const comTop = comOrdenado[0] || { label: "—", value: 0 };
  const promCom = nComs ? nCur / nComs : 0;

  const conCamara = dfc.filter((r) => r.con_camara);
  const catCamCounts = contar(conCamara, "Categoría");
  const catCamTop = topOrdenado(catCamCounts)[0] || { label: "—", value: 0 };

  const top5Cats = useMemo(() => topOrdenado(contar(dfc, "Categoría"), 5).map((c) => c.label), [dfc]);

  const stackedComisaria = useMemo(() => {
    const groups = {};
    dfc.forEach((r) => {
      if (!top5Cats.includes(r.Categoría)) return;
      if (!groups[r.Comisaría]) groups[r.Comisaría] = {};
      groups[r.Comisaría][r.Categoría] = (groups[r.Comisaría][r.Categoría] || 0) + 1;
    });
    return Object.entries(groups)
      .map(([label, values]) => ({ label, values, total: Object.values(values).reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [dfc, top5Cats]);

  const camPorComisaria = useMemo(() => {
    const acc = {};
    dfc.forEach((r) => {
      if (!acc[r.Comisaría]) acc[r.Comisaría] = { con: 0, total: 0 };
      acc[r.Comisaría].total++;
      if (r.con_camara) acc[r.Comisaría].con++;
    });
    return Object.entries(acc)
      .map(([label, v]) => ({ label, value: (v.con / v.total) * 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [dfc]);

  const heatComisariaDia = useMemo(() => {
    const rowLabels = comOrdenado.map((c) => c.label);
    const colLabels = DIAS_ORDEN.filter((d) => dfc.some((r) => r.DiaNom === d));
    const matrix = rowLabels.map((com) => colLabels.map((d) => dfc.filter((r) => r.Comisaría === com && r.DiaNom === d).length));
    return { rowLabels, colLabels, matrix };
  }, [dfc, comOrdenado]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
        <Kpi icon="🏢" label="Comisarías activas" value={fmt(nComs)} />
        <Kpi icon="📍" label="Comisaría líder" value={comTop.label} sub={nCur ? `${fmt(comTop.value)} casos` : ""} />
        <Kpi icon="📊" label="Promedio / Comisaría" value={fmt(promCom)} sub="novedades" />
        <Kpi icon="📷" label="Cat. más filmada" value={catCamTop.label} sub={`${fmt(catCamTop.value)} con cámara`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 14 }}>
        <Card title="Comisaría × Categoría (Top 5 categorías)" icon="🗂️">
          <StackedBars groups={stackedComisaria} seriesKeys={top5Cats} />
        </Card>
        <Card title="% Cobertura de Cámara por Comisaría" icon="🎥">
          <BarRanking items={camPorComisaria} showPct={false} colorFn={(it) => colorScale(["#1e1b4b", T.accent, T.green], it.value / 100)} />
        </Card>
      </div>

      <Card title="Mapa de Calor · Comisaría × Día de Semana" icon="🌐">
        <HeatGrid matrix={heatComisariaDia.matrix} rowLabels={heatComisariaDia.rowLabels} colLabels={heatComisariaDia.colLabels} />
      </Card>
    </div>
  );
}

// ─── VISTA POR CGM ────────────────────────────────────────────────────────────
function VistaCGM({ dfc }) {
  const nCur = dfc.length;
  const cgmCounts = contar(dfc, "CGM");
  const cgmOrdenado = topOrdenado(cgmCounts);
  const nCgms = cgmOrdenado.length;
  const cgmLider = cgmOrdenado[0] || { label: "—", value: 0 };
  const promCgm = nCgms ? nCur / nCgms : 0;

  const riesgoPorCgm = useMemo(() => {
    const acc = {};
    dfc.forEach((r) => {
      if (!acc[r.CGM]) acc[r.CGM] = { suma: 0, n: 0 };
      acc[r.CGM].suma += r.riesgo;
      acc[r.CGM].n++;
    });
    return Object.entries(acc).map(([label, v]) => ({ label, value: v.suma / v.n })).sort((a, b) => b.value - a.value);
  }, [dfc]);
  const cgmRiesgoTop = riesgoPorCgm[0] || { label: "—", value: 0 };

  const top5Cats = useMemo(() => topOrdenado(contar(dfc, "Categoría"), 5).map((c) => c.label), [dfc]);

  const stackedCgm = useMemo(() => {
    const groups = {};
    dfc.forEach((r) => {
      if (!top5Cats.includes(r.Categoría)) return;
      if (!groups[r.CGM]) groups[r.CGM] = {};
      groups[r.CGM][r.Categoría] = (groups[r.CGM][r.Categoría] || 0) + 1;
    });
    return cgmOrdenado
      .filter((c) => groups[c.label])
      .map((c) => ({ label: c.label, values: groups[c.label], total: Object.values(groups[c.label]).reduce((a, b) => a + b, 0) }));
  }, [dfc, top5Cats, cgmOrdenado]);

  const camPorCgm = useMemo(() => {
    const acc = {};
    dfc.forEach((r) => {
      if (!acc[r.CGM]) acc[r.CGM] = { con: 0, total: 0 };
      acc[r.CGM].total++;
      if (r.con_camara) acc[r.CGM].con++;
    });
    return Object.entries(acc)
      .map(([label, v]) => ({ label, value: (v.con / v.total) * 100 }))
      .sort((a, b) => b.value - a.value);
  }, [dfc]);

  const heatCgmTurno = useMemo(() => {
    const rowLabels = cgmOrdenado.map((c) => c.label);
    const colLabels = TURNOS_ORDEN.filter((t) => dfc.some((r) => r.Turno === t));
    const matrix = rowLabels.map((cgm) => colLabels.map((t) => dfc.filter((r) => r.CGM === cgm && r.Turno === t).length));
    return { rowLabels, colLabels, matrix };
  }, [dfc, cgmOrdenado]);

  const heatCgmDia = useMemo(() => {
    const rowLabels = cgmOrdenado.map((c) => c.label);
    const colLabels = DIAS_ORDEN.filter((d) => dfc.some((r) => r.DiaNom === d));
    const matrix = rowLabels.map((cgm) => colLabels.map((d) => dfc.filter((r) => r.CGM === cgm && r.DiaNom === d).length));
    return { rowLabels, colLabels, matrix };
  }, [dfc, cgmOrdenado]);

  const maxVol = Math.max(...cgmOrdenado.map((c) => c.value), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
        <Kpi icon="🏘️" label="CGMs activos" value={fmt(nCgms)} />
        <Kpi icon="🔝" label="CGM líder" value={cgmLider.label} sub={`${fmt(cgmLider.value)} novedades`} />
        <Kpi icon="📊" label="Promedio / CGM" value={fmt(promCgm)} sub="novedades" />
        <Kpi icon="⚠️" label="CGM mayor riesgo" value={cgmRiesgoTop.label} sub={`Índice ${cgmRiesgoTop.value.toFixed(2)}`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 14 }}>
        <Card title="Novedades Totales por CGM" icon="🏘️">
          <BarRanking items={cgmOrdenado} total={nCur} colorFn={(it) => colorScale(["#2e1065", T.accent, "#a78bfa"], it.value / maxVol)} />
        </Card>
        <Card title="Intensidad CGM × Turno" icon="🌡️">
          <HeatGrid matrix={heatCgmTurno.matrix} rowLabels={heatCgmTurno.rowLabels} colLabels={heatCgmTurno.colLabels} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginBottom: 14 }}>
        <Card title="Distribución de Categorías por CGM" icon="📂">
          <StackedBars groups={stackedCgm} seriesKeys={top5Cats} />
        </Card>
        <Card title="Índice de Riesgo Promedio por CGM" icon="⚠️">
          <BarRanking items={riesgoPorCgm} showPct={false} colorFn={(it) => colorScale([T.green, T.amber, T.red], (it.value - 1) / 4)} />
          <RiskLegend />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 14 }}>
        <Card title="% Cobertura de Cámara por CGM" icon="🎥">
          <BarRanking items={camPorCgm} showPct={false} colorFn={(it) => colorScale(["#1e1b4b", T.accent, T.green], it.value / 100)} />
        </Card>
        <Card title="Mapa de Calor · CGM × Día de Semana" icon="🗓️">
          <HeatGrid matrix={heatCgmDia.matrix} rowLabels={heatCgmDia.rowLabels} colLabels={heatCgmDia.colLabels} />
        </Card>
      </div>
    </div>
  );
}

// ─── EXPORT EXCEL ─────────────────────────────────────────────────────────────
function exportarExcel(rows, sd, ed) {
  const data = rows.map((r) => ({
    Fecha: r.fecha,
    Hora: r.hora,
    Turno: r.Turno,
    Día: r.DiaNom,
    TipoDía: r.TipoDia,
    Franja: r.Franja,
    Categoría: r.Categoría,
    Subcategoria: r.Subcategoria,
    Comisaría: r.Comisaría,
    CGM: r.CGM,
    ConCámara: r.con_camara ? "SI" : "NO",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tarima");
  XLSX.writeFile(wb, `tarima_${sd}_${ed}.xlsx`);
}

// ─── APP TARIMA ───────────────────────────────────────────────────────────────
export default function Tarima({ onVolver }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState("ejecutiva");
  const [pieMode, setPieMode] = useState("turno");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [filters, setFilters] = useState({ desde: "", hasta: "", cgm: [], categoria: [], subcategoria: [], comisaria: [], turno: [] });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tarima");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
        setRows(json.rows || []);
        const fechas = (json.rows || []).map((r) => r.fecha).sort();
        const maxF = fechas[fechas.length - 1];
        if (maxF) {
          setFilters((f) => ({ ...f, desde: maxF.slice(0, 8) + "01", hasta: maxF }));
        }
      } catch (e) {
        setError(e.message || "No se pudieron cargar los datos.");
      }
      setLoading(false);
    })();
  }, []);

  const opciones = useMemo(
    () => ({
      cgm: [...new Set(rows.map((r) => r.CGM))].sort(),
      categoria: [...new Set(rows.map((r) => r.Categoría))].sort(),
      comisaria: [...new Set(rows.map((r) => r.Comisaría))].sort(),
    }),
    [rows]
  );
  const subOpciones = useMemo(() => {
    const base = filters.categoria.length ? rows.filter((r) => filters.categoria.includes(r.Categoría)) : rows;
    return [...new Set(base.map((r) => r.Subcategoria).filter(Boolean))].sort();
  }, [rows, filters.categoria]);

  const minFecha = rows.length ? rows.reduce((m, r) => (r.fecha < m ? r.fecha : m), rows[0].fecha) : "";
  const maxFecha = rows.length ? rows.reduce((m, r) => (r.fecha > m ? r.fecha : m), rows[0].fecha) : "";

  function aplicarFiltros(data, d0, d1) {
    return data.filter((r) => {
      if (d0 && r.fecha < d0) return false;
      if (d1 && r.fecha > d1) return false;
      if (filters.cgm.length && !filters.cgm.includes(r.CGM)) return false;
      if (filters.categoria.length && !filters.categoria.includes(r.Categoría)) return false;
      if (filters.subcategoria.length && !filters.subcategoria.includes(r.Subcategoria)) return false;
      if (filters.comisaria.length && !filters.comisaria.includes(r.Comisaría)) return false;
      if (filters.turno.length && !filters.turno.includes(r.Turno)) return false;
      return true;
    });
  }

  const sd = filters.desde || minFecha;
  const ed = filters.hasta || maxFecha;
  const days = sd && ed ? diffDaysISO(sd, ed) + 1 : 0;
  const prevEd = sd ? addDaysISO(sd, -1) : "";
  const prevSd = sd && days ? addDaysISO(prevEd, -(days - 1)) : "";

  const dfc = useMemo(() => (sd && ed ? aplicarFiltros(rows, sd, ed) : []), [rows, filters, sd, ed]);
  const dfp = useMemo(() => (prevSd && prevEd ? aplicarFiltros(rows, prevSd, prevEd) : []), [rows, filters, prevSd, prevEd]);

  const kpis = useMemo(() => {
    const nCur = dfc.length, nPrev = dfp.length;
    const dPct = nPrev ? ((nCur - nPrev) / nPrev) * 100 : 0;
    const camPct = nCur ? (dfc.filter((r) => r.con_camara).length / nCur) * 100 : 0;
    const camPrev = nPrev ? (dfp.filter((r) => r.con_camara).length / nPrev) * 100 : 0;
    const riesgoMed = nCur ? dfc.reduce((a, r) => a + r.riesgo, 0) / nCur : 0;
    const riesgoPrev = nPrev ? dfp.reduce((a, r) => a + r.riesgo, 0) / nPrev : 0;

    const horasCount = Array(24).fill(0);
    dfc.forEach((r) => horasCount[r.hora]++);
    const horaPico = nCur ? horasCount.indexOf(Math.max(...horasCount)) : 0;

    const catCounts = topOrdenado(contar(dfc, "Categoría"));
    const cgmCounts = topOrdenado(contar(dfc, "CGM"));

    return {
      nCur, nPrev, dPct,
      camPct, camPrev, dCam: camPct - camPrev,
      riesgoMed, riesgoPrev, dRiesgo: riesgoMed - riesgoPrev,
      horaPico,
      catTop: catCounts[0]?.label || "—", catTopN: catCounts[0]?.value || 0,
      cgmTop: cgmCounts[0]?.label || "—",
    };
  }, [dfc, dfp]);

  const baseInp = { background: "#0d0d1f", border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: "7px 10px", fontSize: 12, fontFamily: "'Inter',sans-serif", outline: "none", width: "100%", colorScheme: "dark" };
  const lbl = { fontSize: 11, color: T.text2, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 5, display: "block" };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'Inter',sans-serif" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔵</div>
        <div style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>Cargando datos de Tarima…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${T.bg};}
        ::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:3px;}
        @keyframes tarimaPulse{0%,100%{opacity:1;box-shadow:0 0 6px ${T.green};}50%{opacity:.5;box-shadow:0 0 12px ${T.green};}}
      `}</style>

      <div style={{ background: `linear-gradient(90deg,${T.bg2} 0%,#1a1535 50%,${T.bg2} 100%)`, border: `1px solid ${T.border}`, borderRadius: 16, margin: "14px 20px 0", padding: "14px 24px", display: "flex", alignItems: "center", gap: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
        {onVolver && (
          <button onClick={onVolver} style={{ background: "rgba(139,92,246,0.12)", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            ← Volver
          </button>
        )}
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔵</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: "-0.3px" }}>Centro de Operaciones Lomas</div>
          <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>Análisis Operativo · Sistema de monitoreo del Partido de Lomas de Zamora</div>
        </div>
        <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 100, padding: "5px 12px", fontSize: 10, fontWeight: 700, color: "#6ee7b7", letterSpacing: "0.06em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block", animation: "tarimaPulse 2s infinite" }} />
          EN VIVO
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 20px" }}>
        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 12, marginBottom: 14 }}>⚠ {error}</div>}

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: 16, overflow: "hidden" }}>
          <button onClick={() => setFiltersOpen((o) => !o)} style={{ width: "100%", background: "transparent", border: "none", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: T.text2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}><span>⚙</span> FILTROS</span>
            <span style={{ fontSize: 12, color: T.muted, transition: "transform 0.2s", display: "inline-block", transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
          </button>
          {filtersOpen && (
            <div style={{ padding: "0 18px 16px", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr 1.3fr 1.3fr 1.3fr 1.1fr", gap: 14, paddingTop: 14, alignItems: "end" }}>
                <div>
                  <label style={lbl}>Desde</label>
                  <input type="date" value={sd} min={minFecha} max={maxFecha} onChange={(e) => setFilters((f) => ({ ...f, desde: e.target.value }))} style={baseInp} />
                </div>
                <div>
                  <label style={lbl}>Hasta</label>
                  <input type="date" value={ed} min={minFecha} max={maxFecha} onChange={(e) => setFilters((f) => ({ ...f, hasta: e.target.value }))} style={baseInp} />
                </div>
                <MultiSelect label="CGM" options={opciones.cgm} value={filters.cgm} onChange={(v) => setFilters((f) => ({ ...f, cgm: v }))} />
                <MultiSelect label="Categoría" options={opciones.categoria} value={filters.categoria} onChange={(v) => setFilters((f) => ({ ...f, categoria: v, subcategoria: [] }))} />
                <MultiSelect label="Subcategoría" options={subOpciones} value={filters.subcategoria} onChange={(v) => setFilters((f) => ({ ...f, subcategoria: v }))} />
                <MultiSelect label="Comisaría" options={opciones.comisaria} value={filters.comisaria} onChange={(v) => setFilters((f) => ({ ...f, comisaria: v }))} />
                <MultiSelect label="Turno" options={TURNOS_ORDEN} value={filters.turno} onChange={(v) => setFilters((f) => ({ ...f, turno: v }))} />
              </div>
              <button
                onClick={() => setFilters({ desde: maxFecha.slice(0, 8) + "01", hasta: maxFecha, cgm: [], categoria: [], subcategoria: [], comisaria: [], turno: [] })}
                style={{ marginTop: 14, background: "rgba(139,92,246,0.12)", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 10, padding: "7px 14px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
              >↺ Resetear</button>
            </div>
          )}
        </div>

        {kpis.nCur > 0 && kpis.dPct > 20 && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "9px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 10 }}>
            🚨 <b>Alerta:</b> Novedades <b>+{kpis.dPct.toFixed(1)}%</b> vs período anterior · Categoría líder: <b>{kpis.catTop}</b> ({fmt(kpis.catTopN)}) · CGM más activo: <b>{kpis.cgmTop}</b>
          </div>
        )}
        {kpis.nCur > 0 && kpis.dPct < -20 && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "9px 14px", fontSize: 13, color: "#6ee7b7", marginBottom: 10 }}>
            ✅ <b>Tendencia positiva:</b> Novedades <b>{kpis.dPct.toFixed(1)}%</b> vs período anterior
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {[["ejecutiva", "📊 Ejecutivo"], ["territorial", "🗺️ Territorial"], ["cgm", "📡 Por CGM"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setVista(id)}
              style={{ background: vista === id ? "rgba(139,92,246,0.15)" : "transparent", border: `1px solid ${vista === id ? T.accent : T.border}`, color: vista === id ? T.text : T.text2, borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer" }}
            >{label}</button>
          ))}
          <button
            onClick={() => exportarExcel(dfc, sd, ed)}
            style={{ marginLeft: "auto", background: T.accent, border: "none", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}
          >⬇ Exportar</button>
        </div>

        {vista === "ejecutiva" && <VistaEjecutiva dfc={dfc} dfp={dfp} sd={sd} ed={ed} kpis={kpis} pieMode={pieMode} setPieMode={setPieMode} />}
        {vista === "territorial" && <VistaTerritorial dfc={dfc} />}
        {vista === "cgm" && <VistaCGM dfc={dfc} />}

        <div style={{ textAlign: "center", color: T.muted, fontSize: 10, marginTop: 24, padding: "8px 0", borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          COL · Análisis Operativo &nbsp;·&nbsp; {sd || "–"} → {ed || "–"} &nbsp;·&nbsp; {fmt(kpis.nCur)} registros
        </div>
      </div>
    </div>
  );
}
