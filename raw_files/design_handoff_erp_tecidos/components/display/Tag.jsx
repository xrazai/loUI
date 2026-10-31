import React, { useState, useEffect } from "react";

export function Tag({ children, onRemove, style }) {
  return (
    <span style={{ height: 22, padding: onRemove ? "0 4px 0 7px" : "0 7px", display: "inline-flex", alignItems: "center", gap: 4, borderRadius: "var(--radius-sm)",
      border: "1px solid var(--line-strong)", color: "var(--text-2)", font: "500 var(--fs-caption) var(--font-mono)", boxSizing: "border-box", whiteSpace: "nowrap", ...style }}>
      {children}
      {onRemove && <button type="button" aria-label="Remover" onClick={onRemove} style={{ width: 16, height: 16, padding: 0, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: "var(--fs-small)", lineHeight: 1, borderRadius: 3 }}>×</button>}
    </span>
  );
}
