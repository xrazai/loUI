import React, { useState, useEffect, useRef, useMemo } from "react";
import { Menu } from "../navigation/Menu";
import { Popover } from "../navigation/Popover";
function Row({ item, last, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 52, padding: "8px 8px 8px 12px", borderBottom: last ? "none" : "1px solid var(--line-subtle)", background: h ? "var(--surface-row-hover)" : "transparent", cursor: onClick ? "pointer" : "default" }}>
      {item.leading}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-small)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
        {item.description && <span style={{ fontSize: "var(--fs-label)", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</span>}
      </div>
      {item.meta && <span style={{ font: "400 var(--fs-label) var(--font-mono)", color: "var(--text-2)", whiteSpace: "nowrap" }}>{item.meta}</span>}
      {item.actions && item.actions.length > 0 && <span onClick={(e) => e.stopPropagation()}>
        <Popover align="end" trigger={<button type="button" aria-label="Ações" style={{ width: 28, height: 28, border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-2)", font: "600 var(--fs-small) var(--font-sans)", letterSpacing: 1, cursor: "pointer", opacity: h ? 1 : 0.5 }}>···</button>}>
          {(close) => <Menu items={item.actions} onClose={close} style={{ border: "none", boxShadow: "none", background: "transparent", padding: 0 }} />}
        </Popover>
      </span>}
    </div>
  );
}
export function ActionList({ items = [], onItemClick, bordered = true, style }) {
  return (
    <div role="list" style={{ border: bordered ? "1px solid var(--line)" : "none", borderRadius: "var(--radius-lg)", background: bordered ? "var(--surface)" : "transparent", ...style }}>
      {items.map((it, i) => <Row key={it.id || i} item={it} last={i === items.length - 1} onClick={onItemClick ? () => onItemClick(it) : undefined} />)}
    </div>
  );
}
