/** Item que o agente preparou e espera sua aprovação: origem, mensagem do cliente, resposta editável e ações. */
export interface ApprovalCardProps {
  kind?: "question" | "review";
  /** Usuário de quem veio, em mono. */
  author?: string;
  product?: string;
  swatch?: string;
  when?: string;
  /** Só para kind="review". */
  rating?: number;
  message: React.ReactNode;
  draft: string;
  onDraftChange?: (value: string) => void;
  /** Alerta em warning acima das ações, ex.: avaliação baixa. */
  flag?: React.ReactNode;
  onSend?: () => void;
  onDiscard?: () => void;
  sendLabel?: string;
  style?: React.CSSProperties;
}
export function ApprovalCard(props: ApprovalCardProps): JSX.Element;
