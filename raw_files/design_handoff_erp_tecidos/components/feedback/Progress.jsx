import React, { useState, useEffect } from "react";

export function Progress({ value = 0, label, meta, tone = "accent", style }) {
  const c = { accent: "var(--accent)", success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" }[tone] || "var(--accent)";
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {(label || meta) && <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)" }}>
        <span style={{ color: "var(--text-2)" }}>{label}</span><span style={{ fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{meta}</span>
      </div>}
      <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} style={{ height: 4, borderRadius: "var(--radius-pill)", background: "var(--surface-hover)", overflow: "hidden" }}>
        <div style={{ width: v + "%", height: "100%", background: c, borderRadius: "var(--radius-pill)", transition: "width 300ms var(--ease)" }} />
      </div>
    </div>
  );
}
