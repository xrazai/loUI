import React, { useState, useEffect, useRef, useMemo } from "react";
import { Breadcrumb } from "./Breadcrumb";
export function TopBar({ title, breadcrumb, actions, children, sticky = false, style }) {
  return (
    <header style={{ height: 56, flex: "none", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxSizing: "border-box",
      borderBottom: "1px solid var(--line-subtle)", background: "var(--bg)", ...(sticky ? { position: "sticky", top: 0, zIndex: 20 } : {}), ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : <span style={{ fontSize: "var(--fs-heading)", fontWeight: 600, whiteSpace: "nowrap" }}>{title}</span>}
        {children}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>{actions}</div>}
    </header>
  );
}
