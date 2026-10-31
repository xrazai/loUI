import React, { useState, useEffect } from "react";

const TONES = {
  neutral: { bg: "var(--surface-hover)", fg: "var(--text-2)", dot: "var(--text-3)" },
  accent: { bg: "var(--accent-soft)", fg: "var(--accent)", dot: "var(--accent)" },
  success: { bg: "var(--success-soft)", fg: "var(--success)", dot: "var(--success)" },
  warning: { bg: "var(--warning-soft)", fg: "var(--warning)", dot: "var(--warning)" },
  danger: { bg: "color-mix(in oklab, var(--danger) 14%, transparent)", fg: "var(--danger)", dot: "var(--danger)" },
};
export function Badge({ tone = "neutral", dot = true, children, style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{ height: 24, padding: "0 9px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-pill)", whiteSpace: "nowrap",
      font: "500 var(--fs-label) var(--font-sans)", background: t.bg, color: t.fg, boxSizing: "border-box", ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.dot }} />}
      {children}
    </span>
  );
}
