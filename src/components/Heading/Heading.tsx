import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'display' | 'title' | 'heading';

export interface HeadingProps extends ComponentPropsWithRef<'h2'> {
  /**
   * Semantic level, `h1` to `h6`. It sets the page outline for assistive technology and has
   * nothing to do with how big the text looks: keep levels sequential and use one `h1` per
   * page. Default `2`.
   */
  level?: HeadingLevel;
  /**
   * Visual size, independent of `level`: `display` (34px, page hero), `title` (22px) or
   * `heading` (17px). Default: `title` for level 1, `heading` for the others.
   */
  size?: HeadingSize;
}

/**
 * A heading whose semantic level and visual size are separate choices, so the document outline
 * stays correct while the design picks the size.
 */
export function Heading({ level = 2, size, className, ...rest }: HeadingProps) {
  const Component = `h${String(level)}` as ElementType;
  return (
    <Component
      {...rest}
      className={classNames(styles.root, className)}
      data-size={size ?? (level === 1 ? 'title' : 'heading')}
    />
  );
}
