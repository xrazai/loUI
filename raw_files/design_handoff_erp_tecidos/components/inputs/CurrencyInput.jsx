import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "../forms/Input";
const fmtBRL = (n) => (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function CurrencyInput({ value = 0, onChange, currency = "R$", ...rest }) {
  const change = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 13);
    onChange && onChange(parseInt(digits || "0", 10) / 100);
  };
  return (
    <Input {...rest} mono inputMode="numeric" value={fmtBRL(value)} onChange={change}
      leading={<span style={{ font: "400 var(--fs-label) var(--font-mono)", color: "var(--text-3)" }}>{currency}</span>}
      inputStyle={{ textAlign: "right" }} />
  );
}
