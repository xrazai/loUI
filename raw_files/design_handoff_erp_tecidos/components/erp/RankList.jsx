import React, { useState } from "react";
import { Swatch } from "./Swatch";

function Row({ it, i, max, showPos, format }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={it.onClick} role={it.onClick ? "button" : undefined} tabIndex={it.onClick ? 0 : undefined} onKeyDown={(e) => it.onClick && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), it.onClick())} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "grid", gridTemplateColumns: (showPos ? "18px " : "") + "minmax(0,1fr) auto", gap: "6px 12px", alignItems: "center", padding: "9px 20px",
        cursor: it.onClick ? "pointer" : "default", background: h && it.onClick ? "var(--surface-row-hover)" : "transparent" }}>
      {showPos && <span style={{ font: "500 12px var(--font-mono)", color: "var(--text-3)" }}>{i + 1}</span>}
      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {it.swatch && <Swatch hex={it.swatch} size={14} />}
        <span style={{ fontSize: "var(--fs-small)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
      </span>
      <span style={{ font: "500 var(--fs-small) var(--font-mono)", textAlign: "right" }}>{format(it.value)}</span>
      {showPos && <span />}
      <div style={{ height: 4, borderRadius: 2, background: "var(--line)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 2, background: "var(--text-2)", width: (it.value / max) * 100 + "%" }} /></div>
      <span style={{ font: "400 12px var(--font-mono)", color: "var(--text-3)", textAlign: "right", whiteSpace: "nowrap" }}>{it.meta}</span>
    </div>
  );
}
export function RankList({ items = [], limit = 6, format = (v) => v, showPos = true, emptyText = "Sem dados no período.", style }) {
  const rows = [...items].sort((a, b) => b.value - a.value).slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <div style={{ padding: "24px 20px", textAlign: "center", fontSize: "var(--fs-small)", color: "var(--text-3)", ...style }}>{emptyText}</div>;
  return <div style={{ padding: "6px 0", ...style }}>{rows.map((it, i) => <Row key={it.id || it.label} it={it} i={i} max={max} showPos={showPos} format={format} />)}</div>;
}
