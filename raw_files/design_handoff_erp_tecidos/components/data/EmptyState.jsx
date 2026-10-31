import React, { useState, useEffect, useRef, useMemo } from "react";

export function EmptyState({ title, description, action, secondaryAction, compact = false, bordered = true, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6, padding: compact ? "28px 20px" : "48px 24px",
      border: bordered ? "1px dashed var(--line-strong)" : "none", borderRadius: "var(--radius-lg)", ...style }}>
      <span style={{ fontSize: compact ? 13 : "var(--fs-heading)", lineHeight: compact ? "20px" : "var(--lh-heading)", fontWeight: 600 }}>{title}</span>
      {description && <span style={{ maxWidth: 360, fontSize: "var(--fs-small)", lineHeight: "var(--lh-small)", color: "var(--text-2)", textWrap: "pretty" }}>{description}</span>}
      {(action || secondaryAction) && <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{secondaryAction}{action}</div>}
    </div>
  );
}
