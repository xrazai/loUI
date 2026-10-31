/** Cartão de agente para a grade inicial do módulo Agentes. */
export interface AgentCardProps {
  name: string;
  /** Área curta: "Marketplace", "Atendimento". */
  area?: string;
  /** Nome do ícone Lucide (lucide-static@0.400.0). */
  icon?: string;
  description?: string;
  /** test = recém-criado, só conversa no chat. soon = tracejado, não clica. */
  status?: "test" | "active" | "paused" | "soon";
  /** Itens esperando aprovação. Aparece em acento quando > 0. */
  pending?: number;
  /** Rodapé: última ação, ex.: "Última resposta enviada às 08:40". */
  last?: string;
  onOpen?: () => void;
  style?: React.CSSProperties;
}
export function AgentCard(props: AgentCardProps): JSX.Element;
