import type { LucideIcon } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Icon.module.css';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconProps extends Omit<
  ComponentPropsWithRef<'svg'>,
  'children' | 'role' | 'aria-label' | 'aria-hidden' | 'aria-labelledby'
> {
  /** The icon to draw, one of the curated set exported from this package (for example `SearchIcon`). */
  icon: LucideIcon;
  /** Size token: `xs` 12px, `sm` 14px, `md` 18px (default), `lg` 20px. */
  size?: IconSize;
  /**
   * Accessible name. Omit it when the icon only decorates text that already names the
   * control (the icon is then hidden from assistive technology). Set it only when the icon
   * carries meaning on its own, outside a control that has its own name.
   */
  label?: string;
  /**
   * Mirror the icon horizontally in right-to-left languages. Set it for icons that point in a
   * reading direction (chevrons, arrows); leave it off for symmetric or universal icons.
   */
  directional?: boolean;
}

/**
 * An inline SVG icon (Lucide, bundled) that inherits the text color and draws a 1.5px stroke.
 * Decorative by default; pass `label` to make it a meaningful image.
 */
export function Icon({
  icon: Glyph,
  size = 'md',
  label,
  directional = false,
  className,
  ...rest
}: IconProps) {
  const semantics = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const);
  return (
    <Glyph
      {...rest}
      {...semantics}
      focusable="false"
      data-size={size}
      data-directional={directional || undefined}
      className={classNames(styles.root, className)}
    />
  );
}
