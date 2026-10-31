/** Nota em estrelas, só exibição. */
export interface RatingProps {
  value: number;
  max?: number;
  size?: number;
  /** Mostra "4/5" em mono ao lado. */
  showValue?: boolean;
  style?: React.CSSProperties;
}
export function Rating(props: RatingProps): JSX.Element;
