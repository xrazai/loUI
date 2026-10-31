import React, { useState } from "react";
import { Swatch } from "./Swatch";

export function ColorOption({ hex, label, selected = false, disabled = false, mark, onClick, style }) {
  const [h, setH] = useState(false);
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ minWidth: 0, height: "var(--control-h)", padding: "0 10px", display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box", textAlign: "left",
        borderRadius: "var(--radius)", font: "400 var(--fs-small) var(--font-sans)", color: "var(--text)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
        background: selected ? "var(--accent-soft)" : h && !disabled ? "var(--surface-raised)" : "var(--bg)",
        border: "1px solid " + (selected ? "var(--accent)" : "var(--line)"), transition: "background var(--duration) var(--ease), border-color var(--duration) var(--ease)", ...style }}>
      <Swatch hex={hex} size={18} />
      <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {(mark || selected) && <span style={{ fontSize: 12, color: selected ? "var(--accent)" : "var(--text-3)", whiteSpace: "nowrap" }}>{mark || "✓"}</span>}
    </button>
  );
}
