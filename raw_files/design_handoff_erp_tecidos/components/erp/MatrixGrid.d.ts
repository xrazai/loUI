/** Grade de vínculos linha × coluna (tecido × cor). Cada célula liga ou desliga com um clique. */
export interface MatrixGridProps {
  rows: { id: string; label: string; meta?: React.ReactNode }[];
  /** Colunas com hex mostram a amostra no cabeçalho e preenchem a célula ligada. */
  cols: { id: string; label: string; hex?: string }[];
  isOn?: (rowId: string, colId: string) => boolean;
  onToggle?: (rowId: string, colId: string) => void;
  /** Texto do canto superior esquerdo, ex.: "Tecido". */
  corner?: string;
  /** Mostra uma coluna final com a contagem de vínculos por linha, ex.: "Cores". */
  countLabel?: string;
  /** Dica no rodapé da grade. */
  hint?: React.ReactNode;
  labelWidth?: number;
  cell?: number;
  style?: React.CSSProperties;
}
export function MatrixGrid(props: MatrixGridProps): JSX.Element;
