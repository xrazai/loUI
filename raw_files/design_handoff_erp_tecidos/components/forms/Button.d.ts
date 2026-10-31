import * as React from "react";
/**
 * Botão de ação. Primário = tinta (claro sobre escuro), nunca cor de acento.
 * @startingPoint section="Forms" subtitle="Botões primário, secundário, ghost e destrutivo" viewport="700x300"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: uma por tela. secondary: padrão. ghost: ações terciárias. danger: destrutivo. */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Nó antes do rótulo (ícone, 14px). */
  leading?: React.ReactNode;
  /** Nó depois do rótulo (ex.: <Kbd>). */
  trailing?: React.ReactNode;
}
export function Button(props: ButtonProps): JSX.Element;
