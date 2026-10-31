import type { CSSProperties, ComponentPropsWithRef } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { Icon } from '../Icon';
import { StarIcon } from '../Icon/icons';
import { messages } from './Rating.messages';
import styles from './Rating.module.css';

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-hidden'
> {
  /**
   * The rating to show, from 0 to `max`. Values are clamped and rounded to the nearest half
   * star ("3.7" shows three and a half stars, and says "3.5 out of 5 stars").
   */
  value: number;
  /** Number of stars. A whole number from 1. Default `5`. */
  max?: number;
  /** Star size token: `sm` 12px, `md` 14px (default), `lg` 18px. */
  size?: RatingSize;
  /** Also shows the value as text ("3.5/5") after the stars. Hidden from assistive technology: the name already says it. */
  showValue?: boolean;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

const ICON_SIZE = { sm: 'xs', md: 'sm', lg: 'md' } as const;

/** Clamps to `[0, max]` and rounds to the nearest half. Non-finite input counts as 0. */
function normalize(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(Math.max(value, 0), max) * 2) / 2;
}

/**
 * A read-only star rating. It is a single image (`role="img"`) with a text alternative such
 * as "3.5 out of 5 stars"; the stars themselves are decorative. Half stars are supported.
 *
 * It does not accept input. An interactive rating needs radio-group semantics and is not part
 * of the design system yet.
 */
export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  messages: overrides,
  className,
  ...rest
}: RatingProps) {
  const t = useMessages('Rating', messages, overrides);
  const locale = useDSLocale();
  const count = Math.max(1, Math.floor(max));
  const shown = normalize(value, count);
  const label = t.label(formatNumber(shown, locale), formatNumber(count, locale), count);
  const stars = Array.from({ length: count }, (_, index) => {
    const fill = Math.min(Math.max(shown - index, 0), 1);
    return { index, fill };
  });
  return (
    <span
      {...rest}
      role="img"
      aria-label={label}
      className={classNames(styles.root, className)}
      data-size={size}
    >
      <span className={styles.stars} aria-hidden="true">
        {stars.map(({ index, fill }) => (
          <span
            key={index}
            className={styles.star}
            data-fill={fill === 1 ? 'full' : fill === 0 ? 'empty' : 'half'}
            style={{ '--ds-rating-fill': `${String(fill * 100)}%` } as CSSProperties}
          >
            <Icon icon={StarIcon} size={ICON_SIZE[size]} className={styles.empty} />
            <span className={styles.filled}>
              <Icon icon={StarIcon} size={ICON_SIZE[size]} className={styles.full} />
            </span>
          </span>
        ))}
      </span>
      {showValue ? (
        <span className={styles.value} aria-hidden="true">
          {formatNumber(shown, locale)}/{formatNumber(count, locale)}
        </span>
      ) : null}
    </span>
  );
}
