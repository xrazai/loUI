import React, { useState, useEffect } from "react";

export function Card({ title, actions, padding = 20, raised = false, children, style }) {
  return (
    <section style={{ background: raised ? "var(--surface-raised)" : "var(--surface)", border: "1px solid " + (raised ? "var(--line-strong)" : "var(--line)"),
      borderRadius: "var(--radius-lg)", padding, display: "flex", flexDirection: "column", gap: 16, boxShadow: raised ? "var(--shadow-overlay)" : "none", minWidth: 0, ...style }}>
      {(title || actions) && <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {title && <span style={{ font: "500 var(--fs-caption)/var(--lh-caption) var(--font-mono)", letterSpacing: "var(--tracking-caption)", textTransform: "uppercase", color: "var(--text-3)" }}>{title}</span>}
        {actions}
      </header>}
      {children}
    </section>
  );
}
