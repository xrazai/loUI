export interface ChartDatum { label: string; value: number; }
/**
 * Gráfico simples de barras ou linha, responsivo, com tooltip no hover.
 * @startingPoint section="Data" subtitle="Gráfico de barras e linha" viewport="700x260"
 */
export interface ChartProps {
  type?: "bar" | "line";
  data: ChartDatum[];
  height?: number;
  /** Formata eixo Y e tooltip. */
  format?: (v: number) => string | number;
  color?: string;
  /** Cor fixa por índice de barra, ex.: { 29: "var(--text)" } para hoje e "var(--text-2)" para o melhor dia. */
  highlight?: Record<number, string>;
  style?: React.CSSProperties;
}
export function Chart(props: ChartProps): JSX.Element;
