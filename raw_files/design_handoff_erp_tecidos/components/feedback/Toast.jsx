import React, { useState, useEffect } from "react";

const DOT = { neutral: "var(--text-3)", success: "var(--success)", danger: "var(--danger)", accent: "var(--accent)" };
export function Toast({ children, tone = "success", actionLabel, onAction, onClose, style }) {
  return (
    <div role="status" style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: onClose || actionLabel ? "6px 6px 6px 14px" : "10px 14px", minHeight: 40, boxSizing: "border-box",
      background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-overlay)", fontSize: "var(--fs-small)", ...style }}>
      {tone && <span style={{ width: 6, height: 6, borderRadius: "50%", background: DOT[tone] || DOT.neutral, flex: "none" }} />}
      <span style={{ flex: 1 }}>{children}</span>
      {(actionLabel || onClose) && <span style={{ display: "flex", gap: 4 }}>
        {actionLabel && <button type="button" onClick={onAction} style={{ height: 26, padding: "0 10px", border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text)", font: "500 var(--fs-label) var(--font-sans)", cursor: "pointer" }}>{actionLabel}</button>}
        {onClose && <button type="button" aria-label="Fechar" onClick={onClose} style={{ width: 26, height: 26, border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-3)", fontSize: 15, cursor: "pointer" }}>×</button>}
      </span>}
    </div>
  );
}
