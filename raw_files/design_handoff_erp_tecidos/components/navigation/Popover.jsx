import React, { useState, useEffect, useRef, useMemo } from "react";

export function Popover({ trigger, children, align = "start", side = "bottom", width, open: openProp, onOpenChange, style }) {
  const [inner, setInner] = useState(false);
  const open = openProp != null ? openProp : inner;
  const set = (v) => { setInner(v); onOpenChange && onOpenChange(v); };
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => ref.current && !ref.current.contains(e.target) && set(false);
    const k = (e) => e.key === "Escape" && set(false);
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  const close = () => set(false);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <span onClick={() => set(!open)} style={{ display: "inline-flex" }}>{trigger}</span>
      {open && <div role="dialog" style={{ position: "absolute", zIndex: 45, [side === "bottom" ? "top" : "bottom"]: "calc(100% + 4px)", [align === "end" ? "right" : "left"]: 0,
        width, minWidth: 180, padding: 4, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)", boxSizing: "border-box", ...style }}>
        {typeof children === "function" ? children(close) : children}
      </div>}
    </span>
  );
}
