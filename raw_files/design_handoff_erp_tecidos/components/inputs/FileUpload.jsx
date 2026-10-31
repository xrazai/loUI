import React, { useState, useEffect, useRef, useMemo } from "react";
import { Progress } from "../feedback/Progress";
const fmt = (b) => (b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1).replace(".", ",") + " MB");
export function FileUpload({ label, hint = "PNG, JPG ou PDF até 10 MB", accept, multiple = true, onChange, simulate = true, style }) {
  const [over, setOver] = useState(false), [files, setFiles] = useState([]);
  const input = useRef(null);
  useEffect(() => {
    if (!simulate || !files.some((f) => f.progress < 100)) return;
    const t = setTimeout(() => setFiles((fs) => fs.map((f) => (f.progress < 100 ? { ...f, progress: Math.min(100, f.progress + 8 + Math.random() * 18) } : f))), 180);
    return () => clearTimeout(t);
  }, [files, simulate]);
  const add = (list) => {
    const next = [...(multiple ? files : []), ...Array.from(list).map((f) => ({ id: f.name + f.size + Math.random(), name: f.name, size: f.size, file: f, progress: simulate ? 0 : 100 }))];
    setFiles(next); onChange && onChange(next.map((f) => f.file));
  };
  const remove = (id) => { const next = files.filter((f) => f.id !== id); setFiles(next); onChange && onChange(next.map((f) => f.file)); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      {label && <span style={{ fontSize: "var(--fs-label)", lineHeight: "var(--lh-label)", fontWeight: 500 }}>{label}</span>}
      <div role="button" tabIndex={0} onClick={() => input.current.click()} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        style={{ padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center", cursor: "pointer", borderRadius: "var(--radius-lg)",
          border: "1px dashed " + (over ? "var(--accent)" : "var(--line-strong)"), background: over ? "var(--accent-soft)" : "var(--bg)", transition: "background var(--duration) var(--ease)" }}>
        <span style={{ fontSize: "var(--fs-small)" }}>Arraste arquivos ou <span style={{ color: "var(--accent)" }}>escolha no computador</span></span>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--text-3)" }}>{hint}</span>
        <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </div>
      {files.map((f) => (
        <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius)", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: "var(--fs-small)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
            <span style={{ font: "400 var(--fs-caption) var(--font-mono)", color: f.progress >= 100 ? "var(--success)" : "var(--text-3)" }}>{f.progress >= 100 ? "Concluído" : Math.round(f.progress) + "%"} · {fmt(f.size)}</span>
            <button type="button" aria-label={"Remover " + f.name} onClick={() => remove(f.id)} style={{ width: 22, height: 22, border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: "var(--fs-body)" }}>×</button>
          </div>
          {f.progress < 100 && <Progress value={f.progress} />}
        </div>
      ))}
    </div>
  );
}
