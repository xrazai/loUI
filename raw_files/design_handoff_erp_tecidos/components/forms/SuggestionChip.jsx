import React, { useState } from "react";

export function SuggestionChip({ children, onClick, disabled = false, style }) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ minHeight: "var(--control-h-sm)", maxWidth: "100%", boxSizing: "border-box", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-lg)", textAlign: "left", lineHeight: "18px",
        border: "1px dashed var(--line-strong)", background: h && !disabled ? "var(--surface-raised)" : "transparent", color: h && !disabled ? "var(--text)" : "var(--text-2)",
        font: "500 var(--fs-label) var(--font-sans)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
        transition: "background var(--duration) var(--ease), color var(--duration) var(--ease)", ...style }}>
      <span aria-hidden="true">+</span>{children}
    </button>
  );
}
