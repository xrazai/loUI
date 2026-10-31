/** Seletor de data em pt-BR (calendário domingo→sábado). Valor em ISO "AAAA-MM-DD". */
export interface DatePickerProps {
  label?: string;
  /** "2026-10-30" */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  style?: React.CSSProperties;
}
export function DatePicker(props: DatePickerProps): JSX.Element;
