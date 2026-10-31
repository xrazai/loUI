import React, { useState, useEffect } from "react";

const TONE = { danger: "var(--danger)", warning: "var(--warning)", accent: "var(--accent)", success: "var(--success)" };
export function Tabs({ items = [], value, onChange, style }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--line)", ...style }}>
      {items.map((it) => {
        const opt = typeof it === "string" ? { value: it, label: it } : it;
        const on = opt.value === value;
        const tc = TONE[opt.tone];
        return (
          <button key={opt.value} type="button" role="tab" aria-selected={on} onClick={() => onChange && onChange(opt.value)}
            style={{ padding: "0 0 10px", marginBottom: -1, border: "none", borderBottom: "2px solid " + (on ? "var(--text)" : "transparent"), background: "transparent",
              color: on ? "var(--text)" : "var(--text-3)", font: "500 var(--fs-small) var(--font-sans)", cursor: "pointer", borderRadius: 0, whiteSpace: "nowrap", display: "flex", gap: 6, alignItems: "center" }}>
            {opt.label}
            {opt.count != null && opt.count !== "" && (tc
              ? <span style={{ minWidth: 20, height: 20, padding: "0 6px", boxSizing: "border-box", borderRadius: "var(--radius-pill)", display: "inline-grid", placeItems: "center", font: "500 12px var(--font-mono)", color: tc, background: `color-mix(in oklab, ${tc} 14%, transparent)` }}>{opt.count}</span>
              : <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{opt.count}</span>)}
            {opt.shortcut && <span style={{ font: "500 var(--fs-caption) var(--font-mono)", padding: "0 5px", border: "1px solid var(--line)", borderRadius: 4, color: "var(--text-3)" }}>{opt.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}
