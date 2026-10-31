import React, { useState, useEffect, useRef, useMemo } from "react";
import { Checkbox } from "../forms/Checkbox";
import { Pagination } from "./Pagination";
export function DataTable({ columns = [], rows = [], rowKey = "id", selectable = false, pageSize = 10, onRowClick, activeKey, bulkActions, empty, defaultSort, style }) {
  const [sort, setSort] = useState(defaultSort || null);
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState([]);
  const [hov, setHov] = useState(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const c = columns.find((x) => x.key === sort.key);
    const get = c && c.sortValue ? c.sortValue : (r) => r[sort.key];
    return [...rows].sort((a, b) => { const x = get(a), y = get(b); return (x > y ? 1 : x < y ? -1 : 0) * (sort.dir === "asc" ? 1 : -1); });
  }, [rows, sort]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const p = Math.min(page, pageCount);
  const view = sorted.slice((p - 1) * pageSize, p * pageSize);
  const keys = view.map((r) => r[rowKey]);
  const allOn = keys.length > 0 && keys.every((k) => sel.includes(k));
  const toggleAll = () => setSel(allOn ? sel.filter((k) => !keys.includes(k)) : [...new Set([...sel, ...keys])]);
  const toggle = (k) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k]);
  const clickSort = (c) => { if (c.sortable === false) return; setSort(!sort || sort.key !== c.key ? { key: c.key, dir: "asc" } : sort.dir === "asc" ? { key: c.key, dir: "desc" } : null); };
  const cols = (selectable ? "32px " : "") + columns.map((c) => c.width || "minmax(0,1fr)").join(" ");
  const cell = (c) => ({ textAlign: c.align || "left", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...(c.mono ? { font: "400 var(--fs-label) var(--font-mono)" } : { fontSize: "var(--fs-small)" }) });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0, ...style }}>
      {selectable && sel.length > 0 && <div style={{ height: 36, padding: "0 6px 0 12px", display: "flex", alignItems: "center", gap: 12, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius)" }}>
        <span style={{ fontSize: "var(--fs-small)", fontWeight: 500 }}>{sel.length} selecionado{sel.length > 1 ? "s" : ""}</span>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>{bulkActions && bulkActions(sel, () => setSel([]))}
          <button type="button" onClick={() => setSel([])} style={{ height: 26, padding: "0 10px", border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-2)", font: "500 var(--fs-label) var(--font-sans)", cursor: "pointer" }}>Limpar</button></div>
      </div>}
      <div role="table" style={{ minWidth: 0 }}>
        <div role="row" style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", padding: "0 10px 8px", borderBottom: "1px solid var(--line-subtle)" }}>
          {selectable && <Checkbox checked={allOn} onChange={toggleAll} />}
          {columns.map((c) => {
            const on = sort && sort.key === c.key;
            return <button key={c.key} type="button" role="columnheader" onClick={() => clickSort(c)}
              style={{ display: "flex", justifyContent: c.align === "right" ? "flex-end" : "flex-start", alignItems: "center", gap: 4, padding: 0, border: "none", background: "transparent",
                font: "500 var(--fs-caption) var(--font-mono)", letterSpacing: ".08em", textTransform: "uppercase", color: on ? "var(--text)" : "var(--text-3)", cursor: c.sortable === false ? "default" : "pointer" }}>
              {c.label}{c.sortable !== false && <span style={{ opacity: on ? 1 : 0.4 }}>{on ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>}
            </button>;
          })}
        </div>
        {view.map((r) => {
          const k = r[rowKey], active = k === activeKey, picked = sel.includes(k);
          return <div key={k} role="row" tabIndex={onRowClick ? 0 : undefined} onClick={() => onRowClick && onRowClick(r)} onKeyDown={(e) => onRowClick && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onRowClick(r))} onMouseEnter={() => setHov(k)} onMouseLeave={() => setHov(null)}
            style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", height: "var(--row-h)", padding: "0 10px", borderBottom: "1px solid var(--line-subtle)", borderRadius: "var(--radius-sm)",
              cursor: onRowClick ? "pointer" : "default", background: active || picked ? "var(--surface-raised)" : hov === k ? "var(--surface-row-hover)" : "transparent", boxShadow: active ? "inset 2px 0 0 var(--text)" : "none" }}>
            {selectable && <span onClick={(e) => e.stopPropagation()}><Checkbox checked={picked} onChange={() => toggle(k)} /></span>}
            {columns.map((c) => <span key={c.key} role="cell" style={{ ...cell(c), color: c.muted ? "var(--text-2)" : "var(--text)" }}>{c.render ? c.render(r) : r[c.key]}</span>)}
          </div>;
        })}
        {rows.length === 0 && (empty || <div style={{ padding: "40px 0", textAlign: "center", fontSize: "var(--fs-small)", color: "var(--text-3)" }}>Nenhum registro.</div>)}
      </div>
      {sorted.length > pageSize && <Pagination page={p} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onChange={setPage} />}
    </div>
  );
}
