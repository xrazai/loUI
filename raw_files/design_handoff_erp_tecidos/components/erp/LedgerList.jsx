import React, { useState } from "react";

function Row({ e, format, negativeTone, onDelete }) {
  const [h, setH] = useState(false);
  const pos = e.delta > 0;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "52px minmax(0,1fr) auto" + (onDelete ? " 28px" : ""), gap: 12, alignItems: "center", padding: "10px " + (onDelete ? "12px" : "24px") + " 10px 24px", borderBottom: "1px solid var(--line-subtle)" }}>
      <span style={{ font: "400 12px var(--font-mono)", color: "var(--text-3)", whiteSpace: "nowrap" }}>{e.date}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: "var(--fs-label)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
        {e.sub && <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.sub}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <span style={{ font: "500 var(--fs-label) var(--font-mono)", whiteSpace: "nowrap", color: pos ? "var(--text)" : `var(--${negativeTone})` }}>{(pos ? "+ " : "− ") + format(Math.abs(e.delta))}</span>
        {e.balance != null && <span style={{ font: "400 11.5px var(--font-mono)", color: "var(--text-3)", whiteSpace: "nowrap" }}>saldo {format(e.balance)}</span>}
      </div>
      {onDelete && <button type="button" onClick={() => onDelete(e)} aria-label="Excluir lançamento" title="Excluir lançamento" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ width: 28, height: 28, border: "none", borderRadius: "var(--radius-sm)", fontSize: 15, cursor: "pointer", background: h ? "var(--danger-soft)" : "transparent", color: h ? "var(--danger)" : "var(--text-3)" }}>×</button>}
    </div>
  );
}
export function LedgerList({ entries = [], format = (v) => v, negativeTone = "success", onDelete, style }) {
  return <div style={style}>{entries.map((e) => <Row key={e.id} e={e} format={format} negativeTone={negativeTone} onDelete={onDelete} />)}</div>;
}
