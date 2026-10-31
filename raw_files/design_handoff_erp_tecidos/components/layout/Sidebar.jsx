import React from "react";
import { NavItem } from "../navigation/NavItem";
import { Avatar } from "../display/Avatar";

export function Sidebar({ workspace = { name: "Workspace" }, sections = [], value, onChange, status, footer, user, width = 248, style }) {
  const cap = { padding: "0 10px 6px", font: "500 var(--fs-caption) var(--font-mono)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-3)" };
  return (
    <aside style={{ width, flex: "none", boxSizing: "border-box", background: "var(--bg)", borderRight: "1px solid var(--line-subtle)", display: "flex", flexDirection: "column", padding: "16px 12px", gap: 20, overflow: "auto", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
        <span style={{ width: 28, height: 28, flex: "none", borderRadius: "var(--radius)", background: "var(--primary-bg)", color: "var(--primary-fg)", display: "grid", placeItems: "center", fontSize: "var(--fs-label)", fontWeight: 600 }}>{workspace.initial || workspace.name[0]}</span>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontSize: "var(--fs-small)", fontWeight: 600, lineHeight: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{workspace.name}</span>
          {workspace.subtitle && <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--text-3)" }}>{workspace.subtitle}</span>}
        </div>
      </div>
      {sections.map((s, i) => (
        <nav key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {s.title && <div style={cap}>{s.title}</div>}
          {s.items.map((it) => <NavItem key={it.value} icon={it.icon} label={it.label} count={it.count} tone={it.tone} active={it.value === value} onClick={() => onChange && onChange(it.value)} />)}
        </nav>
      ))}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {status && <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", background: "var(--surface)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-label)", fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: { success: "var(--success)", warning: "var(--warning)", danger: "var(--danger)" }[status.tone || "success"] }} />{status.title}
          </div>
          {(status.meta || status.value) && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-3)" }}>
            <span>{status.meta}</span><span style={{ fontFamily: "var(--font-mono)", color: "var(--text-2)" }}>{status.value}</span>
          </div>}
        </div>}
        {footer}
        {user && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", borderTop: "1px solid var(--line-subtle)" }}>
          <Avatar initials={user.initials} src={user.avatar} size={26} ring={null} />
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: "var(--fs-label)", fontWeight: 500, lineHeight: "var(--lh-label)" }}>{user.name}</span>
            {user.role && <span style={{ fontSize: 12, color: "var(--text-3)", lineHeight: "16px" }}>{user.role}</span>}
          </div>
        </div>}
      </div>
    </aside>
  );
}
