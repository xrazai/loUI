/** Escolha única em blocos grandes, para decisões rápidas de um toque (forma de pagamento). */
export interface ChoiceTilesProps {
  options: (string | { value: string; label: string; meta?: string })[];
  value?: string;
  onChange?: (value: string) => void;
  columns?: number;
  /** lg = 48px (diálogos de decisão) · md = 40px. */
  size?: "lg" | "md";
  style?: React.CSSProperties;
}
export function ChoiceTiles(props: ChoiceTilesProps): JSX.Element;
