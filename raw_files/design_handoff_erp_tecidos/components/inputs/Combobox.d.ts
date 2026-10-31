export interface ComboboxOption { value: string; label: string; meta?: string; }
/** Select com busca para listas longas (10+ opções). Setas, Enter e Esc funcionam. */
export interface ComboboxProps {
  label?: string;
  options: Array<ComboboxOption | string>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  style?: React.CSSProperties;
}
export function Combobox(props: ComboboxProps): JSX.Element;
