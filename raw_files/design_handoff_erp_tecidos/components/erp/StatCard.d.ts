/** Indicador: rótulo em caption, número grande em mono e uma nota curta. */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Contexto ou variação: "3 vendas · ticket R$ 120", "+12% vs 30 dias anteriores". */
  note?: React.ReactNode;
  /** Cor do número. Use danger/warning só quando o número pede ação. */
  tone?: "neutral" | "success" | "warning" | "danger";
  /** Cor da nota. Variação: success sobe, danger cai. */
  noteTone?: "muted" | "success" | "warning" | "danger";
  size?: "md" | "lg";
  /** Texto curto em mono à direita do rótulo, ex.: "42%". */
  aside?: React.ReactNode;
  /** Conteúdo entre o número e a nota, ex.: barra de proporção de 4px. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function StatCard(props: StatCardProps): JSX.Element;
