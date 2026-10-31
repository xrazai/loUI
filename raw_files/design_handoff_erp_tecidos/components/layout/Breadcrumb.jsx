import React, { useState, useEffect, useRef, useMemo } from "react";

export function Breadcrumb({ items = [], style }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, fontSize: "var(--fs-small)", ...style }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return <React.Fragment key={i}>
          {i > 0 && <span style={{ color: "var(--line-strong)" }}>/</span>}
          {last ? <span aria-current="page" style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
            : <a href={it.href || "#"} onClick={(e) => { if (it.onClick) { e.preventDefault(); it.onClick(); } }}
                style={{ color: "var(--text-3)", whiteSpace: "nowrap", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}>{it.label}</a>}
        </React.Fragment>;
      })}
    </nav>
  );
}
