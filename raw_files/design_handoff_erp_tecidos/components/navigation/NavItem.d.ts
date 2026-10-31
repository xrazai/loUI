import * as React from "react";
/** Item de navegação lateral: ícone + rótulo + contador opcional com cor de motivo. */
export interface NavItemProps {
  label: string;
  /** Nome de ícone Lucide (ex.: "package") ou um nó React. */
  icon?: string | React.ReactNode;
  /** Mostra só quando há algo pedindo ação. 0/undefined esconde. */
  count?: number;
  /** Cor do contador: neutral (padrão), warning = atenção, danger = urgente. */
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function NavItem(props: NavItemProps): JSX.Element;
