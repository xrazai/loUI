import React, { useState, useEffect, useRef, useMemo } from "react";

function useOutside(ref, open, close) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => ref.current && !ref.current.contains(e.target) && close();
    const k = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
}
export function Combobox({ label, options = [], value, onChange, placeholder = "Selecione…", searchPlaceholder = "Buscar…", emptyText = "Nada encontrado", style }) {
  const [open, setOpen] = useState(false), [q, setQ] = useState(""), [hi, setHi] = useState(0);
  const ref = useRef(null);
  useOutside(ref, open, () => setOpen(false));
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const list = opts.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  const cur = opts.find((o) => o.value === value);
  const pick = (o) => { onChange && onChange(o.value); setOpen(false); setQ(""); };
  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(list.length - 1, h + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    if (e.key === "Enter" && list[hi]) { e.preventDefault(); pick(list[hi]); }
  };
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500 }}>{label}</span>}
      <button type="button" onClick={() => { setOpen(!open); setHi(0); }} aria-expanded={open}
        style={{ ...{ height: "var(--control-h)", padding: "0 10px", display: "flex", alignItems: "center", gap: 8, boxSizing: "border-box", background: "var(--bg)", borderRadius: "var(--radius)", color: "var(--text)", font: "400 var(--fs-small) var(--font-sans)", cursor: "pointer", width: "100%" }, border: "1px solid " + (open ? "var(--accent)" : "var(--line-strong)"), boxShadow: open ? "var(--focus-ring)" : "none", justifyContent: "space-between", textAlign: "left" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: cur ? "var(--text)" : "var(--text-3)" }}>{cur ? cur.label : placeholder}</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flex: "none" }}><path d="M3 4.5 6 7.5 9 4.5" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && <div style={{ ...{ position: "absolute", zIndex: 40, top: "calc(100% + 4px)", left: 0, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)", boxSizing: "border-box" }, top: label ? 60 : 36, width: "100%", minWidth: 240, padding: 4 }}>
        <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setHi(0); }} onKeyDown={key} placeholder={searchPlaceholder}
          style={{ width: "100%", boxSizing: "border-box", height: "var(--item-h)", padding: "0 8px", marginBottom: 4, background: "transparent", border: "none", borderBottom: "1px solid var(--line)", outline: "none", color: "var(--text)", font: "400 var(--fs-small) var(--font-sans)" }} />
        <div role="listbox" style={{ maxHeight: 220, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "var(--line-strong) transparent" }}>
          {list.length === 0 && <div style={{ padding: "10px 8px", fontSize: "var(--fs-small)", color: "var(--text-3)" }}>{emptyText}</div>}
          {list.map((o, i) => (
            <div key={o.value} role="option" aria-selected={o.value === value} onMouseEnter={() => setHi(i)} onClick={() => pick(o)}
              style={{ height: "var(--item-h)", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "var(--fs-small)", whiteSpace: "nowrap", background: i === hi ? "var(--line)" : "transparent" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                <span style={{ width: 12, color: "var(--accent)" }}>{o.value === value ? "✓" : ""}</span>{o.label}
              </span>
              {o.meta && <span style={{ flex: "none", font: "400 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{o.meta}</span>}
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}
