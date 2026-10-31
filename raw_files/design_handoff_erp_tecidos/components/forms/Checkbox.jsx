import React, { useState, useEffect } from "react";

export function Checkbox({ checked = false, onChange, label, description, disabled = false, style }) {
  const toggle = () => !disabled && onChange && onChange(!checked);
  return (
    <div role="checkbox" aria-checked={checked} aria-disabled={disabled} tabIndex={disabled ? -1 : 0}
      onClick={toggle} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } }}
      style={{ display: "flex", alignItems: description ? "flex-start" : "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1, borderRadius: "var(--radius-sm)", ...style }}>
      <span style={{ width: 18, height: 18, flex: "none", marginTop: description ? 2 : 0, borderRadius: 5, display: "grid", placeItems: "center", boxSizing: "border-box",
        background: checked ? "var(--accent)" : "var(--bg)", border: "1px solid " + (checked ? "var(--accent)" : "var(--line-strong)"), transition: "background var(--duration) var(--ease)" }}>
        {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.2 4.2 7.4 8 3" stroke="var(--text-inverse)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      {(label || description) && <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {label && <span style={{ fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)" }}>{label}</span>}
        {description && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: "var(--text-3)" }}>{description}</span>}
      </span>}
    </div>
  );
}
