import React, { useState, useEffect, useRef, useMemo } from "react";

function Section({ it, open, onToggle, last }) {
  const [h, setH] = useState(false);
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid var(--line-subtle)" }}>
      <button type="button" aria-expanded={open} onClick={onToggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: "100%", minHeight: "var(--row-h)", padding: "0 12px", display: "flex", alignItems: "center", gap: 10, border: "none", background: h ? "var(--surface-row-hover)" : "transparent",
          color: "var(--text)", font: "500 var(--fs-small) var(--font-sans)", textAlign: "left", cursor: "pointer", borderRadius: 0 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flex: "none", transform: open ? "rotate(90deg)" : "none", transition: "transform var(--duration) var(--ease)" }}><path d="M4.5 3 7.5 6 4.5 9" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span style={{ flex: 1 }}>{it.title}</span>
        {it.meta && <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{it.meta}</span>}
      </button>
      {open && <div style={{ padding: "0 12px 14px 34px", fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)", color: "var(--text-2)" }}>{it.content}</div>}
    </div>
  );
}
export function Accordion({ items = [], multiple = false, defaultValue = [], bordered = true, style }) {
  const [open, setOpen] = useState(defaultValue);
  const toggle = (v) => setOpen(open.includes(v) ? open.filter((x) => x !== v) : multiple ? [...open, v] : [v]);
  return (
    <div style={{ border: bordered ? "1px solid var(--line)" : "none", borderRadius: "var(--radius-lg)", overflow: "hidden", background: bordered ? "var(--surface)" : "transparent", ...style }}>
      {items.map((it, i) => <Section key={it.value} it={it} open={open.includes(it.value)} onToggle={() => toggle(it.value)} last={i === items.length - 1} />)}
    </div>
  );
}
