import React, { useState, useEffect } from "react";

export function Kbd({ children, style }) {
  return (
    <kbd style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 5px", border: "1px solid var(--line-strong)", borderRadius: 4,
      font: "500 var(--fs-caption) var(--font-mono)", color: "var(--text-3)", background: "transparent", boxSizing: "border-box", ...style }}>{children}</kbd>
  );
}
