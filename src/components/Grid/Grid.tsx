import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import { spaceVar, withCustomProperties } from '../Stack/spacing';
import type { LayoutElement, SpaceKey } from '../Stack/spacing';
import styles from './Grid.module.css';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type GridMinItemWidth = 'sm' | 'md' | 'lg';

interface GridBaseProps extends ComponentPropsWithRef<'div'> {
  /** Space between rows and columns, as a key of the space scale. Default `4`. */
  gap?: SpaceKey;
  /**
   * Element to render, `div` by default. Use `ul` or `ol` for a list of `li` children: the
   * list reset is applied and `role="list"` keeps the list semantics in Safari.
   */
  as?: LayoutElement;
}

interface GridFixedProps extends GridBaseProps {
  /** A fixed number of equal columns (1 to 12). Items can shrink below their content width. */
  columns: GridColumns;
  minItemWidth?: undefined;
}

interface GridAutoProps extends GridBaseProps {
  columns?: undefined;
  /**
   * Fills the row with as many equal columns as fit, each at least this wide: `sm` 160px,
   * `md` 240px, `lg` 320px (`--ds-grid-min-item-*`). Collapses to one column on narrow screens.
   */
  minItemWidth: GridMinItemWidth;
}

/** Pass `columns` or `minItemWidth`, not both. */
export type GridProps = GridFixedProps | GridAutoProps;

/**
 * A CSS grid with equal columns: a fixed `columns` count, or an auto-fill grid that keeps each
 * item at least `minItemWidth` wide (the responsive choice for card grids). Gaps are space
 * token keys.
 */
export function Grid({
  columns,
  minItemWidth,
  gap = 4,
  as = 'div',
  className,
  style,
  role,
  ...rest
}: GridProps) {
  const Component = as as ElementType;
  const isList = as === 'ul' || as === 'ol';
  return (
    <Component
      {...rest}
      role={role ?? (isList ? 'list' : undefined)}
      className={classNames(styles.root, className)}
      style={withCustomProperties(style, {
        '--ds-grid-gap': spaceVar(gap),
        '--ds-grid-columns': columns === undefined ? undefined : String(columns),
      })}
      data-min-item={minItemWidth}
    />
  );
}
