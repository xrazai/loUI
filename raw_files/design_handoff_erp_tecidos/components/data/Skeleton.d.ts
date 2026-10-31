/** Placeholder de carregamento com pulso suave. Requer @keyframes ds-pulse (tokens/base.css). */
export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: string;
  /** Renderiza N linhas (a última a 60%). */
  lines?: number;
  circle?: boolean;
  style?: React.CSSProperties;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
