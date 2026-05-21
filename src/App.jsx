import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://ygwjvkjrpojxjczcholu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2p2a2pycG9qeGpjemNob2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODgyODAsImV4cCI6MjA2MzI2NDI4MH0.GxrxHVnmMgizxG2LKp70YpG6tMQX5X0OAIBR1HLySSI";

const PALETTE = ["#1B3A6B","#378ADD","#1D9E75","#BA7517","#A32D2D","#534AB7","#D85A30","#3B6D11","#D4537E","#888780"];
const TURN_COLORS = { "mañana":"#1B3A6B", "tarde":"#378ADD", "noche":"#534AB7" };
const DIAS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

function getTurno(timeStr, isWeekend) {
  if (!timeStr) return "noche";
  const h = parseInt(timeStr.split(":")[0]);
  if (isWeekend) return (h >= 6 && h < 18) ? "mañana" : "noche";
  if (h >= 6 && h < 14) return "mañana";
  if (h >= 14 && h < 22) return "tarde";
  return "noche";
}

async function fetchAll() {
  const pageSize = 1000;
  let all = [], from = 0, hasMore = true;
  while (hasMore) {
    const url = `${SUPABASE_URL}/rest/v1/alertas?select=fecha,horario,cgm,categoria,tipo&order=fecha.asc&limit=${pageSize}&offset=${from}`;
    const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!r.ok) throw new Error(`Error ${r.status} al conectar con Supabase`);
    const chunk = await r.json();
    all = all.concat(chunk);
    if (chunk.length < pageSize || all.length > 150000) hasMore = false;
    else from += pageSize;
  }
  return all;
}

function useChartJS(canvasRef, config, deps) {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();
    if (!config) return;
    chartRef.current = new window.Chart(canvasRef.current, config);
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, deps);
}

// ── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub }) {
  return (
    <div style={{ background: "var(--bg2)", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "var(--txt2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: "var(--txt1)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, sub, children, legend, style }) {
  return (
    <div style={{ background: "var(--bg1)", border: "0.5px solid var(--brd)", borderRadius: 12, padding: 16, ...style }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--txt1)", marginBottom: 3 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--txt2)", marginBottom: 12 }}>{sub}</div>}
      {legend && <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10, fontSize: 11, color: "var(--txt2)" }}>{legend}</div>}
      {children}
    </div>
  );
}

function Legend({ items }) {
  return items.map(([label, color, pct], i) => (
    <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: color, display: "inline-block" }} />
      {label}{pct != null ? ` ${pct}%` : ""}
    </span>
  ));
}

// ── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ icon, title, value, desc }) {
  return (
    <div style={{ background: "var(--bg1)", border: "0.5px solid var(--brd)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 20, color: "#1B3A6B", marginBottom: 8 }}><i className={`ti ti-${icon}`} aria-hidden="true" /></div>
      <div style={{ fontSize: 11, color: "var(--txt2)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 18, fontWeight: 500, color: "var(--txt1)" }}>{value}</div>
      {desc && <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 3 }}>{desc}</div>}
    </div>
  );
}

// ── Tab Resumen ───────────────────────────────────────────────────────────────
function TabResumen({ data }) {
  const catRef = useRef(null), cgmRef = useRef(null);

  const counts = {};
  data.forEach(r => { if (r.fecha) counts[r.fecha] = (counts[r.fecha] || 0) + 1; });
  const dayCount = Math.max(Object.keys(counts).length, 1);
  const avg = data.length / dayCount;
  const peakDay = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const cgmC = {}; data.forEach(r => { if (r.cgm) cgmC[r.cgm] = (cgmC[r.cgm] || 0) + 1; });
  const topCgm = Object.entries(cgmC).sort((a, b) => b[1] - a[1])[0];
  const horaC = {}; data.forEach(r => { if (r.horario) { const h = r.horario.split(":")[0]; horaC[h] = (horaC[h] || 0) + 1; } });
  const topH = Object.entries(horaC).sort((a, b) => b[1] - a[1])[0];

  const catEntries = Object.entries((() => { const c = {}; data.forEach(r => { if (r.categoria) c[r.categoria] = (c[r.categoria] || 0) + 1; }); return c; })()).sort((a, b) => b[1] - a[1]);
  const total = data.length || 1;
  const cgmEntries = Object.entries(cgmC).sort((a, b) => b[1] - a[1]);

  useChartJS(catRef, {
    type: "doughnut",
    data: { labels: catEntries.map(e => e[0]), datasets: [{ data: catEntries.map(e => e[1]), backgroundColor: PALETTE.slice(0, catEntries.length), borderWidth: 1, borderColor: "#fff" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed.toLocaleString("es-AR")} (${Math.round(c.parsed / total * 100)}%)` } } } }
  }, [data.length]);

  useChartJS(cgmRef, {
    type: "bar",
    data: { labels: cgmEntries.map(e => e[0]), datasets: [{ data: cgmEntries.map(e => e[1]), backgroundColor: "#1B3A6B", borderRadius: 4 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x.toLocaleString("es-AR")} alertas` } } },
      scales: { x: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } }, y: { ticks: { font: { size: 11 } } } }
    }
  }, [data.length]);

  const dowC = [0,0,0,0,0,0,0], dowDays = [0,0,0,0,0,0,0], dSeen = {};
  data.forEach(r => {
    if (!r.fecha) return;
    const dow = new Date(r.fecha + "T12:00:00").getDay();
    dowC[dow]++;
    if (!dSeen[r.fecha]) { dSeen[r.fecha] = true; dowDays[dow]++; }
  });
  const dowAvg = dowC.map((c, i) => dowDays[i] > 0 ? c / dowDays[i] : 0);
  const peakDow = dowAvg.indexOf(Math.max(...dowAvg));
  const turnC = { mañana: 0, tarde: 0, noche: 0 };
  data.forEach(r => { if (r._turno) turnC[r._turno]++; });
  const turnPeak = Object.entries(turnC).sort((a, b) => b[1] - a[1])[0];
  const cgmVals = Object.values(cgmC);
  const maxCgm = Math.max(...cgmVals, 0);
  const cgmTotal = cgmVals.reduce((a, b) => a + b, 0) || 1;
  const concCgm = Math.round(maxCgm / cgmTotal * 100);
  const peakFactor = (avg > 0 ? (peakDay ? peakDay[1] / avg : 0) : 0).toFixed(1);

  const cgmH = Math.max(240, cgmEntries.length * 36 + 60);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, padding: "0 1.25rem", marginBottom: "1.5rem" }}>
        <MetricCard label="Total alertas" value={data.length.toLocaleString("es-AR")} sub={`en ${dayCount} días`} />
        <MetricCard label="Promedio diario" value={avg.toFixed(1)} sub="alertas / día" />
        <MetricCard label="Pico máximo" value={peakDay ? peakDay[1].toLocaleString("es-AR") : "—"} sub={peakDay ? peakDay[0] : "alertas en un día"} />
        <MetricCard label="CGM más activo" value={topCgm ? topCgm[0] : "—"} sub={topCgm ? `${topCgm[1].toLocaleString("es-AR")} alertas` : ""} />
        <MetricCard label="Hora pico" value={topH ? `${topH[0]}:00` : "—"} sub={topH ? `${topH[1].toLocaleString("es-AR")} alertas` : ""} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <ChartCard title="Distribución por categoría" sub="Participación porcentual del período"
          legend={<Legend items={catEntries.map((e, i) => [e[0], PALETTE[i % PALETTE.length], Math.round(e[1] / total * 100)])} />}>
          <div style={{ position: "relative", height: 220 }}><canvas ref={catRef} role="img" aria-label="Distribución por categoría" /></div>
        </ChartCard>
        <ChartCard title="Distribución por CGM" sub="Volumen de alertas por centro de gestión">
          <div style={{ position: "relative", height: cgmH }}><canvas ref={cgmRef} role="img" aria-label="Alertas por CGM" /></div>
        </ChartCard>
      </div>

      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--txt1)", padding: "0 1.25rem", marginBottom: ".75rem", marginTop: "1rem" }}>Insights operativos</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <InsightCard icon="clock-hour-4" title="Hora pico del período" value={topH ? `${topH[0]}:00 hs` : "—"} desc={topH ? `${topH[1].toLocaleString("es-AR")} alertas en esa franja` : ""} />
        <InsightCard icon="chart-bar" title="Factor pico vs. promedio" value={`×${peakFactor}`} desc={`El día de mayor demanda tuvo ${peakFactor}x el promedio`} />
        <InsightCard icon="calendar-week" title="Día de mayor demanda" value={DIAS[peakDow]} desc={`Promedio de ${dowAvg[peakDow].toFixed(1)} alertas ese día`} />
        <InsightCard icon="map-pin" title="Concentración en 1 CGM" value={`${concCgm}%`} desc="Del total se concentra en el CGM más activo" />
        <InsightCard icon="sun" title="Turno de mayor actividad" value={turnPeak ? turnPeak[0].charAt(0).toUpperCase() + turnPeak[0].slice(1) : "—"} desc={turnPeak ? `${turnPeak[1].toLocaleString("es-AR")} alertas en ese turno` : ""} />
        <InsightCard icon="building-community" title="CGMs activos" value={Object.keys(cgmC).length} desc="Centros con al menos 1 alerta" />
      </div>
    </div>
  );
}

