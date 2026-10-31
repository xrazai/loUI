/** Área de upload com arrastar e soltar e lista de arquivos com progresso. */
export interface FileUploadProps {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  /** Simula progresso de envio (protótipos). Padrão true. */
  simulate?: boolean;
  style?: React.CSSProperties;
}
export function FileUpload(props: FileUploadProps): JSX.Element;
