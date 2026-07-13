import { useState } from "react";
import { T } from "./theme.js";
import App from "./App.jsx";
import Tarima from "./Tarima.jsx";

const REPORTES = [
  {
    id: "alertas",
    titulo: "Alertas",
    sub: "Centro de Gestión Municipal",
    desc: "Ambulancia, policía, bomberos, sirenas, usuarios registrados y mapa por zona.",
    icon: "⚡",
  },
  {
    id: "tarima",
    titulo: "Tarima",
    sub: "Centro de Operaciones Lomas",
    desc: "Novedades por comisaría, cobertura de cámaras e índice de riesgo territorial.",
    icon: "🔵",
  },
];

export default function Home() {
  const [reporte, setReporte] = useState(null);

  if (reporte === "alertas") return <App onVolver={() => setReporte(null)} />;
  if (reporte === "tarima") return <Tarima onVolver={() => setReporte(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        body{background:${T.bg};}
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, color: T.text2, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Municipalidad de Lomas de Zamora
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.text }}>Elegí un reporte</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, maxWidth: 700, width: "100%" }}>
        {REPORTES.map((r) => (
          <button
            key={r.id}
            onClick={() => setReporte(r.id)}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "28px 24px",
              textAlign: "left",
              cursor: "pointer",
              color: T.text,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "transform 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              {r.icon}
            </div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{r.titulo}</div>
            <div style={{ fontSize: 11, color: T.text2, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{r.sub}</div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{r.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
