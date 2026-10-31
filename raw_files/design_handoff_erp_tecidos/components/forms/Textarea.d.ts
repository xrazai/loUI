/** Campo de várias linhas com o mesmo visual do Input. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  /** Texto curto à direita do rótulo, ex.: "Salvo automaticamente". */
  aside?: React.ReactNode;
  hint?: string;
  error?: string;
  rows?: number;
  resize?: "vertical" | "none";
  inputStyle?: React.CSSProperties;
}
export function Textarea(props: TextareaProps): JSX.Element;
