import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Width: a number in px or any CSS length. Default `100%`. Ignored when `circle` is set (the circle is as wide as it is tall). */
  width?: number | string;
  /** Height of the block, or of each line: a number in px or any CSS length. Default `12px` (`--ds-skeleton-height`). */
  height?: number | string;
  /** Renders a circle, for an avatar. The diameter is `height`. */
  circle?: boolean;
  /** Renders this many text lines; the last one is shorter. Takes precedence over `circle`. */
  lines?: number;
}

function toLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${String(value)}px` : value;
}

/**
 * A placeholder block in the shape of content that is still loading. It is always hidden
 * from assistive technology: mark the region that is loading with `aria-busy="true"` and
 * remove the attribute (and the skeletons) when the content arrives.
 *
 * The `width` and `height` props are the only dynamic values in the library that reach the
 * DOM as custom properties on `style`, because arbitrary sizes cannot be tokens.
 */
export function Skeleton({
  width,
  height,
  circle = false,
  lines,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const sizeStyle = {
    ...style,
    '--skeleton-width': toLength(width),
    '--skeleton-height': toLength(height),
  } as CSSProperties;
  const count = lines !== undefined && lines > 0 ? Math.floor(lines) : 0;

  if (count > 0) {
    return (
      <span
        {...rest}
        aria-hidden="true"
        className={classNames(styles.lines, className)}
        style={sizeStyle}
      >
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={styles.line}
            data-last={(index === count - 1 && count > 1) || undefined}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      {...rest}
      aria-hidden="true"
      className={classNames(styles.block, className)}
      data-shape={circle ? 'circle' : 'rect'}
      style={sizeStyle}
    />
  );
}
