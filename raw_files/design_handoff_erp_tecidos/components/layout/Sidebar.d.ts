import * as React from "react";
export interface SidebarItem {
  value: string;
  label: string;
  /** Nome de ícone Lucide (ex.: "sun", "package") ou nó React. */
  icon?: string | React.ReactNode;
  /** Só quando há ação pendente. */
  count?: number;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}
export interface SidebarSection { title?: string; items: SidebarItem[]; }
/**
 * Sidebar do app: loja no topo, seções agrupadas por momento, cartão de status fixo no rodapé.
 * @startingPoint section="Layout" subtitle="Shell de app: sidebar agrupada + topbar" viewport="700x420"
 */
export interface SidebarProps {
  workspace?: { name: string; initial?: string; subtitle?: string };
  sections: SidebarSection[];
  value?: string;
  onChange?: (value: string) => void;
  /** Cartão de status no rodapé (ex.: caixa aberto). */
  status?: { title: string; meta?: string; value?: string; tone?: "success" | "warning" | "danger" };
  footer?: React.ReactNode;
  user?: { name: string; role?: string; initials?: string; avatar?: string };
  width?: number;
  style?: React.CSSProperties;
}
export function Sidebar(props: SidebarProps): JSX.Element;
