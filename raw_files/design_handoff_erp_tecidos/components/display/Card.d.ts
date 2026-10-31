/** Contêiner de superfície com borda. Sem sombra, a não ser `raised`. */
export interface CardProps {
  /** Rótulo de grupo em caption mono maiúsculo. */
  title?: string;
  actions?: React.ReactNode;
  padding?: number | string;
  raised?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
