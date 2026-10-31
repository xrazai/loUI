/** Controle deslizante com teclado (setas) e arraste. */
export interface SliderProps {
  label?: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Formata o valor exibido à direita do rótulo. */
  format?: (value: number) => string | number;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function Slider(props: SliderProps): JSX.Element;
