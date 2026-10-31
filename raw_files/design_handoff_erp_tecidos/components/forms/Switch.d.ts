/** Interruptor liga/desliga para configurações com efeito imediato. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Com label, renderiza uma linha completa (rótulo à esquerda, switch à direita). */
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function Switch(props: SwitchProps): JSX.Element;
