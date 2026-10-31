import React, { useState, useEffect, useRef, useMemo } from "react";

export function Skeleton({ width = "100%", height = 12, radius = "var(--radius-sm)", lines, circle = false, style }) {
  const base = { display: "block", background: "var(--surface-hover)", animation: "ds-pulse 1.4s ease-in-out infinite" };
  if (lines) return (
    <span style={{ display: "flex", flexDirection: "column", gap: 8, width, ...style }}>
      {Array.from({ length: lines }, (_, i) => <span key={i} style={{ ...base, height, borderRadius: radius, width: i === lines - 1 && lines > 1 ? "60%" : "100%", animationDelay: i * 80 + "ms" }} />)}
    </span>
  );
  return <span aria-hidden="true" style={{ ...base, width: circle ? height : width, height, borderRadius: circle ? "50%" : radius, ...style }} />;
}
