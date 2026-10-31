/** Campo monetário em BRL com máscara de centavos (digitar 124000 → 1.240,00). */
export interface CurrencyInputProps {
  label?: string;
  hint?: string;
  error?: string;
  /** Valor numérico em reais (1240.5). */
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function CurrencyInput(props: CurrencyInputProps): JSX.Element;
