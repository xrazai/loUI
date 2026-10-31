/** Botão de cor selecionável (multi-seleção), usado para vincular cores a um tecido. */
export interface ColorOptionProps {
  hex: string;
  label: string;
  selected?: boolean;
  /** Já vinculada ou indisponível: aparece esmaecida e não clica. */
  disabled?: boolean;
  /** Texto à direita. Padrão: ✓ quando selecionada. Ex.: "já vinculada". */
  mark?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function ColorOption(props: ColorOptionProps): JSX.Element;
