import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "../feedback/Spinner";

export function ChatPanel({ title = "Conversar com o agente", intro, prompts = [], messages = [], busy = false, onSend, onClear, placeholder = "Pergunte ou peça algo…", style }) {
  const [v, setV] = useState("");
  const list = useRef(null);
  useEffect(() => { if (list.current) list.current.scrollTop = list.current.scrollHeight; }, [messages.length, busy]);
  const send = (t) => { const s = String(t != null ? t : v).trim(); if (!s || busy) return; onSend && onSend(s); if (t == null) setV(""); };
  const empty = messages.length === 0 && !busy;
  return (
    <aside style={{ background: "var(--surface)", display: "flex", flexDirection: "column", minHeight: 0, height: "100%", ...style }}>
      <div style={{ height: 56, flex: "none", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottom: "1px solid var(--line-subtle)" }}>
        <span style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>{title}</span>
        {onClear && messages.length > 0 && <button type="button" onClick={onClear} style={{ height: 28, padding: "0 8px", border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-3)", font: "500 12px var(--font-sans)", cursor: "pointer" }}>Limpar</button>}
      </div>
      <div ref={list} role="log" aria-live="polite" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {empty && intro && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: "var(--text-2)", textWrap: "pretty" }}>{intro}</span>}
        {empty && prompts.map((p) => <button key={p} type="button" onClick={() => send(p)}
          style={{ padding: "10px 12px", textAlign: "left", border: "1px solid var(--line)", borderRadius: "var(--radius)", background: "var(--bg)", color: "var(--text)", font: "400 var(--fs-label)/var(--lh-label) var(--font-sans)", cursor: "pointer" }}>{p}</button>)}
        {messages.map((m, i) => { const me = m.role === "user";
          return <div key={i} style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "10px 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", whiteSpace: "pre-wrap", textWrap: "pretty",
              background: me ? "var(--surface-hover)" : "var(--bg)", border: "1px solid " + (me ? "transparent" : m.error ? "var(--danger-line)" : "var(--line)"), color: m.error ? "var(--danger)" : "var(--text)" }}>{m.content}</div>
          </div>; })}
        {busy && <Spinner size={14} label="Pensando…" />}
      </div>
      <div style={{ flex: "none", padding: "12px 16px 16px", borderTop: "1px solid var(--line-subtle)", display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={v} onChange={(e) => setV(e.target.value)} rows={2} placeholder={placeholder} aria-label={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "9px 12px", resize: "none", background: "var(--bg)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius)", color: "var(--text)", font: "400 var(--fs-label)/var(--lh-label) var(--font-sans)", outline: "none" }} />
        <button type="button" onClick={() => send()} title="Enviar (Enter)" disabled={!v.trim() || busy}
          style={{ height: "var(--control-h)", padding: "0 14px", border: "none", borderRadius: "var(--radius)", background: "var(--primary-bg)", color: "var(--primary-fg)", font: "500 var(--fs-label) var(--font-sans)", cursor: "pointer", opacity: v.trim() && !busy ? 1 : 0.4 }}>Enviar</button>
      </div>
    </aside>
  );
}
