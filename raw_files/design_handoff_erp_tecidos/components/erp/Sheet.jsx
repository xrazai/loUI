import React, { useEffect } from "react";

export function Sheet({ open = true, title, meta, headerExtra, children, footer, onClose, width = 440, contained = false, padded = true, style }) {
  useEffect(() => {
    if (!open || !onClose) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  const pos = contained ? "absolute" : "fixed";
  return (
    <>
      <div onClick={onClose} style={{ position: pos, inset: 0, zIndex: 50, background: "var(--scrim)" }} />
      <aside role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}
        style={{ position: pos, top: 0, right: 0, bottom: 0, width, maxWidth: "100%", zIndex: 51, background: "var(--surface)", borderLeft: "1px solid var(--line-strong)", boxShadow: "var(--shadow-dialog)", display: "flex", flexDirection: "column", boxSizing: "border-box", ...style }}>
        <div style={{ height: "var(--topbar-h)", flex: "none", padding: "0 16px 0 24px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--line-subtle)" }}>
          <span style={{ font: "600 var(--fs-heading)/var(--lh-heading) var(--font-sans)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
          {meta && <span style={{ font: "400 var(--fs-label) var(--font-mono)", color: "var(--text-3)", whiteSpace: "nowrap" }}>{meta}</span>}
          {headerExtra}
          {onClose && <button type="button" onClick={onClose} aria-label="Fechar" title="Fechar (Esc)"
            style={{ marginLeft: "auto", width: 36, height: 36, flex: "none", border: "none", borderRadius: "var(--radius)", background: "transparent", color: "var(--text-3)", fontSize: 20, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-raised)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}>×</button>}
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: padded ? 24 : 0, display: "flex", flexDirection: "column", gap: padded ? 18 : 0 }}>{children}</div>
        {footer && <div style={{ flex: "none", padding: "16px 24px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid var(--line-subtle)" }}>{footer}</div>}
      </aside>
    </>
  );
}
