import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "../forms/Input";
import { Kbd } from "../display/Kbd";
const ICON = <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.25" stroke="var(--text-3)" strokeWidth="1.5" /><path d="M9.5 9.5 12.5 12.5" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" /></svg>;
function Mark({ text, q }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <span style={{ color: "var(--text-2)" }}>{text}</span>;
  return <span style={{ color: "var(--text-2)" }}>{text.slice(0, i)}<span style={{ color: "var(--text)", fontWeight: 500 }}>{text.slice(i, i + q.length)}</span>{text.slice(i + q.length)}</span>;
}
export function SearchInput({ value = "", onChange, suggestions = [], onSelect, placeholder = "Buscar", shortcut = "/", maxResults = 6, style, ...rest }) {
  const [open, setOpen] = useState(false), [hi, setHi] = useState(0);
  const ref = useRef(null);
  const items = suggestions.map((s) => (typeof s === "string" ? { label: s } : s));
  const list = value.trim() ? items.filter((s) => s.label.toLowerCase().includes(value.trim().toLowerCase())).slice(0, maxResults) : [];
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const pick = (s) => { onChange && onChange(s.label); onSelect && onSelect(s); setOpen(false); };
  const key = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(list.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === "Enter" && open && list[hi]) { e.preventDefault(); pick(list[hi]); }
    else if (e.key === "Escape") setOpen(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", minWidth: 0, ...style }}>
      <Input {...rest} value={value} placeholder={placeholder} leading={ICON} trailing={shortcut ? <Kbd>{shortcut}</Kbd> : null}
        onChange={(e) => { onChange && onChange(e.target.value); setOpen(true); setHi(0); }} onFocus={() => setOpen(true)} onKeyDown={key} />
      {open && list.length > 0 && <div role="listbox" style={{ position: "absolute", zIndex: 40, top: "calc(100% + 4px)", left: 0, right: 0, padding: 4, background: "var(--surface-raised)", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)" }}>
        {list.map((s, i) => (
          <div key={s.label + i} role="option" onMouseEnter={() => setHi(i)} onMouseDown={(e) => { e.preventDefault(); pick(s); }}
            style={{ height: "var(--item-h)", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: "var(--radius-sm)", fontSize: "var(--fs-small)", cursor: "pointer", background: i === hi ? "var(--line)" : "transparent" }}>
            <Mark text={s.label} q={value.trim()} />
            {s.meta && <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: "var(--text-3)" }}>{s.meta}</span>}
          </div>
        ))}
      </div>}
    </div>
  );
}
