import React, { useState, useEffect, useRef, useMemo } from "react";

export function Slider({ label, value = 0, onChange, min = 0, max = 100, step = 1, format = (v) => v, disabled = false, style }) {
  const track = useRef(null);
  const [drag, setDrag] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  const set = (clientX) => {
    const r = track.current.getBoundingClientRect();
    const raw = min + Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * (max - min);
    const v = Math.round(raw / step) * step;
    onChange && onChange(Math.max(min, Math.min(max, +v.toFixed(6))));
  };
  const down = (e) => { if (disabled) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); set(e.clientX); };
  const key = (e) => {
    const d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[e.key];
    if (d) { e.preventDefault(); onChange && onChange(Math.max(min, Math.min(max, value + d))); }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: disabled ? 0.35 : 1, ...style }}>
      {label && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500 }}>{label}</span><span style={{ font: "400 var(--fs-label) var(--font-mono)", color: "var(--text-2)" }}>{format(value)}</span></div>}
      <div ref={track} onPointerDown={down} onPointerMove={(e) => drag && set(e.clientX)} onPointerUp={() => setDrag(false)}
        style={{ position: "relative", height: 16, cursor: disabled ? "not-allowed" : "pointer", touchAction: "none" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 4, borderRadius: "var(--radius-pill)", background: "var(--surface-hover)" }} />
        <div style={{ position: "absolute", left: 0, width: pct + "%", top: 6, height: 4, borderRadius: "var(--radius-pill)", background: "var(--accent)" }} />
        <div role="slider" tabIndex={disabled ? -1 : 0} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} onKeyDown={key}
          style={{ position: "absolute", top: 1, left: `calc(${pct}% - 7px)`, width: 14, height: 14, borderRadius: "50%", background: "var(--gray-9)", boxShadow: drag ? "var(--focus-ring)" : "0 1px 3px rgba(0,0,0,.5)", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}
