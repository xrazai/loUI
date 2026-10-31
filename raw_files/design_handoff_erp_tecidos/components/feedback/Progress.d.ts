/** Barra de progresso de 4px. */
export interface ProgressProps {
  /** 0–100 */
  value: number;
  label?: string;
  meta?: string;
  tone?: "accent" | "success" | "warning" | "danger";
  style?: React.CSSProperties;
}
export function Progress(props: ProgressProps): JSX.Element;
