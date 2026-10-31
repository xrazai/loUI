import * as React from "react";
export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  /** Trilho do grid CSS. Padrão "minmax(0,1fr)". Ex.: "96px". */
  width?: string;
  align?: "left" | "right";
  mono?: boolean;
  /** Texto secundário (text-2). */
  muted?: boolean;
  /** false desativa ordenação nesta coluna. */
  sortable?: boolean;
  sortValue?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
}
/**
 * Tabela com ordenação, seleção múltipla, ações em massa e paginação.
 * @startingPoint section="Data" subtitle="Tabela com ordenação, seleção e paginação" viewport="700x420"
 */
export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: string;
  selectable?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  /** Linha ativa (filete de tinta à esquerda). */
  activeKey?: string;
  /** Renderiza botões na barra de seleção. */
  bulkActions?: (selectedKeys: string[], clear: () => void) => React.ReactNode;
  empty?: React.ReactNode;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  style?: React.CSSProperties;
}
export function DataTable(props: DataTableProps): JSX.Element;
