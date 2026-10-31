/** Confirmação no lugar do botão (sem modal), para ações destrutivas de baixo impacto. */
export interface InlineConfirmProps {
  label?: string;
  prompt?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  danger?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function InlineConfirm(props: InlineConfirmProps): JSX.Element;
