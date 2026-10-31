/** Chat lateral com o agente: perguntas prontas, mensagens, "Pensando…" e envio com Enter (Shift+Enter quebra linha). */
export interface ChatPanelProps {
  title?: string;
  /** Texto curto mostrado quando a conversa está vazia. */
  intro?: React.ReactNode;
  /** Perguntas prontas mostradas quando vazio. Clicar envia. */
  prompts?: string[];
  messages?: { role: "user" | "assistant"; content: string; error?: boolean }[];
  busy?: boolean;
  onSend?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
}
export function ChatPanel(props: ChatPanelProps): JSX.Element;
