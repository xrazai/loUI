import * as React from "react";
export interface SelectOption { value: string; label: string; }
/** Seleção nativa estilizada (acessível e com teclado de graça). */
export interface SelectProps {
  label?: string;
  options: Array<SelectOption | string>;
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
