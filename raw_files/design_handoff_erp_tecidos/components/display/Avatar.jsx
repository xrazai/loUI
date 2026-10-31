import React, { useState, useEffect } from "react";

export function Avatar({ initials, src, size = 28, tone = 0, ring = "var(--surface)", style }) {
  const bgs = ["var(--line)", "var(--line-strong)", "var(--surface-hover)"];
  return (
    <span style={{ width: size, height: size, flex: "none", borderRadius: "50%", display: "inline-grid", placeItems: "center", overflow: "hidden", boxSizing: "border-box",
      background: bgs[tone % 3], border: ring ? "2px solid " + ring : "none", font: `600 ${Math.round(size * 0.39)}px var(--font-sans)`, color: "var(--text)", ...style }}>
      {src ? <img src={src} alt={initials || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </span>
  );
}
