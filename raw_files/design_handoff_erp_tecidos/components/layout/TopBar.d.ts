import * as React from "react";
import type { BreadcrumbItem } from "./Breadcrumb";
/** Barra superior de 56px: título ou breadcrumb à esquerda, ações à direita. */
export interface TopBarProps {
  title?: string;
  /** Substitui o título. */
  breadcrumb?: BreadcrumbItem[];
  /** Busca + botão primário, normalmente. */
  actions?: React.ReactNode;
  /** Conteúdo extra ao lado do título (ex.: Tabs). */
  children?: React.ReactNode;
  sticky?: boolean;
  style?: React.CSSProperties;
}
export function TopBar(props: TopBarProps): JSX.Element;
