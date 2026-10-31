import React from "react";

export function Swatch({ hex, size = 20, label, style }) {
  return <span role={label ? "img" : undefined} aria-label={label} title={label}
    style={{ width: size, height: size, flex: "none", display: "inline-block", borderRadius: "50%", background: hex || "transparent", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)", ...style }} />;
}
