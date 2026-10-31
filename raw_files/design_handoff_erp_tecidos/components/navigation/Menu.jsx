import React, { useState, useEffect } from "react";

function Item({ item, onClose }) {
  const [h, setH] = useState(false);
  return (
    <div role="menuitem" tabIndex={0} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => { item.onSelect && item.onSelect(); onClose && onClose(); }}
      style={{ height: "var(--item-h)", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderRadius: "var(--radius-sm)", cursor: "pointer",
        fontSize: "var(--fs-small)", color: item.danger ? "var(--danger)" : "var(--text)", background: h ? (item.danger ? "color-mix(in oklab, var(--danger) 12%, transparent)" : "var(--line)") : "transparent" }}>
      <span>{item.label}</span>
      {item.shortcut && <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{item.shortcut}</span>}
    </div>
  );
}
export function Menu({ items = [], width = 200, onClose, style }) {
  return (
    <div role="menu" style={{ width, padding: 4, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-overlay)", display: "flex", flexDirection: "column", boxSizing: "border-box", ...style }}>
      {items.map((it, i) => it.separator
        ? <div key={"s" + i} style={{ height: 1, margin: "4px -4px", background: "var(--line)" }} />
        : <Item key={it.label + i} item={it} onClose={onClose} />)}
    </div>
  );
}
