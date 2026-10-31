import * as React from "react";
/**
 * Diálogo modal com overlay, Esc e clique fora para fechar.
 * @startingPoint section="Feedback" subtitle="Diálogo de confirmação e formulário" viewport="700x360"
 */
export interface DialogProps {
  open?: boolean;
  title: string;
  description?: string;
  /** Corpo (campos de formulário). */
  children?: React.ReactNode;
  /** Botões, alinhados à direita: secundário, depois primário. */
  footer?: React.ReactNode;
  onClose?: () => void;
  width?: number;
  /** position:absolute em vez de fixed — para modais dentro de um frame. */
  contained?: boolean;
}
export function Dialog(props: DialogProps): JSX.Element | null;
