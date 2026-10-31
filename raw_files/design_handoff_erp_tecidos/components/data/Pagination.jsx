import React, { useState, useEffect, useRef, useMemo } from "react";

function pages(cur, n) {
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
  const s = new Set([1, n, cur, cur - 1, cur + 1]);
  const arr = [...s].filter((p) => p >= 1 && p <= n).sort((a, b) => a - b);
  const out = [];
  arr.forEach((p, i) => { if (i && p - arr[i - 1] > 1) out.push("…" + p); out.push(p); });
  return out;
}
export function Pagination({ page = 1, pageCount = 1, onChange, total, pageSize, style }) {
  const btn = (on) => ({ minWidth: 28, height: 28, padding: "0 6px", border: "1px solid " + (on ? "var(--line-strong)" : "transparent"), borderRadius: "var(--radius-sm)",
    background: on ? "var(--surface-raised)" : "transparent", color: on ? "var(--text)" : "var(--text-2)", font: "400 var(--fs-label) var(--font-mono)", cursor: "pointer" });
  const go = (p) => p >= 1 && p <= pageCount && p !== page && onChange && onChange(p);
  const from = total != null && pageSize ? (page - 1) * pageSize + 1 : null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, ...style }}>
      <span style={{ fontSize: "var(--fs-label)", color: "var(--text-3)" }}>{from != null ? (total === 0 ? "0 resultados" : `${from}–${Math.min(total, page * pageSize)} de ${total}`) : `Página ${page} de ${pageCount}`}</span>
      <nav aria-label="Paginação" style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button type="button" style={{ ...btn(false), opacity: page <= 1 ? 0.35 : 1 }} disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Anterior">‹</button>
        {pages(page, pageCount).map((p) => typeof p === "string"
          ? <span key={p} style={{ minWidth: 20, textAlign: "center", color: "var(--text-3)", fontSize: "var(--fs-label)" }}>…</span>
          : <button key={p} type="button" style={btn(p === page)} aria-current={p === page ? "page" : undefined} onClick={() => go(p)}>{p}</button>)}
        <button type="button" style={{ ...btn(false), opacity: page >= pageCount ? 0.35 : 1 }} disabled={page >= pageCount} onClick={() => go(page + 1)} aria-label="Próxima">›</button>
      </nav>
    </div>
  );
}
