/** Amostra circular de cor, com anel sutil para cores escuras sobre o fundo escuro. */
export interface SwatchProps {
  hex: string;
  /** 12 (texto corrido) · 14–18 (listas) · 20 (linhas de item). */
  size?: number;
  /** Nome da cor para leitores de tela e tooltip. */
  label?: string;
  style?: React.CSSProperties;
}
export function Swatch(props: SwatchProps): JSX.Element;
