import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Text.module.css';

export type TextSize = 'body' | 'small' | 'label' | 'meta' | 'caption';
export type TextTone = 'default' | 'secondary' | 'tertiary';
export type TextElement =
  | 'span'
  | 'p'
  | 'div'
  | 'label'
  | 'strong'
  | 'em'
  | 'small'
  | 'li'
  | 'dt'
  | 'dd'
  | 'legend'
  | 'figcaption';

export interface TextProps extends ComponentPropsWithRef<'span'> {
  /**
   * Type scale step: `body` 15px, `small` 14px, `label` 13px, `meta` 12px, or `caption` 11.5px.
   * `caption` is always Geist Mono, uppercase by CSS, with extra tracking: write the source text
   * in sentence case. Default `body`.
   */
  size?: TextSize;
  /**
   * Text color: `default` (`--ds-text`), `secondary` (`--ds-text-2`, supporting text) or
   * `tertiary` (`--ds-text-3`, hints). Tertiary passes 4.5:1 on every surface, but signals
   * the lowest importance: use it for meta and hints, never for primary content. Default `default`.
   */
  tone?: TextTone;
  /** Geist Mono with tabular figures, for codes, identifiers, amounts and shortcuts. */
  mono?: boolean;
  /** Keeps the text on one line and cuts it with an ellipsis. Put the full text in `title` or nearby for sighted users. */
  truncate?: boolean;
  /** Element to render. Default `span`, which is safe inside any inline context; use `p` for a paragraph. */
  as?: TextElement;
}

/**
 * Body text on the type scale. It sets size, line height, color tone and an optional mono
 * face; the element (`as`) carries the meaning. Use `Heading` for headings and `Code` for code.
 */
export function Text({
  size = 'body',
  tone = 'default',
  mono = false,
  truncate = false,
  as = 'span',
  className,
  ...rest
}: TextProps) {
  const Component = as as ElementType;
  return (
    <Component
      {...rest}
      className={classNames(styles.root, className)}
      data-size={size}
      data-tone={tone}
      data-mono={mono || size === 'caption' ? 'true' : undefined}
      data-truncate={truncate ? 'true' : undefined}
    />
  );
}
