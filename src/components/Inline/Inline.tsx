import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import { spaceVar, withCustomProperties } from '../Stack/spacing';
import type { LayoutElement, SpaceValue } from '../Stack/spacing';
import styles from './Inline.module.css';

export type InlineAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
export type InlineJustify = 'start' | 'center' | 'end' | 'between';

export interface InlineProps extends ComponentPropsWithRef<'div'> {
  /** Space between children, as a key of the space scale, a number or its string form (`2` = `--ds-space-2` = 8px). Default `2`. */
  gap?: SpaceValue;
  /** Cross-axis (vertical) alignment. Default `center`. */
  align?: InlineAlign;
  /** Main-axis (horizontal) distribution. `between` pushes the first and last child to the edges. Default `start`. */
  justify?: InlineJustify;
  /** Whether children wrap onto the next line when they do not fit. Default `true`, so a row never overflows a narrow screen. */
  wrap?: boolean;
  /**
   * Element to render, `div` by default. Use `ul` or `ol` for a list of `li` children: the
   * list reset is applied and `role="list"` keeps the list semantics in Safari.
   */
  as?: LayoutElement;
}

/**
 * Lays its children out in a horizontal row with a consistent gap. It wraps by default.
 * Direction follows the writing mode, so it mirrors in right-to-left languages.
 */
export function Inline({
  gap = 2,
  align = 'center',
  justify = 'start',
  wrap = true,
  as = 'div',
  className,
  style,
  role,
  ...rest
}: InlineProps) {
  const Component = as as ElementType;
  const isList = as === 'ul' || as === 'ol';
  return (
    <Component
      {...rest}
      role={role ?? (isList ? 'list' : undefined)}
      className={classNames(styles.root, className)}
      style={withCustomProperties(style, { '--ds-inline-gap': spaceVar(gap) })}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? 'wrap' : 'nowrap'}
    />
  );
}
