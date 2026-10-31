import React, { useState } from "react";

const ST = { test: ["Em teste", "var(--accent)", "var(--accent-soft)"], active: ["Ativo", "var(--success)", "var(--success-soft)"], paused: ["Pausado", "var(--warning)", "var(--warning-soft)"], soon: ["Em breve", "var(--text-2)", "var(--surface-hover)"] };
export function AgentCard({ name, area, icon, description, status = "active", pending = 0, last, onOpen, style }) {
  const [h, setH] = useState(false);
  const live = status !== "soon";
  const [sl, sc, sb] = ST[status] || ST.active;
  const mask = icon ? `url(https://unpkg.com/lucide-static@0.400.0/icons/${icon}.svg) center/contain no-repeat` : null;
  return (
    <div role={live ? "button" : undefined} tabIndex={live ? 0 : undefined} onClick={live ? onOpen : undefined}
      onKeyDown={(e) => live && onOpen && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ minHeight: 196, padding: 20, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14, borderRadius: "var(--radius-lg)",
        background: live ? "var(--surface)" : "transparent", border: "1px " + (live ? "solid" : "dashed") + " " + (h && live ? "var(--line-strong)" : "var(--line)"), cursor: live ? "pointer" : "default", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, flex: "none", borderRadius: "var(--radius)", background: "var(--surface-raised)", border: "1px solid var(--line)", display: "grid", placeItems: "center" }}>
          {mask && <span style={{ width: 20, height: 20, background: live ? "var(--text)" : "var(--text-3)", WebkitMask: mask, mask }} />}
        </span>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: live ? "var(--text)" : "var(--text-2)" }}>{name}</span>
          {area && <span style={{ fontSize: 12, color: "var(--text-3)" }}>{area}</span>}
        </div>
        <span style={{ height: 24, padding: "0 9px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-pill)", font: "500 var(--fs-label) var(--font-sans)", whiteSpace: "nowrap", color: sc, background: sb }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc }} />{sl}</span>
      </div>
      {description && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: "var(--text-2)", textWrap: "pretty" }}>{description}</span>}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingTop: 12, borderTop: "1px solid var(--line-subtle)" }}>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{last || (live ? "" : "Ainda não configurado")}</span>
        {live && pending > 0 && <span style={{ display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
          <span style={{ font: "600 var(--fs-heading) var(--font-mono)", color: "var(--accent)" }}>{pending}</span>
          <span style={{ fontSize: "var(--fs-label)", color: "var(--text-2)" }}>para aprovar</span></span>}
      </div>
    </div>
  );
}
