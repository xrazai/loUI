import type { ComponentPropsWithRef, ElementType } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './VisuallyHidden.module.css';

export interface VisuallyHiddenProps extends ComponentPropsWithRef<'span'> {
  /** Element to render. Defaults to `span`. */
  as?: ElementType;
}

/**
 * Hides content visually while keeping it available to assistive technology.
 * Use it for text alternatives that sighted users do not need.
 */
export function VisuallyHidden({
  as: Component = 'span',
  className,
  ...rest
}: VisuallyHiddenProps) {
  const classes = classNames(styles.root, className);
  return <Component {...rest} className={classes} />;
}
