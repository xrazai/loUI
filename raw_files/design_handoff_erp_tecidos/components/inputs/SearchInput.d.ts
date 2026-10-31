export interface SearchSuggestion { label: string; meta?: string; [k: string]: any; }
/** Campo de busca com sugestões em tempo real (destaca o trecho digitado). */
export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  suggestions?: Array<SearchSuggestion | string>;
  onSelect?: (s: SearchSuggestion) => void;
  placeholder?: string;
  /** Atalho exibido à direita. null para esconder. */
  shortcut?: string | null;
  maxResults?: number;
  label?: string;
  style?: React.CSSProperties;
}
export function SearchInput(props: SearchInputProps): JSX.Element;
