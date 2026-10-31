import React, { useState, useEffect } from "react";

const CHEVRON = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5' stroke='%237A7A82' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";
export function Select({ label, options = [], value, onChange, disabled, style, ...rest }) {
  const [f, setF] = useState(false);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500 }}>{label}</span>}
      <select value={value} disabled={disabled} onChange={(e) => onChange && onChange(e.target.value, e)} onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ appearance: "none", WebkitAppearance: "none", height: "var(--control-h)", padding: "0 30px 0 10px", background: `var(--bg) ${CHEVRON} no-repeat right 10px center`,
          border: "1px solid " + (f ? "var(--accent)" : "var(--line-strong)"), boxShadow: f ? "var(--focus-ring)" : "none", borderRadius: "var(--radius)",
          color: "var(--text)", font: "400 var(--fs-small) var(--font-sans)", outline: "none", cursor: "pointer", opacity: disabled ? 0.35 : 1 }} {...rest}>
        {options.map((o) => { const opt = typeof o === "string" ? { value: o, label: o } : o; return <option key={opt.value} value={opt.value} style={{ background: "var(--surface-raised)" }}>{opt.label}</option>; })}
      </select>
    </label>
  );
}
