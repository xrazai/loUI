/** Rótulo de status em pílula. */
export interface BadgeProps {
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  /** Ponto colorido à esquerda. Padrão true. */
  dot?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function Badge(props: BadgeProps): JSX.Element;
