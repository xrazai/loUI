/** Botão tracejado que insere um texto pronto (sugestão de diretriz, pergunta pronta). */
export interface SuggestionChipProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function SuggestionChip(props: SuggestionChipProps): JSX.Element;
