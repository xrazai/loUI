/** Ranking com barra relativa ao primeiro colocado. Ordena por value, decrescente. */
export interface RankListProps {
  items: { id?: string; label: string; value: number; meta?: React.ReactNode; swatch?: string; onClick?: () => void }[];
  /** Quantas linhas mostrar. Padrão 6. */
  limit?: number;
  format?: (value: number) => React.ReactNode;
  showPos?: boolean;
  emptyText?: string;
  style?: React.CSSProperties;
}
export function RankList(props: RankListProps): JSX.Element;
