import * as React from "react";
/** Painel flutuante ancorado a um gatilho. Fecha com clique fora e Esc. */
export interface PopoverProps {
  trigger: React.ReactNode;
  /** Conteúdo, ou função que recebe close(). */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: "start" | "end";
  side?: "bottom" | "top";
  width?: number;
  /** Controlado (opcional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: React.CSSProperties;
}
export function Popover(props: PopoverProps): JSX.Element;
