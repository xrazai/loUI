import * as React from "react";
/** Estado vazio: o que aconteceu + o que fazer. Sem ilustração. */
export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Botão primário. */
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  compact?: boolean;
  bordered?: boolean;
  style?: React.CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
