import * as React from "react";
import type { MenuItem } from "../navigation/Menu";
export interface ActionListItem {
  id?: string;
  title: string;
  description?: string;
  /** Valor à direita em mono (data, valor, tamanho). */
  meta?: string;
  leading?: React.ReactNode;
  /** Itens do menu "···". */
  actions?: MenuItem[];
}
/** Lista de registros com menu de ações por linha. */
export interface ActionListProps {
  items: ActionListItem[];
  onItemClick?: (item: ActionListItem) => void;
  bordered?: boolean;
  style?: React.CSSProperties;
}
export function ActionList(props: ActionListProps): JSX.Element;
