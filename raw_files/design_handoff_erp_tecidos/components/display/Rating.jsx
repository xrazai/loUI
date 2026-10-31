import React from "react";

export function Rating({ value = 0, max = 5, size = 14, showValue = false, style }) {
  const v = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <span role="img" aria-label={`${v} de ${max} estrelas`} style={{ display: "inline-flex", alignItems: "center", gap: 6, ...style }}>
      <span aria-hidden="true" style={{ fontSize: size, letterSpacing: 1, lineHeight: 1 }}>
        <span style={{ color: "var(--warning)" }}>{"★".repeat(v)}</span><span style={{ color: "var(--line-strong)" }}>{"★".repeat(max - v)}</span>
      </span>
      {showValue && <span style={{ font: "500 var(--fs-label) var(--font-mono)", color: "var(--text-2)" }}>{v}/{max}</span>}
    </span>
  );
}
