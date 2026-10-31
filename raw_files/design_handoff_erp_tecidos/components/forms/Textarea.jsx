import React, { useState } from "react";

export function Textarea({ label, hint, aside, error, rows = 3, resize = "vertical", disabled, style, inputStyle, id, ...rest }) {
  const [f, setF] = useState(false);
  const fid = id || (label ? "ta-" + String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);
  const border = error ? "var(--danger)" : f ? "var(--accent)" : "var(--line-strong)";
  return (
    <label htmlFor={fid} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, ...style }}>
      {(label || aside) && <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        {label && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500, color: disabled ? "var(--text-3)" : "var(--text)" }}>{label}</span>}
        {aside && <span style={{ fontSize: 12, color: "var(--text-3)" }}>{aside}</span>}
      </span>}
      <textarea id={fid} rows={rows} disabled={disabled} onFocus={(e) => { setF(true); rest.onFocus && rest.onFocus(e); }} onBlur={(e) => { setF(false); rest.onBlur && rest.onBlur(e); }}
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", resize, background: disabled ? "var(--surface)" : "var(--bg)", color: disabled ? "var(--text-3)" : "var(--text)",
          border: "1px " + (disabled ? "dashed var(--line)" : "solid " + border), borderRadius: "var(--radius)", outline: "none",
          boxShadow: f ? (error ? "var(--focus-ring-danger)" : "var(--focus-ring)") : "none", transition: "box-shadow var(--duration) var(--ease)",
          font: "400 var(--fs-small)/var(--lh-small) var(--font-sans)", ...inputStyle }} {...rest} />
      {(error || hint) && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: error ? "var(--danger)" : "var(--text-3)" }}>{error || hint}</span>}
    </label>
  );
}
