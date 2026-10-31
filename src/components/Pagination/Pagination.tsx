import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { Button } from 'react-aria-components';
import { useLocale } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icon';
import { IconButton } from '../IconButton';
import { messages } from './Pagination.messages';
import styles from './Pagination.module.css';
import { getItemRange, getPageCount, getPageItems } from './pageItems';

export interface PaginationProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onChange' | 'defaultValue'
> {
  /** Current page, 1-based (controlled). */
  page?: number;
  /** Page shown first (uncontrolled). Default `1`. */
  defaultPage?: number;
  /** Called with the new page when the user picks one. */
  onChange?: (page: number) => void;
  /**
   * Number of pages. Optional when `total` and `pageSize` are given (then it is derived from
   * them). Default `1`.
   */
  pageCount?: number;
  /** Total number of items. With `pageSize` it enables the "1–10 of 42" range text. */
  total?: number;
  /** Items per page. */
  pageSize?: number;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * Previous and next buttons, numbered page buttons with ellipses, and a text that says where
 * you are ("11–20 of 42", or "Page 2 of 5" when only the page count is known).
 *
 * The text is a polite live region, so a screen reader announces the new range when the page
 * changes. The current page button has `aria-current="page"`. The buttons that cannot be used
 * (previous on page 1) are disabled; when pressing a button disables it, focus moves to the
 * current page button so it is never lost.
 */
export function Pagination({
  page,
  defaultPage = 1,
  onChange,
  pageCount: pageCountProp,
  total,
  pageSize,
  messages: overrides,
  className,
  ...rest
}: PaginationProps) {
  const locale = useDSLocale();
  const { direction } = useLocale();
  const t = useMessages('Pagination', messages, overrides);
  const hasRange = total !== undefined && pageSize !== undefined;
  const pageCount = Math.max(1, pageCountProp ?? (hasRange ? getPageCount(total, pageSize) : 1));
  const [rawPage, setPage] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage,
    onChange,
  });
  const current = Math.min(Math.max(1, rawPage), pageCount);

  const currentRef = useRef<HTMLButtonElement>(null);
  const refocusCurrent = useRef(false);
  useEffect(() => {
    if (refocusCurrent.current) {
      refocusCurrent.current = false;
      currentRef.current?.focus();
    }
  }, [current]);

  const go = (next: number, fromEdgeButton = false) => {
    if (next < 1 || next > pageCount || next === current) return;
    // The pressed previous/next button is about to be disabled: hand focus to the current page.
    refocusCurrent.current = fromEdgeButton && (next === 1 || next === pageCount);
    setPage(next);
  };

  const format = (value: number) => formatNumber(value, locale);
  let summary: string;
  if (hasRange) {
    const range = getItemRange(current, pageSize, total);
    summary = range ? t.range(format(range.from), format(range.to), format(total)) : t.empty;
  } else {
    summary = t.pageOf(format(current), format(pageCount));
  }

  const isRtl = direction === 'rtl';
  return (
    <div {...rest} className={classNames(styles.root, className)}>
      <span role="status" aria-live="polite" aria-atomic="true" className={styles.summary}>
        {summary}
      </span>
      <nav aria-label={t.navLabel} className={styles.nav}>
        <ul className={styles.list}>
          <li>
            <IconButton
              label={t.previous}
              icon={isRtl ? ChevronRightIcon : ChevronLeftIcon}
              variant="ghost"
              size="sm"
              isDisabled={current <= 1}
              onPress={() => {
                go(current - 1, true);
              }}
            />
          </li>
          {getPageItems(current, pageCount).map((item) =>
            item.type === 'ellipsis' ? (
              <li key={`gap-${String(item.after)}`} className={styles.ellipsis} aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item.page}>
                <Button
                  ref={item.page === current ? currentRef : null}
                  className={classNames(styles.page)}
                  aria-label={t.page(format(item.page))}
                  {...(item.page === current ? { 'aria-current': 'page' as const } : {})}
                  data-current={item.page === current || undefined}
                  onPress={() => {
                    go(item.page);
                  }}
                >
                  {format(item.page)}
                </Button>
              </li>
            ),
          )}
          <li>
            <IconButton
              label={t.next}
              icon={isRtl ? ChevronLeftIcon : ChevronRightIcon}
              variant="ghost"
              size="sm"
              isDisabled={current >= pageCount}
              onPress={() => {
                go(current + 1, true);
              }}
            />
          </li>
        </ul>
      </nav>
    </div>
  );
}
