import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import { spaceVar, withCustomProperties } from './spacing';
import type { LayoutElement, SpaceKey } from './spacing';
import styles from './Stack.module.css';

export type StackAlign = 'start' | 'center' | 'end' | 'stretch';

export interface StackProps extends ComponentPropsWithRef<'div'> {
  /** Space between children, as a key of the space scale (`4` = `--ds-space-4` = 16px). Default `4`. */
  gap?: SpaceKey;
  /** Cross-axis (horizontal) alignment of the children. Default `stretch`. */
  align?: StackAlign;
  /**
   * Element to render, `div` by default. Use `ul` or `ol` for a list of `li` children: the
   * list reset is applied and `role="list"` keeps the list semantics in Safari.
   */
  as?: LayoutElement;
}

/**
 * Lays its children out in a vertical column with a consistent gap. The gap is a space token
 * key, never a pixel value. Children can shrink below their content width (`min-inline-size: 0`).
 */
export function Stack({
  gap = 4,
  align = 'stretch',
  as = 'div',
  className,
  style,
  role,
  ...rest
}: StackProps) {
  const Component = as as ElementType;
  const isList = as === 'ul' || as === 'ol';
  return (
    <Component
      {...rest}
      role={role ?? (isList ? 'list' : undefined)}
      className={classNames(styles.root, className)}
      style={withCustomProperties(style, { '--ds-stack-gap': spaceVar(gap) })}
      data-align={align}
    />
  );
}
