import React, { useState, useEffect } from "react";

export function Input({ label, hint, error, mono = false, leading, trailing, disabled, style, inputStyle, id, ...rest }) {
  const [f, setF] = useState(false);
  const fid = id || (label ? "in-" + String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);
  const border = error ? "var(--danger)" : f ? "var(--accent)" : "var(--line-strong)";
  return (
    <label htmlFor={fid} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500, color: disabled ? "var(--text-3)" : "var(--text)" }}>{label}</span>}
      <span style={{ height: "var(--control-h)", display: "flex", alignItems: "center", gap: 8, padding: "0 10px", boxSizing: "border-box",
        background: disabled ? "var(--surface)" : "var(--bg)", border: "1px " + (disabled ? "dashed var(--line)" : "solid " + border), borderRadius: "var(--radius)",
        boxShadow: f ? (error ? "var(--focus-ring-danger)" : "var(--focus-ring)") : "none", transition: "box-shadow var(--duration) var(--ease)" }}>
        {leading}
        <input id={fid} disabled={disabled} onFocus={(e) => { setF(true); rest.onFocus && rest.onFocus(e); }} onBlur={(e) => { setF(false); rest.onBlur && rest.onBlur(e); }}
          style={{ flex: 1, minWidth: 0, height: "100%", background: "transparent", border: "none", outline: "none", padding: 0,
            color: disabled ? "var(--text-3)" : "var(--text)", font: `400 var(--fs-small) ${mono ? "var(--font-mono)" : "var(--font-sans)"}`, ...inputStyle }} {...rest} />
        {trailing}
      </span>
      {(error || hint) && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: error ? "var(--danger)" : "var(--text-3)" }}>{error || hint}</span>}
    </label>
  );
}
