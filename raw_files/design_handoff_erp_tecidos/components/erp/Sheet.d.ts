/** Painel lateral que abre pela direita: cadastros, detalhes e edição sem sair da lista. */
export interface SheetProps {
  open?: boolean;
  title: React.ReactNode;
  /** Texto curto em mono ao lado do título (telefone, data, código). */
  meta?: React.ReactNode;
  /** Elemento extra no cabeçalho, ex.: <Badge>. */
  headerExtra?: React.ReactNode;
  children?: React.ReactNode;
  /** Rodapé fixo: destrutiva à esquerda, Cancelar + primária à direita (use margin-left:auto). */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** Largura em px. 440 cadastros · 460 pedido · 480 extrato. */
  width?: number;
  /** Posiciona dentro do pai (position:relative) em vez da janela. */
  contained?: boolean;
  /** Padding de 24px e gap de 18px no corpo. Desligue para listas de borda a borda. */
  padded?: boolean;
  style?: React.CSSProperties;
}
export function Sheet(props: SheetProps): JSX.Element | null;
