import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "../forms/Button";
export function InlineConfirm({ label = "Excluir", prompt = "Tem certeza?", confirmLabel, cancelLabel = "Cancelar", onConfirm, danger = true, size = "md", style }) {
  const [ask, setAsk] = useState(false);
  useEffect(() => {
    if (!ask) return;
    const k = (e) => e.key === "Escape" && setAsk(false);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [ask]);
  if (!ask) return <Button size={size} variant={danger ? "danger" : "secondary"} onClick={() => setAsk(true)} style={style}>{label}</Button>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}>
      <span style={{ fontSize: "var(--fs-small)", color: "var(--text-2)", whiteSpace: "nowrap" }}>{prompt}</span>
      <Button size={size} variant="ghost" onClick={() => setAsk(false)}>{cancelLabel}</Button>
      <Button size={size} variant={danger ? "danger-solid" : "primary"} autoFocus onClick={() => { setAsk(false); onConfirm && onConfirm(); }}>{confirmLabel || label}</Button>
    </span>
  );
}
