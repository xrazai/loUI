import React, { useState, useEffect, useRef, useMemo } from "react";

export function Spinner({ size = 16, label, color = "currentColor", style }) {
  const s = <span aria-hidden={label ? "true" : undefined} role={label ? undefined : "status"} aria-label={label ? undefined : "Carregando"}
    style={{ width: size, height: size, flex: "none", display: "inline-block", boxSizing: "border-box", borderRadius: "50%", border: Math.max(1.5, size / 10) + "px solid " + color,
      borderTopColor: "transparent", opacity: 0.85, animation: "ds-spin 700ms linear infinite", ...(label ? {} : style) }} />;
  if (!label) return s;
  return <span role="status" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "var(--fs-small)", color: "var(--text-2)", ...style }}>{s}{label}</span>;
}
