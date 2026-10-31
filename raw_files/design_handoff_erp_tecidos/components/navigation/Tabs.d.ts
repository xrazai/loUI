export interface TabItem {
  value: string; label: string; count?: number | string;
  /** Contador vira pílula colorida quando pede atenção (ex.: vencidos em danger). */
  tone?: "danger" | "warning" | "accent" | "success";
  /** Tecla de atalho mostrada à direita, ex.: "1". */
  shortcut?: string;
}
/** Abas sublinhadas para trocar entre vistas do mesmo objeto. */
export interface TabsProps {
  items: Array<TabItem | string>;
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
