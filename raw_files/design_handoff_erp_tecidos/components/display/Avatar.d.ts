/** Avatar circular com iniciais ou foto. Para grupo, sobreponha com marginLeft negativo. */
export interface AvatarProps {
  initials?: string;
  src?: string;
  size?: number;
  /** 0–2: variação de cinza do fundo. */
  tone?: number;
  /** Cor do anel (deve ser a cor do fundo atrás). */
  ring?: string;
  style?: React.CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
