import React from "react";

const btn = (dis) => ({ width: 36, height: 36, flex: "none", border: "1px solid var(--line-strong)", borderRadius: "var(--radius)", background: "var(--surface-raised)",
  color: "var(--text)", fontSize: 18, lineHeight: 1, cursor: dis ? "default" : "pointer", opacity: dis ? 0.4 : 1 });
export function Stepper({ label, value = 1, onChange, min = 1, max = 99, suffix = "", style }) {
  const set = (v) => onChange && onChange(Math.min(max, Math.max(min, v)));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: label ? "space-between" : "flex-start", gap: 12, ...style }}>
      {label && <span style={{ fontSize: "var(--fs-label)", fontWeight: 500 }}>{label}</span>}
      <div role="group" aria-label={label} style={{ display: "flex", alignItems: "center", gap: 4 }}
        onKeyDown={(e) => { if (e.key === "ArrowUp" || e.key === "+") { e.preventDefault(); set(value + 1); } if (e.key === "ArrowDown" || e.key === "-") { e.preventDefault(); set(value - 1); } }}>
        <button type="button" aria-label="Diminuir" disabled={value <= min} onClick={() => set(value - 1)} style={btn(value <= min)}>−</button>
        <span aria-live="polite" style={{ minWidth: 44, textAlign: "center", font: "600 var(--fs-body) var(--font-mono)" }}>{value}{suffix}</span>
        <button type="button" aria-label="Aumentar" disabled={value >= max} onClick={() => set(value + 1)} style={btn(value >= max)}>+</button>
      </div>
    </div>
  );
}
