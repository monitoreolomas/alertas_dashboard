import { useRef, useState } from "react";
import { T } from "./theme.js";

const PALETA = [T.accent, T.green, T.amber, T.red, "#38bdf8", "#f472b6", "#a3e635", "#facc15"];

function Tooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: tooltip.x + 14,
        top: tooltip.y + 14,
        background: "#0d0d1f",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 11,
        color: T.text,
        pointerEvents: "none",
        zIndex: 10001,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      {tooltip.text}
    </div>
  );
}

function descargarSVGComoPNG(svgEl, nombreArchivo) {
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const bbox = svgEl.getBoundingClientRect();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bbox.width * scale));
    canvas.height = Math.max(1, Math.round(bbox.height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#16162a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
  };
  img.src = url;
}

function nombreArchivoDesdeTitulo(titulo) {
  return `${(titulo || "grafico").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.png`;
}

function ChartFrame({ titulo, svgRef, children }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: "12px 14px",
        marginTop: 8,
        maxWidth: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.text, letterSpacing: "0.03em" }}>{titulo}</span>
        <button
          onClick={() => descargarSVGComoPNG(svgRef.current, nombreArchivoDesdeTitulo(titulo))}
          style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, padding: 2, lineHeight: 1, flexShrink: 0 }}
          title="Descargar como imagen"
        >
          ⬇
        </button>
      </div>
      {children}
    </div>
  );
}

function GraficoBarras({ spec }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const etiquetas = spec.etiquetas || [];
  const series = (spec.series || []).filter((s) => s && s.valores).slice(0, 6);
  if (!etiquetas.length || !series.length) return null;

  const W = 460, H = 250, PAD_L = 34, PAD_B = 46, PAD_T = 10, PAD_R = 10;
  const maxVal = Math.max(1, ...series.flatMap((s) => s.valores || [0]));
  const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
  const grupoW = innerW / etiquetas.length;
  const barW = Math.max(4, (grupoW * 0.7) / series.length);

  return (
    <ChartFrame titulo={spec.titulo} svgRef={svgRef}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + innerH * (1 - f)} y2={PAD_T + innerH * (1 - f)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        {etiquetas.map((et, i) => {
          const xGrupo = PAD_L + i * grupoW + (grupoW - barW * series.length) / 2;
          return (
            <g key={`${et}-${i}`}>
              {series.map((s, si) => {
                const val = (s.valores || [])[i] || 0;
                const h = (val / maxVal) * innerH;
                const x = xGrupo + si * barW;
                const y = PAD_T + innerH - h;
                return (
                  <rect
                    key={`${s.nombre}-${si}`}
                    x={x}
                    y={y}
                    width={Math.max(1, barW - 2)}
                    height={h}
                    fill={PALETA[si % PALETA.length]}
                    rx="2"
                    onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${et} · ${s.nombre}: ${val.toLocaleString("es-AR")}` })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
              <text x={xGrupo + (barW * series.length) / 2} y={H - PAD_B + 16} textAnchor="middle" fontSize="9" fill={T.muted}>
                {String(et).length > 10 ? `${String(et).slice(0, 9)}…` : et}
              </text>
            </g>
          );
        })}
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={H - PAD_B} stroke="rgba(255,255,255,0.15)" />
        <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="rgba(255,255,255,0.15)" />
      </svg>
      {series.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
          {series.map((s, i) => (
            <div key={s.nombre} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.text2 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: PALETA[i % PALETA.length] }} />
              {s.nombre}
            </div>
          ))}
        </div>
      )}
      <Tooltip tooltip={tooltip} />
    </ChartFrame>
  );
}

function GraficoLineas({ spec }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const etiquetas = spec.etiquetas || [];
  const series = (spec.series || []).filter((s) => s && s.valores).slice(0, 6);
  if (!etiquetas.length || !series.length) return null;

  const W = 460, H = 250, PAD_L = 34, PAD_B = 30, PAD_T = 14, PAD_R = 10;
  const maxVal = Math.max(1, ...series.flatMap((s) => s.valores || [0]));
  const innerW = W - PAD_L - PAD_R, innerH = H - PAD_T - PAD_B;
  const n = etiquetas.length;
  const xAt = (i) => PAD_L + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const yAt = (v) => PAD_T + innerH - (v / maxVal) * innerH;
  const step = Math.max(1, Math.ceil(n / 8));

  return (
    <ChartFrame titulo={spec.titulo} svgRef={svgRef}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD_L} x2={W - PAD_R} y1={PAD_T + innerH * (1 - f)} y2={PAD_T + innerH * (1 - f)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}
        {series.map((s, si) => {
          const valores = s.valores || [];
          const pts = valores.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
          const color = PALETA[si % PALETA.length];
          return (
            <g key={`${s.nombre}-${si}`}>
              <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
              {valores.map((v, i) => (
                <circle
                  key={`hit-${i}`}
                  cx={xAt(i)}
                  cy={yAt(v)}
                  r="8"
                  fill="transparent"
                  onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${etiquetas[i]} · ${s.nombre}: ${v.toLocaleString("es-AR")}` })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: "pointer" }}
                />
              ))}
              {valores.map((v, i) => (
                <circle key={`dot-${i}`} cx={xAt(i)} cy={yAt(v)} r="2.5" fill={color} pointerEvents="none" />
              ))}
            </g>
          );
        })}
        {etiquetas
          .filter((_, i) => i % step === 0)
          .map((et, idx) => {
            const i = idx * step;
            return (
              <text key={i} x={xAt(i)} y={H - PAD_B + 16} textAnchor="middle" fontSize="9" fill={T.muted}>
                {String(et).length > 8 ? `${String(et).slice(0, 7)}…` : et}
              </text>
            );
          })}
      </svg>
      {series.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
          {series.map((s, i) => (
            <div key={s.nombre} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.text2 }}>
              <div style={{ width: 14, height: 2, background: PALETA[i % PALETA.length] }} />
              {s.nombre}
            </div>
          ))}
        </div>
      )}
      <Tooltip tooltip={tooltip} />
    </ChartFrame>
  );
}

