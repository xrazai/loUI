import React, { useState, useEffect } from "react";

export function Tooltip({ content, shortcut, side = "top", children, forceOpen = false }) {
  const [o, setO] = useState(false);
  const show = o || forceOpen;
  return (
    <span onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)} onFocus={() => setO(true)} onBlur={() => setO(false)}
      style={{ position: "relative", display: "inline-flex" }}>
      {children}
      {show && <span role="tooltip" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", [side === "top" ? "bottom" : "top"]: "calc(100% + 6px)",
        padding: "5px 8px", background: "var(--primary-bg)", color: "var(--primary-fg)", borderRadius: "var(--radius-sm)", font: "500 var(--fs-label)/var(--lh-label) var(--font-sans)",
        whiteSpace: "nowrap", display: "flex", gap: 6, alignItems: "center", zIndex: 60, pointerEvents: "none" }}>
        {content}{shortcut && <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: "var(--primary-fg-muted)" }}>{shortcut}</span>}
      </span>}
    </span>
  );
}
