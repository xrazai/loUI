import React from "react";

export function ChoiceTiles({ options = [], value, onChange, columns = 2, size = "lg", style }) {
  return (
    <div role="radiogroup" style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 8, ...style }}>
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        const on = opt.value === value;
        return (
          <button key={opt.value} type="button" role="radio" aria-checked={on} onClick={() => onChange && onChange(opt.value)}
            style={{ height: size === "lg" ? "var(--control-h-lg)" : "var(--control-h)", padding: "0 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              borderRadius: "var(--radius)", font: "500 var(--fs-small) var(--font-sans)", cursor: "pointer", boxSizing: "border-box",
              background: on ? "var(--accent-soft)" : "var(--bg)", border: "1px solid " + (on ? "var(--accent)" : "var(--line)"), color: on ? "var(--text)" : "var(--text-2)",
              transition: "background var(--duration) var(--ease), border-color var(--duration) var(--ease)" }}>
            {opt.label}
            {opt.meta && <span style={{ font: "400 11.5px var(--font-mono)", color: "var(--text-3)" }}>{opt.meta}</span>}
          </button>
        );
      })}
    </div>
  );
}
