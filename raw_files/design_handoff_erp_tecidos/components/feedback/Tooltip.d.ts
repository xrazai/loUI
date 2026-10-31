/** Dica invertida (claro sobre escuro) no hover/foco. */
export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  side?: "top" | "bottom";
  children: React.ReactNode;
  /** Mantém aberto (para documentação). */
  forceOpen?: boolean;
}
export function Tooltip(props: TooltipProps): JSX.Element;
