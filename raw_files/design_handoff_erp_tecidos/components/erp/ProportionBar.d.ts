/** Barra dividida em partes de um todo (formas de pagamento, composição). */
export interface ProportionBarProps {
  /** Sem cor, usa a rampa neutra (text → text-2 → text-3 → line-strong). Máx. 4–5 partes. */
  segments: { label: string; value: number; color?: string }[];
  height?: number;
  /** Lista abaixo com cor, %, e valor formatado. */
  legend?: boolean;
  format?: (value: number) => React.ReactNode;
  style?: React.CSSProperties;
}
export function ProportionBar(props: ProportionBarProps): JSX.Element;
export const RAMP: string[];
