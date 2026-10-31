/** Vencimento: ponto + data + texto relativo. Vermelho vencido, âmbar hoje/próximos 7 dias. */
export interface DueIndicatorProps {
  /** Data ISO (aaaa-mm-dd). */
  date: string;
  /** Data de referência ISO. Padrão: hoje. */
  today?: string;
  paid?: boolean;
  paidText?: string;
  showDate?: boolean;
  style?: React.CSSProperties;
}
export function DueIndicator(props: DueIndicatorProps): JSX.Element;
/** Mesma regra para usar em ordenação, contadores e cores de linha. */
export function dueInfo(date: string, today?: string): { days: number; tone: "danger" | "warning" | "neutral"; text: string };
