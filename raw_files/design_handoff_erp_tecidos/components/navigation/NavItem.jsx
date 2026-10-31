import React, { useState } from "react";

const TONE = { neutral: "var(--text-2)", accent: "var(--accent)", success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" };
const ICON_URL = (name) => `url(https://unpkg.com/lucide-static@0.400.0/icons/${name}.svg) center/contain no-repeat`;

export function NavItem({ label, icon, count, tone = "neutral", active = false, onClick, style }) {
  const [h, setH] = useState(false);
  const col = TONE[tone] || TONE.neutral;
  const lit = active || h;
  return (
    <div role="link" tabIndex={0} aria-current={active ? "page" : undefined} onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick && (e.preventDefault(), onClick())}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ height: "var(--item-h)", padding: "0 10px", display: "flex", alignItems: "center", gap: 12, borderRadius: "var(--radius-sm)", cursor: "pointer",
        fontSize: "var(--fs-small)", fontWeight: active ? 500 : 400, background: lit ? "var(--surface-raised)" : "transparent", color: lit ? "var(--text)" : "var(--text-2)",
        boxShadow: active ? "inset 2px 0 0 var(--text)" : "none", ...style }}>
      {icon && (typeof icon === "string"
        ? <span aria-hidden="true" style={{ width: 18, height: 18, flex: "none", background: "currentColor", opacity: active ? 1 : 0.7, WebkitMask: ICON_URL(icon), mask: ICON_URL(icon) }} />
        : <span aria-hidden="true" style={{ width: 18, height: 18, flex: "none", display: "grid", placeItems: "center", opacity: active ? 1 : 0.7 }}>{icon}</span>)}
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {count != null && count !== 0 && <span style={{ minWidth: 20, height: 20, padding: "0 6px", boxSizing: "border-box", borderRadius: "var(--radius-pill)", display: "inline-grid", placeItems: "center",
        font: "500 12px var(--font-mono)", color: col, background: tone === "neutral" ? "var(--surface-hover)" : `color-mix(in oklab, ${col} 14%, transparent)` }}>{count}</span>}
    </div>
  );
}
