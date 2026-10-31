/** Extrato: lançamentos com data, descrição, valor (+/−) e saldo acumulado. Mais recente no topo. */
export interface LedgerListProps {
  entries: { id: string; date: string; title: React.ReactNode; sub?: React.ReactNode; delta: number; balance?: number }[];
  format?: (value: number) => React.ReactNode;
  /** Cor dos lançamentos negativos. "success" quando o negativo reduz uma dívida (pagamento a fornecedor). */
  negativeTone?: "success" | "danger" | "text-2";
  /** Mostra × por linha. Excluir lançamento pede confirmação (é destrutivo). */
  onDelete?: (entry: any) => void;
  style?: React.CSSProperties;
}
export function LedgerList(props: LedgerListProps): JSX.Element;
