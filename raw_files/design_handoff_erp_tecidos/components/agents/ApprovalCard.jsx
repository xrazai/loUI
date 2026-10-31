import React from "react";
import { Textarea } from "../forms/Textarea";
import { Rating } from "../display/Rating";
import { Button } from "../forms/Button";

export function ApprovalCard({ kind = "question", author, product, swatch, when, rating, message, draft, onDraftChange, flag, onSend, onDiscard, sendLabel = "Enviar resposta", style }) {
  const isReview = kind === "review";
  return (
    <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", overflow: "hidden", ...style }}>
      <div style={{ minHeight: 48, padding: "10px 20px", boxSizing: "border-box", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 12px", borderBottom: "1px solid var(--line-subtle)" }}>
        <span style={{ height: 22, padding: "0 8px", display: "inline-flex", alignItems: "center", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 500,
          color: isReview ? "var(--text-2)" : "var(--accent)", background: isReview ? "var(--surface-hover)" : "var(--accent-soft)" }}>{isReview ? "Avaliação" : "Pergunta"}</span>
        {isReview && rating != null && <Rating value={rating} />}
        {author && <span style={{ font: "500 var(--fs-label) var(--font-mono)" }}>{author}</span>}
        {product && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-label)", color: "var(--text-2)", minWidth: 0 }}>
          {swatch && <span style={{ width: 12, height: 12, flex: "none", borderRadius: "50%", background: swatch, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)" }} />}{product}</span>}
        {when && <span style={{ marginLeft: "auto", font: "400 12px var(--font-mono)", color: "var(--text-3)" }}>{when}</span>}
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: "12px 14px", background: "var(--bg)", borderRadius: "var(--radius)", fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)", color: "var(--text-2)" }}>{message}</div>
        <Textarea label="Resposta do agente" aside="Pode editar antes de enviar" value={draft} onChange={(e) => onDraftChange && onDraftChange(e.target.value)} />
        {flag && <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-label)", color: "var(--warning)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--warning)" }} />{flag}</span>}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={onDiscard}>Descartar</Button>
          <Button size="sm" onClick={onSend} style={{ marginLeft: "auto" }}>{sendLabel}</Button>
        </div>
      </div>
    </section>
  );
}
