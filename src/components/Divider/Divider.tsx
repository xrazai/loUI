import type { Ref } from 'react';
import { Separator } from 'react-aria-components';
import type { SeparatorProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import styles from './Divider.module.css';

export type DividerVariant = 'subtle' | 'default' | 'strong';

export interface DividerProps extends Omit<
  SeparatorProps,
  'className' | 'style' | 'slot' | 'render' | 'orientation'
> {
  /** `horizontal` (default) separates stacked content; `vertical` separates items in a row and needs a parent with a height. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Line weight by token: `subtle` (`--ds-line-subtle`, internal dividers), `default`
   * (`--ds-line`, between cards and sections) or `strong` (`--ds-line-strong`, around controls
   * and overlays). Default `default`.
   */
  variant?: DividerVariant;
  className?: string;
  /** Ref to the separator element. */
  ref?: Ref<HTMLElement>;
}

/**
 * A 1px line that separates groups of content, built on React Aria `Separator`
 * (`<hr>`, or `role="separator"` with `aria-orientation` when vertical). Prefer spacing to
 * separate related things; use a divider where the content changes topic.
 */
export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  className,
  ...rest
}: DividerProps) {
  return (
    <Separator
      {...rest}
      orientation={orientation}
      className={classNames(styles.root, className)}
      data-variant={variant}
      data-orientation={orientation}
    />
  );
}
