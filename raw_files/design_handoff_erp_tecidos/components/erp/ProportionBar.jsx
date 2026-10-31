import React from "react";

export const RAMP = ["var(--text)", "var(--text-2)", "var(--text-3)", "var(--line-strong)"];
export function ProportionBar({ segments = [], height = 10, legend = false, format = (v) => v, style }) {
  const total = segments.reduce((a, s) => a + (s.value || 0), 0);
  const segs = segments.map((s, i) => ({ ...s, color: s.color || RAMP[i % RAMP.length], pct: total ? (s.value / total) * 100 : 0 }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, ...style }}>
      <div style={{ height, borderRadius: height / 2, overflow: "hidden", display: "flex", gap: 2, background: "var(--line)" }}>
        {segs.map((s, i) => s.pct > 0 && <div key={i} title={`${s.label} · ${Math.round(s.pct)}%`} style={{ width: s.pct + "%", background: s.color }} />)}
      </div>
      {legend && <div style={{ display: "flex", flexDirection: "column" }}>
        {segs.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "10px minmax(0,1fr) 48px auto", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--line-subtle)" : "none" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ fontSize: "var(--fs-small)" }}>{s.label}</span>
            <span style={{ font: "400 var(--fs-label) var(--font-mono)", color: "var(--text-2)", textAlign: "right" }}>{Math.round(s.pct)}%</span>
            <span style={{ font: "500 var(--fs-small) var(--font-mono)", textAlign: "right" }}>{format(s.value)}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}
