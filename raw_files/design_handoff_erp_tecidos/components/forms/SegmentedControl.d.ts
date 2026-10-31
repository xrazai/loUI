export interface SegmentOption { value: string; label: string; count?: number; }
/** Controle segmentado para filtros e alternância de 2–5 opções. */
export interface SegmentedControlProps {
  options: Array<SegmentOption | string>;
  value?: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
