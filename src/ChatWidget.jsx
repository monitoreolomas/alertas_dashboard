import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { T } from "./theme.js";
import ChatChart from "./ChatChart.jsx";
import MarkdownLite from "./MarkdownLite.jsx";

const CONTEXTOS = {
  alertas: {
    titulo: "Asistente de Datos · Alertas",
    saludo:
      "¡Hola! Preguntame sobre las alertas o los usuarios registrados (Centro de Gestión Municipal). Los datos disponibles llegan hasta el 30/04/2026. También puedo responder sobre el reporte Tarima si lo necesitás.",
    sugeridas: [
      "¿Cuál fue la categoría de alerta más frecuente este mes?",
      "¿Qué zona (CGM) tuvo más alertas en la última semana?",
      "Compará alertas de ambulancia vs bomberos por turno",
      "¿Cuántos usuarios nuevos se registraron este mes?",
    ],
  },
  tarima: {
    titulo: "Asistente de Datos · Tarima",
    saludo:
      "¡Hola! Preguntame sobre las novedades de Tarima (Centro de Operaciones Lomas) — robos, conflictos, siniestros, etc. por comisaría. Los datos se actualizan en vivo. También puedo responder sobre el reporte de Alertas si lo necesitás.",
    sugeridas: [
      "¿Qué comisaría tuvo más novedades esta semana?",
      "¿Cuál es la categoría más común en Tarima?",
      "Compará robos por turno (mañana, tarde, noche)",
      "¿Qué porcentaje de novedades tienen cámara?",
    ],
  },
};

const NOMBRES_HERRAMIENTA = {
  consultar_alertas: "alertas",
  consultar_usuarios: "usuarios registrados",
  consultar_tarima: "novedades de Tarima",
  graficar: "el gráfico",
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

function ChatPrintExport({ data }) {
  if (!data) return null;
  return createPortal(
    <div id="chat-pdf-export">
      <div className="cpe-header">
        <div className="tit">{data.titulo}</div>
        <div className="sub">Generado {new Date().toLocaleString("es-AR")}</div>
      </div>
      <div className="cpe-msg">
        <MarkdownLite text={data.content} />
      </div>
      <div className="cpe-charts">
        {data.charts.map((c, i) => (
          <ChatChart key={i} spec={c} />
        ))}
      </div>
    </div>,
    document.body
  );
}

// Se resetea en cada carga real de página (el módulo se re-evalúa), pero
// sobrevive a que el componente se desmonte/remonte por navegación interna
// de la SPA (ej. pasar de Alertas a Tarima) dentro de la misma carga.
const contextosInicializados = new Set();

function iniciarEstadoChat(contexto, cfg) {
  const saludo = [{ role: "assistant", content: cfg.saludo, charts: [] }];
  const yaInicializado = contextosInicializados.has(contexto);
  contextosInicializados.add(contexto);

  let raw = null;
  try {
    raw = sessionStorage.getItem(`chat_activo_${contexto}`);
  } catch {}

  if (yaInicializado) {
    // Remount dentro de la misma carga de página: seguimos donde estábamos.
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) return { messages: parsed, anterior: null };
    } catch {}
    return { messages: saludo, anterior: null };
  }

  // Primera vez que se monta este contexto desde que se cargó la página
  // (incluye recargar/F5): archivamos lo que había como "anterior" y
  // arrancamos en blanco.
  let anterior = null;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 1) anterior = parsed;
  } catch {}
  try {
    sessionStorage.removeItem(`chat_activo_${contexto}`);
  } catch {}

  return { messages: saludo, anterior };
}

