import React, { useState, useEffect } from "react";

const T = { info: "var(--accent)", success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" };
export function Alert({ tone = "info", title, children, action, style }) {
  const c = T[tone] || T.info;
  const strong = tone !== "info";
  return (
    <div role={tone === "danger" ? "alert" : "status"} style={{ display: "flex", gap: 10, padding: 12, borderRadius: "var(--radius)",
      border: "1px solid " + (strong ? `color-mix(in oklab, ${c} 30%, transparent)` : "var(--line)"),
      background: strong ? `color-mix(in oklab, ${c} 6%, var(--bg))` : "var(--bg)", ...style }}>
      <span style={{ width: 16, height: 16, flex: "none", marginTop: 2, borderRadius: "50%", boxSizing: "border-box", display: "grid", placeItems: "center",
        border: strong ? "none" : "1.5px solid " + c, background: strong ? c : "transparent", color: strong ? "var(--text-inverse)" : c, font: "700 10px/1 var(--font-sans)" }}>
        {tone === "info" ? "i" : tone === "success" ? "✓" : "!"}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
        {title && <span style={{ fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)", fontWeight: 500 }}>{title}</span>}
        {children && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: "var(--text-2)" }}>{children}</span>}
      </div>
      {action && <div style={{ alignSelf: "center" }}>{action}</div>}
    </div>
  );
}
