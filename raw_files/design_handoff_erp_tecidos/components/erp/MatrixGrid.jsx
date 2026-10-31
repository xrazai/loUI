import React, { useState } from "react";

const light = (h) => { if (!/^#[0-9a-f]{6}$/i.test(h || "")) return false; const n = parseInt(h.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150; };
const CAP = { font: "500 var(--fs-caption) var(--font-mono)", letterSpacing: "var(--tracking-caption)", textTransform: "uppercase", color: "var(--text-3)", paddingBottom: 4 };
function Cell({ on, hex, tip, onClick }) {
  const [h, setH] = useState(false);
  return <button type="button" aria-pressed={on} title={tip} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    style={{ width: 40, height: 40, borderRadius: 8, display: "grid", placeItems: "center", boxSizing: "border-box", cursor: "pointer", font: "500 16px var(--font-sans)",
      transition: "background var(--duration) var(--ease), border-color var(--duration) var(--ease), transform var(--duration) var(--ease)", transform: h ? "scale(1.06)" : "none",
      background: on ? hex || "var(--text-2)" : "transparent", border: on ? "1px solid " + (h ? "var(--text-3)" : "rgba(255,255,255,.12)") : "1.5px dashed " + (h ? "var(--text-3)" : "var(--line-strong)"),
      color: on ? (light(hex) ? "var(--text-inverse)" : "var(--text)") : "var(--text-3)" }}>{on ? "✓" : "+"}</button>;
}
function Row({ r, cols, tpl, isOn, onToggle, showCount }) {
  const [h, setH] = useState(false);
  const n = cols.filter((c) => isOn && isOn(r.id, c.id)).length;
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "grid", gridTemplateColumns: tpl, alignItems: "center", minHeight: 60, padding: "0 20px", borderBottom: "1px solid var(--line-subtle)", minWidth: "max-content", background: h ? "var(--surface-row-hover)" : "transparent" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, paddingRight: 12 }}>
        <span style={{ fontSize: "var(--fs-small)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
        {r.meta && <span style={{ font: "400 12px var(--font-mono)", color: "var(--text-3)" }}>{r.meta}</span>}
      </div>
      {cols.map((c) => { const on = isOn ? isOn(r.id, c.id) : false;
        return <div key={c.id} style={{ display: "grid", placeItems: "center" }}><Cell on={on} hex={c.hex} tip={`${r.label} · ${c.label} — ${on ? "clique para desvincular" : "clique para vincular"}`} onClick={() => onToggle && onToggle(r.id, c.id)} /></div>; })}
      {showCount && <span style={{ textAlign: "right", font: "400 var(--fs-label) var(--font-mono)", color: "var(--text-2)" }}>{n}</span>}
    </div>
  );
}
export function MatrixGrid({ rows = [], cols = [], isOn, onToggle, corner = "", countLabel, hint, labelWidth = 220, cell = 64, style }) {
  const showCount = !!countLabel;
  const tpl = `${labelWidth}px repeat(${cols.length}, ${cell}px)${showCount ? " 64px" : ""}`;
  return (
    <section style={{ overflow: "auto", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", ...style }}>
      <div style={{ display: "grid", gridTemplateColumns: tpl, alignItems: "end", padding: "14px 20px 10px", borderBottom: "1px solid var(--line-subtle)", minWidth: "max-content" }}>
        <span style={CAP}>{corner}</span>
        {cols.map((c) => <div key={c.id} title={c.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "0 2px" }}>
          {c.hex && <span style={{ width: 18, height: 18, borderRadius: "50%", background: c.hex, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)" }} />}
          <span style={{ fontSize: 11.5, lineHeight: "14px", height: 28, overflow: "hidden", textAlign: "center", color: "var(--text-2)" }}>{c.label}</span>
        </div>)}
        {showCount && <span style={{ ...CAP, textAlign: "right" }}>{countLabel}</span>}
      </div>
      {rows.map((r) => <Row key={r.id} r={r} cols={cols} tpl={tpl} isOn={isOn} onToggle={onToggle} showCount={showCount} />)}
      {hint && <div style={{ padding: "12px 20px", fontSize: "var(--fs-label)", color: "var(--text-3)" }}>{hint}</div>}
    </section>
  );
}
