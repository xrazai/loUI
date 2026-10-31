/** Linha de etapas de status (pedido: Novo → Separado → Enviado → Entregue). */
export interface StatusStepsProps {
  steps: (string | { label: string })[];
  /** Índice da etapa atual. */
  current?: number;
  /** Marca a etapa atual como concluída (última etapa atingida). */
  complete?: boolean;
  /** Torna cada etapa clicável: o status pode mudar livremente, para frente ou para trás. */
  onSelect?: (index: number) => void;
  style?: React.CSSProperties;
}
export function StatusSteps(props: StatusStepsProps): JSX.Element;
