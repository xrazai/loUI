import React from "react";

const dd = (iso) => new Date(iso + "T12:00:00");
const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const isoToday = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
export function dueInfo(date, today = isoToday()) {
  const d = Math.round((dd(date) - dd(today)) / 86400000);
  if (d < 0) return { days: d, tone: "danger", text: `vencido há ${-d} ${-d > 1 ? "dias" : "dia"}` };
  if (d === 0) return { days: d, tone: "warning", text: "vence hoje" };
  if (d <= 7) return { days: d, tone: "warning", text: `em ${d} ${d > 1 ? "dias" : "dia"}` };
  return { days: d, tone: "neutral", text: `em ${d} dias` };
}
const COL = { danger: "var(--danger)", warning: "var(--warning)", neutral: "var(--text-2)", success: "var(--success)" };
export function DueIndicator({ date, today, paid = false, paidText = "Pago", showDate = true, style }) {
  const i = paid ? { tone: "success", text: paidText } : dueInfo(date, today);
  const [, m, day] = (date || "").split("-").map(Number);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "var(--fs-label)", whiteSpace: "nowrap", ...style }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", flex: "none", background: COL[i.tone] }} />
      {showDate && date && <span style={{ font: "500 var(--fs-label) var(--font-mono)", color: "var(--text)" }}>{String(day).padStart(2, "0")} {MES[m - 1]}</span>}
      <span style={{ color: COL[i.tone] }}>{i.text}</span>
    </span>
  );
}
