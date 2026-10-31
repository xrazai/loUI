import React, { useState, useEffect } from "react";

export function IconButton({ label, variant = "secondary", size = "md", disabled = false, children, style, ...rest }) {
  const [h, setH] = useState(false);
  const px = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const ghost = variant === "ghost";
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: px, height: px, display: "grid", placeItems: "center", padding: 0, borderRadius: size === "sm" ? "var(--radius-sm)" : "var(--radius)",
        border: ghost ? "1px solid transparent" : "1px solid var(--line-strong)",
        background: h && !disabled ? (ghost ? "var(--surface-raised)" : "var(--surface-hover)") : (ghost ? "transparent" : "var(--surface-raised)"),
        color: ghost && !h ? "var(--text-2)" : "var(--text)", fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1, ...style }} {...rest}>
      {children}
    </button>
  );
}
