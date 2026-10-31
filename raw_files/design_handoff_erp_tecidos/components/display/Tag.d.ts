/** Etiqueta técnica em mono (versões, códigos, filtros aplicados). */
export interface TagProps {
  children: React.ReactNode;
  /** Mostra um × para remover. */
  onRemove?: () => void;
  style?: React.CSSProperties;
}
export function Tag(props: TagProps): JSX.Element;
