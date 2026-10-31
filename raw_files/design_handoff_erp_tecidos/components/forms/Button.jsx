import React, { useState, useEffect } from "react";

const SIZES = {
  sm: { height: "var(--control-h-sm)", padding: "0 10px", fontSize: "var(--fs-label)", borderRadius: "var(--radius-sm)" },
  md: { height: "var(--control-h)", padding: "0 16px", fontSize: "var(--fs-small)", borderRadius: "var(--radius)" },
  lg: { height: "var(--control-h-lg)", padding: "0 20px", fontSize: "var(--fs-body)", borderRadius: "var(--radius)" },
};
function variantStyle(variant, h) {
  switch (variant) {
    case "primary": return { background: "var(--primary-bg)", color: "var(--primary-fg)", border: "1px solid transparent", filter: h ? "brightness(0.88)" : "none" };
    case "ghost": return { background: h ? "var(--surface-raised)" : "transparent", color: h ? "var(--text)" : "var(--text-2)", border: "1px solid transparent" };
    case "danger": return { background: h ? "var(--danger-soft-hover)" : "var(--danger-soft)", color: "var(--danger)", border: "1px solid var(--danger-line)" };
    case "danger-solid": return { background: "var(--danger)", color: "var(--text-inverse)", border: "1px solid transparent", filter: h ? "brightness(0.9)" : "none" };
    default: return { background: h ? "var(--surface-hover)" : "var(--surface-raised)", color: "var(--text)", border: "1px solid var(--line-strong)" };
  }
}
export function Button({ variant = "secondary", size = "md", fullWidth = false, disabled = false, leading, trailing, children, style, type = "button", ...rest }) {
  const [h, setH] = useState(false);
  const hov = h && !disabled;
  return (
    <button type={type} disabled={disabled} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...SIZES[size], ...variantStyle(variant, hov), display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: fullWidth ? "100%" : undefined, boxSizing: "border-box", fontFamily: "var(--font-sans)", fontWeight: 500, whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1, transition: "background var(--duration) var(--ease)", ...style }}
      {...rest}>
      {leading}{children}{trailing}
    </button>
  );
}
