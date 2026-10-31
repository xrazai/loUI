export interface BreadcrumbItem { label: string; href?: string; onClick?: () => void; }
/** Trilha de navegação; o último item é a página atual. */
export interface BreadcrumbProps { items: BreadcrumbItem[]; style?: React.CSSProperties; }
export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
