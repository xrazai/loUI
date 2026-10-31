/** Notificação transitória. Posicione no canto inferior; some em ~2,6s. */
export interface ToastProps {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "accent" | null;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export function Toast(props: ToastProps): JSX.Element;
