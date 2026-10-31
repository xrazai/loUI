import React, { useState, useEffect } from "react";

export function Dialog({ open = true, title, description, children, footer, onClose, width = 420, contained = false }) {
  useEffect(() => {
    if (!open || !onClose) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: contained ? "absolute" : "fixed", inset: 0, zIndex: 50, background: "var(--overlay)", display: "grid", placeItems: "center", padding: 24 }}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: width, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-dialog)" }}>
        <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: "var(--fs-heading)", lineHeight: "var(--lh-heading)", fontWeight: 600 }}>{title}</span>
          {description && <span style={{ fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)", color: "var(--text-2)" }}>{description}</span>}
        </div>
        {children && <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>}
        {footer && <div style={{ padding: children ? "14px 20px" : "18px 20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, borderTop: children ? "1px solid var(--line)" : "none" }}>{footer}</div>}
      </div>
    </div>
  );
}
