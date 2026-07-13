import { useState, useRef, useEffect } from "react";
import { T } from "./theme.js";

const SALUDO_INICIAL = {
  role: "assistant",
  content:
    "¡Hola! Preguntame lo que quieras sobre las alertas o los usuarios registrados (los datos disponibles llegan hasta el 30/04/2026).",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([SALUDO_INICIAL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

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
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
      setMessages((m) => [...m, { role: "assistant", content: json.reply || "(sin respuesta)" }]);
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
    <div className="no-print" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, fontFamily: "'Inter',sans-serif" }}>
      {open && (
        <div
          style={{
            width: 360,
            height: 500,
            marginBottom: 12,
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: `linear-gradient(90deg,${T.bg2},#1a1535)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text, letterSpacing: "0.03em" }}>
                Asistente de Datos
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 4 }}
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  background: m.role === "user" ? T.accent : "rgba(255,255,255,0.05)",
                  color: m.role === "user" ? "#fff" : T.text,
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: T.muted, fontSize: 11.5, padding: "4px 12px" }}>
                Consultando datos…
              </div>
            )}
            {error && (
              <div style={{ alignSelf: "flex-start", color: T.red, fontSize: 11.5, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "6px 10px" }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ padding: 10, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Preguntá algo sobre los datos..."
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                background: "#0d0d1f",
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
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: `linear-gradient(135deg,${T.accent},${T.accent2})`,
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(139,92,246,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
        }}
        title="Preguntale a la IA sobre los datos"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
