import React from "react";

export function StatusSteps({ steps = [], current = 0, complete = false, onSelect, style }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", ...style }}>
      {steps.map((s, i) => {
        const label = typeof s === "string" ? s : s.label;
        const done = i < current || (complete && i === current), cur = i === current && !done;
        const ring = done ? "var(--success)" : cur ? "var(--primary-bg)" : "var(--line-strong)";
        return (
          <div key={i} onClick={onSelect ? () => onSelect(i) : undefined} role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined} aria-current={i === current ? "step" : undefined} onKeyDown={(e) => onSelect && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(i))} title={onSelect ? "Mudar para este status" : undefined}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", padding: "4px 0", borderRadius: "var(--radius)", cursor: onSelect ? "pointer" : "default" }}
            onMouseEnter={(e) => onSelect && (e.currentTarget.style.background = "var(--surface-raised)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {i > 0 && <div style={{ position: "absolute", top: 13, left: "-50%", width: "100%", height: 2, background: i <= current ? "var(--success)" : "var(--line-strong)" }} />}
            <span style={{ position: "relative", width: 20, height: 20, borderRadius: "50%", display: "grid", placeItems: "center", boxSizing: "border-box",
              font: "600 11px var(--font-mono)", background: done || cur ? ring : "var(--surface)", border: "1.5px solid " + ring, color: done || cur ? "var(--text-inverse)" : "var(--text-3)" }}>{done ? "✓" : i + 1}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: done || cur ? "var(--text)" : "var(--text-3)", whiteSpace: "nowrap" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
