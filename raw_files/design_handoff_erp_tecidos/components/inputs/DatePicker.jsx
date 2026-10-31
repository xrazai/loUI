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
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const parse = (s) => { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export function DatePicker({ label, value, onChange, placeholder = "dd/mm/aaaa", min, max, style }) {
  const sel = parse(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => { const b = sel || new Date(); return new Date(b.getFullYear(), b.getMonth(), 1); });
  const ref = useRef(null);
  useOutside(ref, open, () => setOpen(false));
  const today = iso(new Date());
  const start = new Date(view.getFullYear(), view.getMonth(), 1 - view.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const shift = (n) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  const navBtn = { width: 26, height: 26, border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-2)", cursor: "pointer", fontSize: "var(--fs-body)" };
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", minWidth: 0, ...style }}>
      {label && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500 }}>{label}</span>}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        style={{ ...{ height: "var(--control-h)", padding: "0 10px", display: "flex", alignItems: "center", gap: 8, boxSizing: "border-box", background: "var(--bg)", borderRadius: "var(--radius)", color: "var(--text)", font: "400 var(--fs-small) var(--font-sans)", cursor: "pointer", width: "100%" }, border: "1px solid " + (open ? "var(--accent)" : "var(--line-strong)"), boxShadow: open ? "var(--focus-ring)" : "none", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-label)", color: sel ? "var(--text)" : "var(--text-3)" }}>{sel ? sel.toLocaleDateString("pt-BR") : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.75" y="2.75" width="10.5" height="9.5" rx="1.5" stroke="var(--text-3)" strokeWidth="1.5" /><path d="M1.75 5.75h10.5M4.5 1.25v2.5M9.5 1.25v2.5" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {open && <div style={{ ...{ position: "absolute", zIndex: 40, top: "calc(100% + 4px)", left: 0, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)", boxSizing: "border-box" }, top: label ? 60 : 36, width: 252, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button type="button" style={navBtn} onClick={() => shift(-1)} aria-label="Mês anterior">‹</button>
          <span style={{ fontSize: "var(--fs-small)", fontWeight: 500 }}>{MESES[view.getMonth()]} {view.getFullYear()}</span>
          <button type="button" style={navBtn} onClick={() => shift(1)} aria-label="Próximo mês">›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {DIAS.map((d, i) => <span key={i} style={{ height: 24, display: "grid", placeItems: "center", font: "500 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{d}</span>)}
          {cells.map((d) => {
            const k = iso(d), out = d.getMonth() !== view.getMonth(), on = k === value, dis = (min && k < min) || (max && k > max);
            return <button key={k} type="button" disabled={dis} onClick={() => { onChange && onChange(k); setOpen(false); }}
              style={{ height: "var(--item-h)", border: k === today && !on ? "1px solid var(--line-strong)" : "1px solid transparent", borderRadius: "var(--radius-sm)", cursor: dis ? "not-allowed" : "pointer",
                background: on ? "var(--accent)" : "transparent", color: on ? "var(--text-inverse)" : out || dis ? "var(--text-3)" : "var(--text)", opacity: dis ? 0.35 : 1,
                font: (on ? "600" : "400") + " 12px var(--font-mono)" }}
              onMouseEnter={(e) => { if (!on && !dis) e.currentTarget.style.background = "var(--line)"; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>{d.getDate()}</button>;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
          <button type="button" onClick={() => { onChange && onChange(today); setOpen(false); }} style={{ ...navBtn, width: "auto", padding: "0 8px", fontSize: "var(--fs-label)", fontWeight: 500, color: "var(--text)" }}>Hoje</button>
          {value && <button type="button" onClick={() => { onChange && onChange(""); setOpen(false); }} style={{ ...navBtn, width: "auto", padding: "0 8px", fontSize: "var(--fs-label)" }}>Limpar</button>}
        </div>
      </div>}
    </div>
  );
}
