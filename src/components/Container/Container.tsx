import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import type { LayoutElement } from '../Stack/spacing';
import styles from './Container.module.css';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'full';

export interface ContainerProps extends ComponentPropsWithRef<'div'> {
  /**
   * Maximum inline size: `sm` 640px, `md` 960px, `lg` 1200px (`--ds-container-*`), or `full`
   * for no maximum. Default is the page content maximum (`--ds-content-max`, 1200px).
   */
  size?: ContainerSize;
  /** Adds the content gutter (`--ds-content-gutter`, 24px) as inline padding. Default `true`. */
  gutter?: boolean;
  /** Element to render, `div` by default. */
  as?: LayoutElement;
}

/**
 * Centers page content and limits its line length: a maximum inline size plus a side gutter.
 * It carries no landmark role; put it inside `main`.
 */
export function Container({ size, gutter = true, as = 'div', className, ...rest }: ContainerProps) {
  const Component = as as ElementType;
  return (
    <Component
      {...rest}
      className={classNames(styles.root, className)}
      data-size={size}
      data-gutter={gutter ? 'true' : 'false'}
    />
  );
}
