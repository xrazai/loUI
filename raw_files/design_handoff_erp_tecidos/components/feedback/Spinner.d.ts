/** Indicador de carregamento circular. Requer @keyframes ds-spin (tokens/base.css). */
export interface SpinnerProps {
  size?: number;
  /** Texto ao lado ("Salvando…"). */
  label?: string;
  color?: string;
  style?: React.CSSProperties;
}
export function Spinner(props: SpinnerProps): JSX.Element;
