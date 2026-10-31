import React, { useState, useEffect } from "react";

export function SegmentedControl({ options = [], value, onChange, fullWidth = false, size = "md", style }) {
  const h = size === "sm" ? 26 : 32;
  return (
    <div role="tablist" style={{ display: fullWidth ? "flex" : "inline-flex", padding: 2, gap: 2, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--radius)", boxSizing: "border-box", ...style }}>
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        const on = opt.value === value;
        return (
          <button key={opt.value} type="button" role="tab" aria-selected={on} onClick={() => onChange && onChange(opt.value)}
            style={{ flex: fullWidth ? 1 : "none", height: h, padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none",
              borderRadius: "var(--radius-sm)", background: on ? "var(--surface-hover)" : "transparent", color: on ? "var(--text)" : "var(--text-2)",
              font: "500 var(--fs-label) var(--font-sans)", cursor: "pointer", transition: "background var(--duration) var(--ease)" }}>
            {opt.label}
            {opt.count != null && <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
