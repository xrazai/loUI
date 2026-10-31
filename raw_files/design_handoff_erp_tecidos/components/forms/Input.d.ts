import * as React from "react";
/**
 * Campo de texto com rótulo, ajuda e erro.
 * @startingPoint section="Forms" subtitle="Campo com rótulo, ajuda e erro" viewport="700x200"
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "style"> {
  label?: string;
  /** Texto de ajuda abaixo do campo (text-3). */
  hint?: string;
  /** Mensagem de erro; substitui hint e pinta a borda de danger. */
  error?: string;
  /** Usa Geist Mono — para códigos, valores, quantidades. */
  mono?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}
export function Input(props: InputProps): JSX.Element;
