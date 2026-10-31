/** Aviso inline dentro do conteúdo. Sem barra colorida lateral. */
export interface AlertProps {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children?: React.ReactNode;
  /** Link ou botão ghost sm à direita. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Alert(props: AlertProps): JSX.Element;
