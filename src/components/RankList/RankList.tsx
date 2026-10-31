import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { useDSLocale, useMessages } from '../../i18n';
import { Swatch } from '../Swatch';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { messages } from './RankList.messages';
import styles from './RankList.module.css';

export type RankListSort = 'asc' | 'desc';

export interface RankItem {
  /** Stable id of the row. Falls back to the label, so give one when labels can repeat. */
  id?: string;
  /** Name of the item: a product, a color, a customer. Truncated with an ellipsis when it does not fit. */
  label: string;
  /** The number the row is ranked by. Negative and non-finite values draw an empty bar. */
  value: number;
  /** Detail under the value, in mono type: `12 units · 18%`. */
  meta?: ReactNode;
  /** Hex color (`#8AB4FF`) of a small decorative `Swatch` before the label. The label names it; the swatch is hidden from assistive technology. */
  swatch?: string;
  /** Makes the row a button that calls this when pressed (for example to open the customer). */
  onAction?: () => void;
}

export interface RankListProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-label' | 'aria-labelledby'
> {
  /** Accessible name of the list ("Top products"). Optional: a list inside a titled `Card` is already named by it. */
  'aria-label'?: string;
  /** Id of the element that names the list. */
  'aria-labelledby'?: string;
  /**
   * The rows, rendered **in the order given** unless `sort` is set. This differs from the
   * handoff, which always sorted descending and kept only six rows: sorting and truncating
   * silently changes the data, so both are opt-in.
   */
  items: readonly RankItem[];
  /** Sorts by `value` (`desc` largest first, `asc` smallest first) before `limit` is applied. Ties keep their input order. */
  sort?: RankListSort;
  /** Shows only the first `limit` rows (after `sort`). Default: all rows. */
  limit?: number;
  /** Formats each value. Default: `formatNumber` with the active locale; use `formatCurrency` for money. */
  format?: (value: number) => ReactNode;
  /** Shows the position (1, 2, 3...) before each row. The list is ordered either way. Default `true`. */
  showPosition?: boolean;
  /** Content when there are no rows. Default: the "No data for this period" message. */
  emptyState?: ReactNode;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

function safe(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function rowStyle(share: number): CSSProperties {
  return { '--ds-rank-list-share': `${String(share)}%` } as CSSProperties;
}

/**
 * An ordered list of items with a value, a bar relative to the largest value and an optional
 * detail. Rows can be plain or buttons.
 *
 * The list renders the items as given; pass `sort` and `limit` for a "top N". Put it in a
 * `Card` with `padding="none"`.
 */
export function RankList({
  items,
  sort,
  limit,
  format,
  showPosition = true,
  emptyState,
  messages: overrides,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: RankListProps) {
  const locale = useDSLocale();
  const t = useMessages('RankList', messages, overrides);

  let rows = [...items];
  if (sort) {
    const sign = sort === 'desc' ? -1 : 1;
    rows = rows
      .map((item, index) => ({ item, index }))
      .sort((a, b) => sign * (safe(a.item.value) - safe(b.item.value)) || a.index - b.index)
      .map((entry) => entry.item);
  }
  if (limit !== undefined) rows = rows.slice(0, Math.max(0, Math.floor(limit)));

  if (rows.length === 0) {
    return (
      <div {...rest} className={classNames(styles.root, className)}>
        <div className={styles.empty}>{emptyState ?? t.empty}</div>
      </div>
    );
  }

  const max = Math.max(...rows.map((row) => safe(row.value)));
  const renderValue = format ?? ((value: number) => formatNumber(value, locale));

  return (
    <div {...rest} className={classNames(styles.root, className)}>
      {/* eslint-disable-next-line jsx-a11y-x/no-redundant-roles -- Safari/VoiceOver drops list semantics from lists with `list-style: none`. */}
      <ol
        role="list"
        className={styles.list}
        data-positions={showPosition || undefined}
        {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
        {...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy })}
      >
        {rows.map((item, index) => {
          const share = max > 0 ? (safe(item.value) / max) * 100 : 0;
          const content = (
            <>
              {showPosition ? (
                <span className={styles.position} aria-hidden="true">
                  {formatNumber(index + 1, locale)}
                </span>
              ) : null}
              <span className={styles.label}>
                {item.swatch ? <Swatch color={item.swatch} size="sm" decorative /> : null}
                <span className={styles.text}>{item.label}</span>
              </span>
              <span className={styles.value}>{renderValue(item.value)}</span>
              <span className={styles.bar} aria-hidden="true">
                <span className={styles.fill} />
              </span>
              {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
            </>
          );
          return (
            <li key={item.id ?? item.label} className={styles.item}>
              {item.onAction ? (
                <Button
                  className={classNames(styles.row)}
                  style={rowStyle(share)}
                  onPress={item.onAction}
                >
                  {content}
                </Button>
              ) : (
                <div className={styles.row} style={rowStyle(share)}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
