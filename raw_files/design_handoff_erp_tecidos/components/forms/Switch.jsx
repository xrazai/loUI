import React, { useState, useEffect } from "react";

export function Switch({ checked = false, onChange, label, description, disabled = false, style }) {
  const toggle = () => !disabled && onChange && onChange(!checked);
  const track = (
    <span role="switch" aria-checked={checked} tabIndex={disabled ? -1 : 0} onClick={(e) => { e.stopPropagation(); toggle(); }}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } }}
      style={{ width: 36, height: 20, flex: "none", borderRadius: "var(--radius-pill)", padding: 2, boxSizing: "border-box", cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "var(--accent)" : "var(--line-strong)", transition: "background var(--duration) var(--ease)", opacity: disabled ? 0.35 : 1, display: "block" }}>
      <span style={{ display: "block", width: 16, height: 16, borderRadius: "50%", background: "var(--gray-9)", transform: `translateX(${checked ? 16 : 0}px)`, transition: "transform var(--duration) var(--ease)" }} />
    </span>
  );
  if (!label) return track;
  return (
    <div onClick={toggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)" }}>{label}</span>
        {description && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: "var(--text-3)" }}>{description}</span>}
      </span>
      {track}
    </div>
  );
}
