export interface RadioOption { value: string; label: string; }
/** Grupo de opções exclusivas. */
export interface RadioGroupProps {
  options: Array<RadioOption | string>;
  value?: string;
  onChange?: (value: string) => void;
  direction?: "row" | "column";
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function RadioGroup(props: RadioGroupProps): JSX.Element;
