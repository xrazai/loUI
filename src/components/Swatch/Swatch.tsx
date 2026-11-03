import type { CSSProperties, ComponentPropsWithRef } from 'react';
import { classNames } from '../../utils/classNames';
import { reportInvalid } from '../../utils/env';
import { isHexColor } from './hex';
import styles from './Swatch.module.css';

export type SwatchSize = 'sm' | 'md' | 'lg';

interface SwatchBaseProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'color' | 'style' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-hidden'
> {
  /**
   * The color to show, as `#rgb` or `#rrggbb`. `undefined`, `null` and `''` mean "no color" and
   * render an empty dashed circle (use it for model data that may have no color). Any other
   * value throws in development and renders the same empty circle in production.
   */
  color?: string | null | undefined;
  /** Diameter token: `sm` 16px, `md` 20px (default), `lg` 32px. */
  size?: SwatchSize;
}

interface NamedSwatchProps extends SwatchBaseProps {
  /**
   * Name of the color ("Navy"). Required whenever the swatch is the only thing that identifies
   * the color: a color on its own says nothing to a screen reader or to a color-blind user.
   */
  label: string;
  decorative?: never;
}

interface DecorativeSwatchProps extends SwatchBaseProps {
  label?: never;
  /**
   * Hides the swatch from assistive technology. Use it only when the color is also named by
   * adjacent text (a table cell, an option label).
   */
  decorative: true;
}

export type SwatchProps = NamedSwatchProps | DecorativeSwatchProps;

/**
 * A small circle filled with a color, with a subtle inset ring so dark colors stay visible on
 * dark surfaces. It needs either a `label` (the color's name) or `decorative`, so the color is
 * never the only carrier of meaning.
 *
 * Built as a plain element rather than React Aria `ColorSwatch`: that one paints an inline
 * `background` and names itself with a generated description ("vibrant blue"), while this one
 * sets only the `--ds-swatch-color` custom property and uses the name you give it.
 */
export function Swatch({ color, size = 'md', label, decorative, className, ...rest }: SwatchProps) {
  const absent = color === undefined || color === null || color === '';
  const valid = isHexColor(color);
  if (!valid && !absent) {
    reportInvalid(`Swatch expects a hex color (#rgb or #rrggbb), received "${color}".`);
  }
  const semantics =
    decorative === true
      ? ({ 'aria-hidden': true } as const)
      : ({ role: 'img', 'aria-label': label } as const);
  const style = valid ? ({ '--ds-swatch-color': color } as CSSProperties) : undefined;
  return (
    <span
      {...rest}
      {...semantics}
      style={style}
      className={classNames(styles.root, className)}
      data-size={size}
      data-empty={valid ? undefined : 'true'}
    />
  );
}
