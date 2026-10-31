/** Ajuste numérico com − e +, para valores pequenos (parcelas, quantidade de etiquetas). */
export interface StepperProps {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** Sufixo junto ao número, ex.: "×". */
  suffix?: string;
  style?: React.CSSProperties;
}
export function Stepper(props: StepperProps): JSX.Element;