export default function ChatWidget({ contexto = "alertas" }) {
  const cfg = CONTEXTOS[contexto] || CONTEXTOS.alertas;
  const [open, setOpen] = useState(false);
  const [estadoInicial] = useState(() => iniciarEstadoChat(contexto, cfg));
  const [messages, setMessages] = useState(estadoInicial.messages);
  const [historialAnterior, setHistorialAnterior] = useState(estadoInicial.anterior);
  const [verAnterior, setVerAnterior] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [herramientaActual, setHerramientaActual] = useState(null);
  const [error, setError] = useState(null);
  const [printMsg, setPrintMsg] = useState(null);
  const [copiadoIdx, setCopiadoIdx] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open, verAnterior]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`chat_activo_${contexto}`, JSON.stringify(messages));
    } catch {}
  }, [messages, contexto]);

  useEffect(() => {
    if (!printMsg) return;
    document.body.classList.add("printing-chat");
    const t = setTimeout(() => window.print(), 150);
    function limpiar() {
      document.body.classList.remove("printing-chat");
      setPrintMsg(null);
    }
    window.addEventListener("afterprint", limpiar, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", limpiar);
    };
  }, [printMsg]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function enviarHistorial(historial) {
    setLoading(true);
    setHerramientaActual(null);
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

      if (!res.ok || !res.body) {
        let errMsg = `Error ${res.status}`;
        try {
          const j = await res.json();
          errMsg = j.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let final = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) >= 0) {
          const linea = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!linea) continue;
          const evento = JSON.parse(linea);
          if (evento.tipo === "tool_call") setHerramientaActual(evento.herramienta);
          else if (evento.tipo === "final") final = evento;
          else if (evento.tipo === "error") throw new Error(evento.error);
        }
      }

      if (!final) throw new Error("No se recibió respuesta del asistente.");
      setMessages((m) => [...m, { role: "assistant", content: final.reply || "(sin respuesta)", charts: final.charts || [] }]);
    } catch (e) {
      setError(e.message || "No se pudo conectar con el asistente.");
    } finally {
      setLoading(false);
      setHerramientaActual(null);
    }
  }

  function enviar() {
    const texto = input.trim();
    if (!texto || loading) return;
    const historial = [...messages, { role: "user", content: texto }];
    setMessages(historial);
    setInput("");
    enviarHistorial(historial);
  }

  function enviarSugerida(texto) {
    if (loading) return;
    const historial = [...messages, { role: "user", content: texto }];
    setMessages(historial);
    enviarHistorial(historial);
  }

  function regenerar(i) {
    if (loading) return;
    const historialPrevio = messages.slice(0, i);
    setMessages(historialPrevio);
    enviarHistorial(historialPrevio);
  }

  function copiar(i, contenido) {
    navigator.clipboard
      ?.writeText(contenido)
      .then(() => {
        setCopiadoIdx(i);
        setTimeout(() => setCopiadoIdx((c) => (c === i ? null : c)), 1500);
      })
      .catch(() => {});
  }

  function nuevoChat() {
    if (messages.length > 1) setHistorialAnterior(messages);
    setMessages([{ role: "assistant", content: cfg.saludo, charts: [] }]);
    setVerAnterior(false);
  }

  function borrarHistorial() {
    const inicial = [{ role: "assistant", content: cfg.saludo, charts: [] }];
    setMessages(inicial);
    setHistorialAnterior(null);
    setVerAnterior(false);
    try {
      sessionStorage.removeItem(`chat_activo_${contexto}`);
    } catch {}
  }

  function restaurarAnterior() {
    if (!historialAnterior) return;
    setMessages(historialAnterior);
    setHistorialAnterior(null);
    setVerAnterior(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className="no-print" style={{ fontFamily: "'Inter',sans-serif" }}>
      <ChatPrintExport data={printMsg} />
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
                onClick={nuevoChat}
                disabled={loading}
                title="Nueva conversación"
                style={{ background: "none", border: "none", color: loading ? "rgba(154,154,163,0.4)" : T.muted, cursor: loading ? "default" : "pointer", fontSize: 16, fontWeight: 700, lineHeight: 1, padding: "4px 8px" }}
              >
                +
              </button>
              {historialAnterior && (
                <button
                  onClick={() => setVerAnterior((v) => !v)}
                  title="Ver conversación anterior"
                  style={{ background: verAnterior ? "rgba(139,92,246,0.2)" : "none", border: "none", color: verAnterior ? T.accent : T.muted, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 6, borderRadius: 6 }}
                >
                  🕓
                </button>
              )}
              <button
                onClick={borrarHistorial}
                title="Borrar historial"
                style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 6 }}
              >
                🗑
              </button>
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
            {verAnterior ? (
              <>
                <div style={{ fontSize: 10.5, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Conversación anterior (antes de recargar la página)
                </div>
                {historialAnterior.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "94%", opacity: 0.85 }}>
                    <div
                      style={{
                        background: m.role === "user" ? T.accent : T.bg2,
                        color: m.role === "user" ? "#fff" : T.text,
                        borderRadius: 12,
                        padding: "9px 12px",
                        fontSize: 13,
                        lineHeight: 1.55,
                        whiteSpace: m.role === "user" ? "pre-wrap" : "normal",
                      }}
                    >
                      {m.role === "user" ? m.content : <MarkdownLite text={m.content} />}
                    </div>
                    {m.charts && m.charts.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {m.charts.map((c, ci) => (
                          <ChatChart key={ci} spec={c} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    onClick={restaurarAnterior}
                    style={{ background: T.accent, border: "none", color: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    ↺ Restaurar esta conversación
                  </button>
                  <button
                    onClick={() => setVerAnterior(false)}
                    style={{ background: "none", border: `1px solid ${T.border}`, color: T.text2, borderRadius: 8, padding: "7px 12px", fontSize: 11, cursor: "pointer" }}
                  >
                    ← Volver
                  </button>
                </div>
              </>
            ) : (
              <>
            {messages.map((m, i) => {
              const esUltimo = i === messages.length - 1;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "94%" }}>
                  <div
                    style={{
                      background: m.role === "user" ? T.accent : T.bg2,
                      color: m.role === "user" ? "#fff" : T.text,
                      borderRadius: 12,
                      padding: "9px 12px",
                      fontSize: 13,
                      lineHeight: 1.55,
                      whiteSpace: m.role === "user" ? "pre-wrap" : "normal",
                    }}
                  >
                    {m.role === "user" ? m.content : <MarkdownLite text={m.content} />}
                  </div>
                  {m.charts && m.charts.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {m.charts.map((c, ci) => (
                        <ChatChart key={ci} spec={c} />
                      ))}
                    </div>
                  )}
                  {m.role === "assistant" && m.content && (
                    <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", flexWrap: "wrap" }}>
                      <button
                        onClick={() => copiar(i, m.content)}
                        style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 10, padding: "0 2px", display: "flex", alignItems: "center", gap: 3 }}
                      >
                        {copiadoIdx === i ? "✓ Copiado" : "📋 Copiar"}
                      </button>
                      <button
                        onClick={() => descargarMensaje(m)}
                        style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 10, padding: "0 2px", display: "flex", alignItems: "center", gap: 3 }}
                      >
                        ⬇ Texto
                      </button>
                      <button
                        onClick={() => setPrintMsg({ content: m.content, charts: m.charts || [], titulo: cfg.titulo })}
                        style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 10, padding: "0 2px", display: "flex", alignItems: "center", gap: 3 }}
                      >
                        📄 PDF
                      </button>
                      {esUltimo && i > 0 && (
                        <button
                          onClick={() => regenerar(i)}
                          disabled={loading}
                          style={{ background: "none", border: "none", color: T.muted, cursor: loading ? "default" : "pointer", fontSize: 10, padding: "0 2px", display: "flex", alignItems: "center", gap: 3 }}
                        >
                          ↺ Regenerar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {messages.length === 1 && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cfg.sugeridas.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => enviarSugerida(s)}
                    style={{ textAlign: "left", background: T.bg2, border: `1px solid ${T.border}`, color: T.text2, borderRadius: 10, padding: "9px 12px", fontSize: 11.5, cursor: "pointer", lineHeight: 1.4 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ alignSelf: "flex-start", color: T.muted, fontSize: 11.5, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, display: "inline-block", animation: "livePulse 1s infinite" }} />
                {herramientaActual ? `Consultando ${NOMBRES_HERRAMIENTA[herramientaActual] || herramientaActual}…` : "Pensando…"}
              </div>
            )}
            {error && (
              <div style={{ alignSelf: "flex-start", color: T.red, fontSize: 11.5, background: "rgba(230,103,103,0.1)", border: "1px solid rgba(230,103,103,0.3)", borderRadius: 8, padding: "6px 10px" }}>
                {error}
              </div>
            )}
              </>
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