// ── Tab Temporal ──────────────────────────────────────────────────────────────
function TabTemporal({ data }) {
  const serieRef = useRef(null), dowRef = useRef(null), horaRef = useRef(null);

  const dayCounts = {};
  data.forEach(r => { if (r.fecha) dayCounts[r.fecha] = (dayCounts[r.fecha] || 0) + 1; });
  const sorted = Object.entries(dayCounts).sort((a, b) => a[0].localeCompare(b[0]));

  const dowC = [0,0,0,0,0,0,0], dowDays = [0,0,0,0,0,0,0], dSeen = {};
  data.forEach(r => {
    if (!r.fecha) return;
    const dow = new Date(r.fecha + "T12:00:00").getDay();
    dowC[dow]++;
    if (!dSeen[r.fecha]) { dSeen[r.fecha] = true; dowDays[dow]++; }
  });
  const dowAvg = dowC.map((c, i) => dowDays[i] > 0 ? Math.round(c / dowDays[i]) : 0);

  const horaC = Array(24).fill(0);
  data.forEach(r => { if (r.horario) { const h = parseInt(r.horario.split(":")[0]); if (!isNaN(h) && h >= 0 && h < 24) horaC[h]++; } });

  useChartJS(serieRef, {
    type: "line",
    data: { labels: sorted.map(e => e[0]), datasets: [{ label: "Alertas", data: sorted.map(e => e[1]), borderColor: "#1B3A6B", backgroundColor: "rgba(27,58,107,.08)", fill: true, tension: .3, pointRadius: sorted.length > 60 ? 0 : 3, borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 }, maxTicksLimit: 12, autoSkip: true }, grid: { display: false } }, y: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } } } }
  }, [data.length]);

  useChartJS(dowRef, {
    type: "bar",
    data: { labels: DIAS, datasets: [{ data: dowAvg, backgroundColor: DIAS.map((_, i) => (i === 0 || i === 6) ? "#378ADD" : "#1B3A6B"), borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` Promedio: ${c.parsed.y} alertas/día` } } }, scales: { x: { ticks: { font: { size: 11 } }, grid: { display: false } }, y: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } } } }
  }, [data.length]);

  useChartJS(horaRef, {
    type: "bar",
    data: { labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,"0")}:00`), datasets: [{ data: horaC, backgroundColor: horaC.map((_, i) => i >= 6 && i < 14 ? "#1B3A6B" : i >= 14 && i < 22 ? "#378ADD" : "#534AB7"), borderRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y.toLocaleString("es-AR")} alertas` } } }, scales: { x: { ticks: { font: { size: 9 }, maxTicksLimit: 12, autoSkip: true, maxRotation: 0 }, grid: { display: false } }, y: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } } } }
  }, [data.length]);

  return (
    <div>
      <div style={{ padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <ChartCard title="Alertas por día" sub="Serie diaria del período seleccionado">
          <div style={{ position: "relative", height: 260 }}><canvas ref={serieRef} role="img" aria-label="Serie diaria de alertas" /></div>
        </ChartCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <ChartCard title="Alertas por día de la semana" sub="Promedio lunes–domingo (azul = fin de semana)">
          <div style={{ position: "relative", height: 220 }}><canvas ref={dowRef} role="img" aria-label="Alertas por día de la semana" /></div>
        </ChartCard>
        <ChartCard title="Alertas por franja horaria" sub="Distribución hora a hora (azul oscuro = mañana, azul = tarde, violeta = noche)">
          <div style={{ position: "relative", height: 220 }}><canvas ref={horaRef} role="img" aria-label="Alertas por hora del día" /></div>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Tab Operativo ─────────────────────────────────────────────────────────────
function TabOperativo({ data }) {
  const turnoRef = useRef(null), semfinRef = useRef(null), catturnRef = useRef(null);

  const turnC = { mañana: 0, tarde: 0, noche: 0 };
  data.forEach(r => { if (r._turno) turnC[r._turno]++; });
  const total = data.length || 1;
  const turnLegend = Object.entries(turnC).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), TURN_COLORS[k], Math.round(v / total * 100)]);

  let semC = 0, finC = 0;
  const semDias = {}, finDias = {};
  data.forEach(r => {
    if (!r.fecha) return;
    const dow = new Date(r.fecha + "T12:00:00").getDay();
    if (dow === 0 || dow === 6) { finDias[r.fecha] = true; finC++; } else { semDias[r.fecha] = true; semC++; }
  });

  const cats = [...new Set(data.map(r => r.categoria).filter(Boolean))].sort();
  const turns = ["mañana", "tarde", "noche"];
  const matrix = {};
  turns.forEach(t => { matrix[t] = {}; cats.forEach(c => matrix[t][c] = 0); });
  data.forEach(r => { if (r._turno && r.categoria) matrix[r._turno][r.categoria]++; });

  useChartJS(turnoRef, {
    type: "doughnut",
    data: { labels: ["Mañana","Tarde","Noche"], datasets: [{ data: [turnC.mañana, turnC.tarde, turnC.noche], backgroundColor: ["#1B3A6B","#378ADD","#534AB7"], borderWidth: 1, borderColor: "#fff" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed.toLocaleString("es-AR")} (${Math.round(c.parsed / total * 100)}%)` } } } }
  }, [data.length]);

  useChartJS(semfinRef, {
    type: "bar",
    data: { labels: ["Días de semana","Fin de semana"], datasets: [{ data: [Math.round(semC / Math.max(Object.keys(semDias).length,1)), Math.round(finC / Math.max(Object.keys(finDias).length,1))], backgroundColor: ["#1B3A6B","#378ADD"], borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y} alertas/día en promedio` } } }, scales: { x: { ticks: { font: { size: 12 } }, grid: { display: false } }, y: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } } } }
  }, [data.length]);

  useChartJS(catturnRef, {
    type: "bar",
    data: { labels: cats, datasets: turns.map((t, i) => ({ label: t.charAt(0).toUpperCase() + t.slice(1), data: cats.map(c => matrix[t][c]), backgroundColor: ["#1B3A6B","#378ADD","#534AB7"][i], borderRadius: 3, stack: "stack" })) },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top", labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toLocaleString("es-AR")}` } } },
      scales: { x: { stacked: true, ticks: { font: { size: 10 }, maxRotation: 30 }, grid: { display: false } }, y: { stacked: true, grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } } }
    }
  }, [data.length]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <ChartCard title="Alertas por turno" sub="Mañana / Tarde / Noche — distribución porcentual" legend={<Legend items={turnLegend} />}>
          <div style={{ position: "relative", height: 220 }}><canvas ref={turnoRef} role="img" aria-label="Distribución por turno" /></div>
        </ChartCard>
        <ChartCard title="Semana vs. fin de semana" sub="Promedio diario comparado">
          <div style={{ position: "relative", height: 220 }}><canvas ref={semfinRef} role="img" aria-label="Semana vs fin de semana" /></div>
        </ChartCard>
      </div>
      <div style={{ padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <ChartCard title="Categorías por turno" sub="Cómo se distribuye cada categoría a lo largo del día">
          <div style={{ position: "relative", height: 280 }}><canvas ref={catturnRef} role="img" aria-label="Categorías por turno" /></div>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Tab Detalle ───────────────────────────────────────────────────────────────
function TabDetalle({ data }) {
  const cgmcatRef = useRef(null);

  const cgms = [...new Set(data.map(r => r.cgm).filter(Boolean))].sort();
  const cats = [...new Set(data.map(r => r.categoria).filter(Boolean))].sort();
  const matrix = {};
  cgms.forEach(g => { matrix[g] = {}; cats.forEach(c => matrix[g][c] = 0); });
  data.forEach(r => { if (r.cgm && r.categoria) matrix[r.cgm][r.categoria]++; });

  const wrapH = Math.max(320, cgms.length * 38 + 80);

  useChartJS(cgmcatRef, {
    type: "bar",
    data: { labels: cgms, datasets: cats.map((c, i) => ({ label: c, data: cgms.map(g => matrix[g][c]), backgroundColor: PALETTE[i % PALETTE.length], borderRadius: 3, stack: "stack" })) },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top", labels: { font: { size: 10 }, boxWidth: 9, padding: 10 } }, tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.x.toLocaleString("es-AR")}` } } },
      scales: { x: { stacked: true, grid: { color: "rgba(0,0,0,.06)" }, ticks: { font: { size: 11 } } }, y: { stacked: true, ticks: { font: { size: 11 } } } }
    }
  }, [data.length]);

  const allDays = new Set(data.map(r => r.fecha).filter(Boolean));
  const dayCount = Math.max(allDays.size, 1);

  const rows = cgms.map(g => {
    const rows = data.filter(r => r.cgm === g);
    const t = rows.length;
    const catC = {}; rows.forEach(r => { if (r.categoria) catC[r.categoria] = (catC[r.categoria] || 0) + 1; });
    const topCat = Object.entries(catC).sort((a, b) => b[1] - a[1])[0];
    const horaC = {}; rows.forEach(r => { if (r.horario) { const h = r.horario.split(":")[0]; horaC[h] = (horaC[h] || 0) + 1; } });
    const topH = Object.entries(horaC).sort((a, b) => b[1] - a[1])[0];
    return { g, t, avg: (t / dayCount).toFixed(1), topCat: topCat ? topCat[0] : "—", topH: topH ? topH[0] + ":00 hs" : "—", pct: Math.round(t / (data.length || 1) * 100) };
  });

  return (
    <div>
      <div style={{ padding: "0 1.25rem", marginBottom: "1.25rem" }}>
        <ChartCard title="Top categorías por CGM" sub="Distribución apilada de alertas por centro de gestión municipal">
          <div style={{ position: "relative", height: wrapH }}><canvas ref={cgmcatRef} role="img" aria-label="Categorías por CGM" /></div>
        </ChartCard>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--txt1)", padding: "0 1.25rem", marginBottom: ".75rem" }}>Tabla resumen por CGM</div>
      <div style={{ padding: "0 1.25rem", overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["CGM","Total alertas","Promedio diario","Categoría principal","Hora pico"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "7px 10px", fontWeight: 500, borderBottom: "0.5px solid var(--brd)", color: "var(--txt2)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", background: "var(--bg2)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.g}>
                <td style={{ padding: "7px 10px", borderBottom: "0.5px solid var(--brd)", fontWeight: 500, color: "var(--txt1)" }}>{r.g}</td>
                <td style={{ padding: "7px 10px", borderBottom: "0.5px solid var(--brd)", color: "var(--txt1)" }}>{r.t.toLocaleString("es-AR")} <span style={{ color: "var(--txt2)", fontSize: 11 }}>({r.pct}%)</span></td>
                <td style={{ padding: "7px 10px", borderBottom: "0.5px solid var(--brd)", color: "var(--txt1)" }}>{r.avg}</td>
                <td style={{ padding: "7px 10px", borderBottom: "0.5px solid var(--brd)" }}><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "#E6F1FB", color: "#0C447C" }}>{r.topCat}</span></td>
                <td style={{ padding: "7px 10px", borderBottom: "0.5px solid var(--brd)", color: "var(--txt1)" }}>{r.topH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("resumen");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({ desde: "", hasta: "", cgm: "", cat: "", tipo: "", turno: "" });
  const [options, setOptions] = useState({ cgms: [], cats: [], tipos: [] });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => loadData();
    document.head.appendChild(script);
    const pdf1 = document.createElement("script");
    pdf1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(pdf1);
    const pdf2 = document.createElement("script");
    pdf2.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(pdf2);
  }, []);

  async function loadData() {
    try {
      setStatus("Conectando con Supabase…");
      const raw = await fetchAll();
      const data = raw.map(r => {
        const dow = new Date((r.fecha || "") + "T12:00:00").getDay();
        return { ...r, _turno: getTurno(r.horario, dow === 0 || dow === 6) };
      });
      setAllData(data);
      setFiltered(data);
      const dates = data.map(r => r.fecha).filter(Boolean).sort();
      setFilters(f => ({ ...f, desde: dates[0] || "", hasta: dates[dates.length - 1] || "" }));
      setOptions({
        cgms: [...new Set(data.map(r => r.cgm).filter(Boolean))].sort(),
        cats: [...new Set(data.map(r => r.categoria).filter(Boolean))].sort(),
        tipos: [...new Set(data.map(r => r.tipo).filter(Boolean))].sort(),
      });
      setStatus(`${data.length.toLocaleString("es-AR")} registros cargados`);
      setTimeout(() => setStatus(""), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let d = allData;
    if (filters.desde) d = d.filter(r => r.fecha >= filters.desde);
    if (filters.hasta) d = d.filter(r => r.fecha <= filters.hasta);
    if (filters.cgm) d = d.filter(r => r.cgm === filters.cgm);
    if (filters.cat) d = d.filter(r => r.categoria === filters.cat);
    if (filters.tipo) d = d.filter(r => r.tipo === filters.tipo);
    if (filters.turno) d = d.filter(r => r._turno === filters.turno);
    setFiltered(d);
  }

  function resetFilters() {
    const dates = allData.map(r => r.fecha).filter(Boolean).sort();
    const reset = { desde: dates[0] || "", hasta: dates[dates.length - 1] || "", cgm: "", cat: "", tipo: "", turno: "" };
    setFilters(reset);
    setFiltered(allData);
  }

  async function exportPDF() {
    if (!window.jspdf || !window.html2canvas) { alert("Las librerías de PDF todavía se están cargando. Intentá en unos segundos."); return; }
    setExporting(true);
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");
      const tabs = ["resumen","temporal","operativo","detalle"];
      const labels = ["Resumen","Evolución temporal","Operativo","Detalle por CGM"];
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      let first = true;
      for (let i = 0; i < tabs.length; i++) {
        setActiveTab(tabs[i]);
        await new Promise(r => setTimeout(r, 600));
        const panel = document.getElementById("panel-" + tabs[i]);
        if (!panel) continue;
        const canvas = await window.html2canvas(panel, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });
        const img = canvas.toDataURL("image/jpeg", 0.85);
        const ratio = canvas.height / canvas.width;
        const imgH = pw * ratio;
        if (!first) pdf.addPage();
        pdf.setFillColor(255,255,255); pdf.rect(0,0,pw,ph,"F");
        pdf.setFontSize(8); pdf.setTextColor(120);
        pdf.text(`Reporte Alertas Lomas de Zamora · ${labels[i]} · ${new Date().toLocaleDateString("es-AR")}`, 10, 7);
        const yOff = 11, pageH = ph - yOff - 8;
        if (imgH <= pageH) {
          pdf.addImage(img, "JPEG", 0, yOff, pw, imgH);
        } else {
          const srcH = canvas.width * pageH / pw;
          let srcY = 0;
          while (srcY < canvas.height) {
            const sl = document.createElement("canvas");
            sl.width = canvas.width; sl.height = Math.min(srcH, canvas.height - srcY);
            sl.getContext("2d").drawImage(canvas, 0, srcY, canvas.width, sl.height, 0, 0, canvas.width, sl.height);
            if (srcY > 0) { pdf.addPage(); pdf.text(`${labels[i]} (cont.)`, 10, 7); }
            pdf.addImage(sl.toDataURL("image/jpeg",.85), "JPEG", 0, yOff, pw, sl.height * pw / canvas.width);
            srcY += srcH;
          }
        }
        first = false;
      }
      const date = new Date().toLocaleDateString("es-AR").replace(/\//g,"-");
      pdf.save(`alertas-lomas-${date}.pdf`);
    } catch (e) { alert("Error al generar PDF: " + e.message); }
    setExporting(false);
  }

  const sel = (id, val, onChange, opts) => (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <span style={{ fontSize:11, color:"var(--txt2)", fontWeight:500, textTransform:"uppercase", letterSpacing:".04em" }}>{id}</span>
      <select value={val} onChange={e => onChange(e.target.value)}
        style={{ fontSize:13, padding:"6px 10px", borderRadius:8, border:"0.5px solid var(--brd)", background:"var(--bg1)", color:"var(--txt1)", height:34, minWidth:130 }}>
        <option value="">Todos</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const TABS = [["resumen","Resumen"],["temporal","Evolución temporal"],["operativo","Operativo"],["detalle","Detalle por CGM"]];

  return (
    <>
      <style>{`
        :root { --bg1:#fff; --bg2:#f5f5f3; --txt1:#1a1a1a; --txt2:#6b6b68; --brd:rgba(0,0,0,.12); }
        @media(prefers-color-scheme:dark){ :root{ --bg1:#1e1e1c; --bg2:#282826; --txt1:#f0efe8; --txt2:#9b9b97; --brd:rgba(255,255,255,.12); } }
        *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
        body{background:var(--bg2);color:var(--txt1)}
        input[type=date]{color-scheme:light dark}
      `}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 32 }}>

        {/* Topbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 1.25rem", borderBottom:"0.5px solid var(--brd)", marginBottom:"1.5rem", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src="/logo_izquierda.png" width={40} alt="Logo Lomas de Zamora" style={{ borderRadius:8, flexShrink:0 }}
              onError={e => { e.target.style.display="none"; }} />
            <div>
              <div style={{ fontSize:15, fontWeight:500, color:"var(--txt1)" }}>Sistema de Alertas — Lomas de Zamora</div>
              <div style={{ fontSize:12, color:"var(--txt2)", marginTop:1 }}>
                {loading ? "Cargando datos…" : `${filtered.length.toLocaleString("es-AR")} registros · ${allData.length.toLocaleString("es-AR")} total`}
              </div>
            </div>
          </div>
          <button onClick={exportPDF} disabled={exporting || loading}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#1B3A6B", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", opacity: (exporting||loading) ? .6 : 1 }}>
            <i className="ti ti-download" aria-hidden="true" />
            {exporting ? "Generando…" : "Exportar PDF"}
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"flex-end", padding:"0 1.25rem 1.25rem", borderBottom:"0.5px solid var(--brd)", marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ fontSize:11, color:"var(--txt2)", fontWeight:500, textTransform:"uppercase", letterSpacing:".04em" }}>Desde</span>
            <input type="date" value={filters.desde} onChange={e => setFilters(f => ({...f, desde:e.target.value}))}
              style={{ fontSize:13, padding:"6px 10px", borderRadius:8, border:"0.5px solid var(--brd)", background:"var(--bg1)", color:"var(--txt1)", height:34 }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ fontSize:11, color:"var(--txt2)", fontWeight:500, textTransform:"uppercase", letterSpacing:".04em" }}>Hasta</span>
            <input type="date" value={filters.hasta} onChange={e => setFilters(f => ({...f, hasta:e.target.value}))}
              style={{ fontSize:13, padding:"6px 10px", borderRadius:8, border:"0.5px solid var(--brd)", background:"var(--bg1)", color:"var(--txt1)", height:34 }} />
          </div>
          {sel("CGM", filters.cgm, v => setFilters(f=>({...f,cgm:v})), options.cgms)}
          {sel("Categoría", filters.cat, v => setFilters(f=>({...f,cat:v})), options.cats)}
          {sel("Tipo", filters.tipo, v => setFilters(f=>({...f,tipo:v})), options.tipos)}
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ fontSize:11, color:"var(--txt2)", fontWeight:500, textTransform:"uppercase", letterSpacing:".04em" }}>Turno</span>
            <select value={filters.turno} onChange={e => setFilters(f=>({...f,turno:e.target.value}))}
              style={{ fontSize:13, padding:"6px 10px", borderRadius:8, border:"0.5px solid var(--brd)", background:"var(--bg1)", color:"var(--txt1)", height:34, minWidth:120 }}>
              <option value="">Todos</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
          </div>
          <button onClick={applyFilters} style={{ height:34, padding:"0 16px", background:"var(--bg2)", border:"0.5px solid var(--brd)", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", color:"var(--txt1)", alignSelf:"flex-end" }}>Aplicar</button>
          <button onClick={resetFilters} style={{ height:34, padding:"0 12px", background:"transparent", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", color:"var(--txt2)", alignSelf:"flex-end" }}>Limpiar</button>
        </div>

        {error && <div style={{ margin:"0 1.25rem 1rem", padding:"12px 16px", borderRadius:8, background:"#FCEBEB", border:"0.5px solid #F7C1C1", fontSize:13, color:"#A32D2D" }}>{error}</div>}

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, padding:"4rem 0" }}>
            <div style={{ width:28, height:28, border:"2.5px solid var(--brd)", borderTopColor:"#1B3A6B", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            <span style={{ fontSize:13, color:"var(--txt2)" }}>{status || "Cargando…"}</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display:"flex", gap:2, padding:"0 1.25rem", marginBottom:"1.5rem" }}>
              {TABS.map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  style={{ padding:"6px 16px", fontSize:13, fontWeight:500, borderRadius:8, cursor:"pointer", border:"none", background: activeTab===id ? "#1B3A6B" : "transparent", color: activeTab===id ? "#fff" : "var(--txt2)", transition:"all .15s" }}>
                  {label}
                </button>
              ))}
            </div>

            <div id="panel-resumen" style={{ display: activeTab==="resumen" ? "block" : "none" }}><TabResumen data={filtered} /></div>
            <div id="panel-temporal" style={{ display: activeTab==="temporal" ? "block" : "none" }}><TabTemporal data={filtered} /></div>
            <div id="panel-operativo" style={{ display: activeTab==="operativo" ? "block" : "none" }}><TabOperativo data={filtered} /></div>
            <div id="panel-detalle" style={{ display: activeTab==="detalle" ? "block" : "none" }}><TabDetalle data={filtered} /></div>

            {status && (
              <div style={{ margin:"1rem 1.25rem 0", padding:"10px 14px", borderRadius:8, background:"var(--bg2)", border:"0.5px solid var(--brd)", fontSize:12, color:"var(--txt2)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#3B6D11", flexShrink:0, display:"inline-block" }} />
                {status}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
