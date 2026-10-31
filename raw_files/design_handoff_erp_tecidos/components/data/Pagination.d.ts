/** Paginação numérica com reticências e contagem "1–8 de 42". */
export interface PaginationProps {
  /** 1-based */
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
  /** Com total + pageSize, mostra o intervalo exibido. */
  total?: number;
  pageSize?: number;
  style?: React.CSSProperties;
}
export function Pagination(props: PaginationProps): JSX.Element;
