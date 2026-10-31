import React from "react";

const TONE = { neutral: "var(--text)", success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)", muted: "var(--text-3)" };
export function StatCard({ label, value, note, tone = "neutral", noteTone = "muted", size = "md", aside, children, style }) {
  return (
    <div style={{ padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 6, minWidth: 0, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}><span style={{ font: "500 var(--fs-caption) var(--font-mono)", letterSpacing: "var(--tracking-caption)", textTransform: "uppercase", color: "var(--text-3)", whiteSpace: "nowrap" }}>{label}</span>{aside && <span style={{ font: "400 12px var(--font-mono)", color: "var(--text-3)" }}>{aside}</span>}</div>
      <span style={{ font: (size === "lg" ? "600 30px/36px" : "500 24px/32px") + " var(--font-mono)", letterSpacing: size === "lg" ? "-0.02em" : "-0.01em", color: TONE[tone] || TONE.neutral, whiteSpace: "nowrap" }}>{value}</span>
      {children && <div style={{ margin: "4px 0" }}>{children}</div>}
      {note && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", color: TONE[noteTone] || TONE.muted }}>{note}</span>}
    </div>
  );
}
