export interface MenuItem { label?: string; shortcut?: string; danger?: boolean; separator?: boolean; onSelect?: () => void; }
/** Menu suspenso (dropdown / contexto). Posicione com o contêiner pai. */
export interface MenuProps {
  items: MenuItem[];
  width?: number;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export function Menu(props: MenuProps): JSX.Element;
