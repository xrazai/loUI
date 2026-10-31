import React, { useState, useEffect } from "react";

export function RadioGroup({ options = [], value, onChange, direction = "row", disabled = false, style }) {
  return (
    <div role="radiogroup" style={{ display: "flex", flexDirection: direction === "row" ? "row" : "column", gap: direction === "row" ? 18 : 10, flexWrap: "wrap", ...style }}>
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        const on = opt.value === value;
        return (
          <div key={opt.value} role="radio" aria-checked={on} tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onChange && onChange(opt.value)}
            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); !disabled && onChange && onChange(opt.value); } }}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1, fontSize: "var(--fs-small)", borderRadius: "var(--radius-sm)" }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", display: "grid", placeItems: "center", boxSizing: "border-box", border: "1px solid " + (on ? "var(--accent)" : "var(--line-strong)"), background: "var(--bg)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--accent)", opacity: on ? 1 : 0, transition: "opacity var(--duration) var(--ease)" }} />
            </span>
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}