function GraficoTorta({ spec }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const etiquetas = spec.etiquetas || [];
  const valores = (spec.series && spec.series[0] && spec.series[0].valores) || [];
  if (!etiquetas.length || !valores.length) return null;

  const total = valores.reduce((a, b) => a + b, 0) || 1;
  const r = 70, cx = 100, cy = 100, strokeW = 34;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = etiquetas.map((et, i) => {
    const val = valores[i] || 0;
    const frac = val / total;
    const dash = frac * circ;
    const seg = { et, val, color: PALETA[i % PALETA.length], dash, gap: circ - dash, offset: -acc, pct: frac * 100 };
    acc += dash;
    return seg;
  });

  return (
    <ChartFrame titulo={spec.titulo} svgRef={svgRef}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <svg ref={svgRef} width={200} height={200} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
          {segs.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeW}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${s.et}: ${s.val.toLocaleString("es-AR")} (${s.pct.toFixed(0)}%)` })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            />
          ))}
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="800" fill={T.text}>
            {total.toLocaleString("es-AR")}
          </text>
          <text x={cx} y={cy + 15} textAnchor="middle" fontSize="9" fill={T.muted}>
            Total
          </text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {segs.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: T.text2 }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span>
                {s.et} — {s.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <Tooltip tooltip={tooltip} />
    </ChartFrame>
  );
}

function GraficoHeatmap({ spec }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const filas = spec.filas || [];
  const columnas = spec.columnas || [];
  const matriz = spec.matriz || [];
  if (!filas.length || !columnas.length || !matriz.length) return null;

  const max = Math.max(1, ...matriz.flat());
  const cellW = 40, cellH = 26, labelW = 72, labelH = 16;
  const W = labelW + columnas.length * cellW + 8;
  const H = labelH + filas.length * cellH + 6;

  return (
    <ChartFrame titulo={spec.titulo} svgRef={svgRef}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {columnas.map((c, ci) => (
          <text key={c} x={labelW + ci * cellW + cellW / 2} y={labelH - 4} textAnchor="middle" fontSize="8" fill={T.muted}>
            {c}
          </text>
        ))}
        {filas.map((f, ri) => (
          <g key={f}>
            <text x={labelW - 6} y={labelH + ri * cellH + cellH / 2 + 3} textAnchor="end" fontSize="9" fill={T.text2}>
              {f}
            </text>
            {columnas.map((c, ci) => {
              const v = (matriz[ri] || [])[ci] || 0;
              const t = v / max;
              const bg = t < 0.02 ? "rgba(255,255,255,0.04)" : `rgba(139,92,246,${0.12 + t * 0.78})`;
              return (
                <rect
                  key={c}
                  x={labelW + ci * cellW}
                  y={labelH + ri * cellH}
                  width={cellW - 2}
                  height={cellH - 2}
                  fill={bg}
                  rx="3"
                  onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${f} · ${c}: ${v.toLocaleString("es-AR")}` })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </g>
        ))}
      </svg>
      <Tooltip tooltip={tooltip} />
    </ChartFrame>
  );
}

export default function ChatChart({ spec }) {
  if (!spec || !spec.tipo) return null;
  if (spec.tipo === "barras") return <GraficoBarras spec={spec} />;
  if (spec.tipo === "lineas") return <GraficoLineas spec={spec} />;
  if (spec.tipo === "torta") return <GraficoTorta spec={spec} />;
  if (spec.tipo === "heatmap") return <GraficoHeatmap spec={spec} />;
  return null;
}
