import * as React from "react";
/** Botão quadrado só com ícone. Sempre passe `label` (vira aria-label e tooltip nativo). */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}
export function IconButton(props: IconButtonProps): JSX.Element;
