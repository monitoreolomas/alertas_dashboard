import { useState, useRef, useEffect } from "react";
import { T } from "./theme.js";
import ChatChart from "./ChatChart.jsx";

const CONTEXTOS = {
  alertas: {
    titulo: "Asistente de Datos · Alertas",
    saludo:
      "¡Hola! Preguntame sobre las alertas o los usuarios registrados (Centro de Gestión Municipal). Los datos disponibles llegan hasta el 30/04/2026. También puedo responder sobre el reporte Tarima si lo necesitás.",
  },
  tarima: {
    titulo: "Asistente de Datos · Tarima",
    saludo:
      "¡Hola! Preguntame sobre las novedades de Tarima (Centro de Operaciones Lomas) — robos, conflictos, siniestros, etc. por comisaría. Los datos se actualizan en vivo. También puedo responder sobre el reporte de Alertas si lo necesitás.",
  },
};

function descargarTexto(nombreArchivo, contenido) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function descargarMensaje(m) {
  descargarTexto(`respuesta_asistente_${new Date().toISOString().slice(0, 10)}.txt`, m.content);
}

function descargarConversacion(messages) {
  const texto = messages.map((m) => `${m.role === "user" ? "Vos" : "Asistente"}:\n${m.content}\n`).join("\n---\n\n");
  descargarTexto(`conversacion_${new Date().toISOString().slice(0, 10)}.txt`, texto);
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function descargarMensajePDF(m, chartsWrapperEl, titulo) {
  const win = window.open("", "_blank");
  if (!win) return;

  let chartsHTML = "";
  if (chartsWrapperEl) {
    Array.from(chartsWrapperEl.children).forEach((frame) => {
      const clone = frame.cloneNode(true);
      clone.querySelectorAll("button").forEach((b) => b.remove());
      chartsHTML += clone.outerHTML;
    });
  }

  const fecha = new Date().toLocaleString("es-AR");
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>respuesta_asistente_${new Date().toISOString().slice(0, 10)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  body { background:#ffffff; color:#18181b; font-family:'Inter',sans-serif; padding:32px; max-width:760px; margin:0 auto; }
  .header { border-bottom:2px solid #8b5cf6; padding-bottom:10px; margin-bottom:18px; }
  .header .tit { font-size:16px; font-weight:800; }
  .header .sub { font-size:11px; color:#71717a; margin-top:3px; }
  .msg { white-space:pre-wrap; font-size:13px; line-height:1.65; margin-bottom:18px; }
  .pdf-export, .pdf-export * { color:#18181b !important; }
  .pdf-export svg text { fill:#18181b !important; }
  .pdf-export > div { background:#ffffff !important; box-shadow:none !important; border:1px solid #e4e4e7 !important; border-radius:10px; padding:12px 14px !important; margin-top:10px !important; }
  @media print { body { padding:12px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="tit">${escapeHTML(titulo)}</div>
    <div class="sub">Generado ${fecha}</div>
  </div>
  <div class="msg">${escapeHTML(m.content)}</div>
  <div class="pdf-export">${chartsHTML}</div>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 350);
}

export default function ChatWidget({ contexto = "alertas" }) {
  const cfg = CONTEXTOS[contexto] || CONTEXTOS.alertas;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: "assistant", content: cfg.saludo, charts: [] }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const chartsRefs = useRef({});

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || loading) return;

    const historial = [...messages, { role: "user", content: texto }];
    setMessages(historial);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historial.map((m) => ({ role: m.role, content: m.content })),
          contexto,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      setMessages((m) => [...m, { role: "assistant", content: json.reply || "(sin respuesta)", charts: json.charts || [] }]);
    } catch (e) {
      setError(e.message || "No se pudo conectar con el asistente.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className="no-print" style={{ fontFamily: "'Inter',sans-serif" }}>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            animation: "fadeIn 0.15s ease",
          }}
        />
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "min(440px, 100vw)",
            background: T.card,
            borderLeft: `1px solid ${T.border}`,
            boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1001,
            animation: "chatSlideIn 0.22s ease",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: T.bg2,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💬</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cfg.titulo}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => descargarConversacion(messages)}
                title="Exportar conversación"
                style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 6 }}
              >
                ⬇
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Cerrar"
                style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "4px 6px" }}
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "94%" }}>
                <div
                  style={{
                    background: m.role === "user" ? T.accent : T.bg2,
                    color: m.role === "user" ? "#fff" : T.text,
                    borderRadius: 12,
                    padding: "9px 12px",
                    fontSize: 13,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
                {m.charts && m.charts.length > 0 && (
                  <div ref={(el) => { chartsRefs.current[i] = el; }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.charts.map((c, ci) => (
                      <ChatChart key={ci} spec={c} />
                    ))}
                  </div>
                )}
                {m.role === "assistant" && m.content && (
                  <div style={{ display: "flex", gap: 10, alignSelf: "flex-start" }}>
                    <button
                      onClick={() => descargarMensaje(m)}
                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 10, padding: "0 2px", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      ⬇ Texto
                    </button>
                    <button
                      onClick={() => descargarMensajePDF(m, chartsRefs.current[i], cfg.titulo)}
                      style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 10, padding: "0 2px", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      📄 PDF
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: T.muted, fontSize: 11.5, padding: "4px 12px" }}>
                Consultando datos…
              </div>
            )}
            {error && (
              <div style={{ alignSelf: "flex-start", color: T.red, fontSize: 11.5, background: "rgba(230,103,103,0.1)", border: "1px solid rgba(230,103,103,0.3)", borderRadius: 8, padding: "6px 10px" }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Preguntá algo sobre los datos..."
              rows={2}
              style={{
                flex: 1,
                resize: "none",
                background: T.bg2,
                border: `1px solid ${T.border}`,
                color: T.text,
                borderRadius: 10,
                padding: "8px 10px",
                fontSize: 12.5,
                fontFamily: "'Inter',sans-serif",
                outline: "none",
              }}
            />
            <button
              onClick={enviar}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? "rgba(139,92,246,0.25)" : T.accent,
                border: "none",
                color: "#fff",
                borderRadius: 10,
                padding: "0 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: loading || !input.trim() ? "default" : "pointer",
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: T.accent,
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(139,92,246,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1002,
        }}
        title={open ? "Cerrar asistente" : "Preguntale a la IA sobre los datos"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
