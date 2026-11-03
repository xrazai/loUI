import type { ComponentPropsWithRef } from 'react';
import { IconButton } from '../../components/IconButton';
import { XIcon } from '../../components/Icon/icons';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import type { DateStyle, ISODate } from '../../utils/date';
import { formatNumber } from '../../utils/number';
import { messages } from './LedgerList.messages';
import styles from './LedgerList.module.css';

export type LedgerNegativeTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface LedgerEntry {
  /** Stable identifier: the React key and what `onDelete` identifies. */
  id: string;
  /**
   * Date of the entry as `YYYY-MM-DD`. Optional: an entry without a date renders no date (and no
   * `time` element). When at least one entry in the list has a date, the date column is kept so
   * titles and amounts stay aligned across rows; when none has, the column is dropped.
   */
  date?: ISODate | undefined;
  /** What happened ("Payment received", "Stock adjustment"). */
  title: string;
  /** Optional second line (a reference, a person, a note). */
  sub?: string;
  /**
   * Signed change in minor units: positive adds, negative subtracts. Money is an integer in
   * minor units (cents); quantities are plain integers.
   */
  delta: number;
  /** Running balance after this entry, in the same unit as `delta`. Omit to hide it. */
  balance?: number;
  /**
   * Whether this entry gets a "Delete entry" button when the list has `onDelete`. Default `true`.
   * Set `false` for a fixed row (an opening balance, a system entry): it renders no button, so
   * nothing is focusable on it, and its amounts stay aligned with the deletable rows. Has no
   * effect without `onDelete`.
   */
  isDeletable?: boolean | undefined;
}

export interface LedgerListProps extends Omit<ComponentPropsWithRef<'ul'>, 'children'> {
  /** The entries, in display order (usually newest first). */
  entries: readonly LedgerEntry[];
  /**
   * ISO 4217 currency code ("USD"). When set, amounts and balances are formatted as money with
   * `formatCurrency` (minor units). Ignored when `format` is given.
   */
  currency?: string;
  /**
   * Custom formatter for amounts and balances, receiving a number in the same unit as `delta`.
   * The amount of an entry is passed as an absolute value (the sign is shown separately).
   * Without `currency` or `format`, numbers are formatted for the locale.
   */
  format?: (value: number) => string;
  /**
   * Color of negative amounts: `neutral`, `success`, `warning` or `danger` (default). The `-`
   * sign is always shown too. Pick the tone by what the subtraction means (an expense is
   * `danger`, a payment out of a balance owed may be `success`).
   */
  negativeTone?: LedgerNegativeTone;
  /** Format of each entry's date (`formatDate` styles). Default `monthDay`. */
  dateStyle?: DateStyle;
  /**
   * Adds a "Delete entry" button to each row (except entries with `isDeletable: false`) and calls
   * this with the entry. The component only reports the request: the consumer must confirm it
   * (dialog or inline confirmation) before data is removed, and offer Undo afterwards.
   */
  onDelete?: (entry: LedgerEntry) => void;
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

const PLUS = '+';
const MINUS = '−';

/**
 * A list of signed ledger entries: date, title, optional sub line, a signed amount and an
 * optional running balance. The sign is text (`+` / `−`) as well as color. Built as a `ul`.
 *
 * Amounts are integers in minor units (ADR-0006) formatted with `Intl`: pass `currency` for
 * money, `format` for anything else, or neither for plain quantities.
 *
 * Import it from `loui-ds/patterns`.
 */
export function LedgerList({
  entries,
  currency,
  format,
  negativeTone = 'danger',
  dateStyle = 'monthDay',
  onDelete,
  messages: overrides,
  className,
  ...rest
}: LedgerListProps) {
  const t = useMessages('LedgerList', messages, overrides);
  const locale = useDSLocale();
  const formatValue =
    format ??
    ((value: number) =>
      currency === undefined
        ? formatNumber(value, locale)
        : formatCurrency(value, currency, locale));
  return (
    <ul
      {...rest}
      className={classNames(styles.root, className)}
      data-deletable={onDelete ? 'true' : undefined}
      data-dated={entries.some((entry) => entry.date !== undefined) ? 'true' : undefined}
    >
      {entries.map((entry) => {
        const direction = entry.delta > 0 ? 'positive' : entry.delta < 0 ? 'negative' : 'zero';
        const sign = direction === 'positive' ? PLUS : direction === 'negative' ? MINUS : '';
        return (
          <li key={entry.id} className={styles.entry} data-direction={direction}>
            {entry.date !== undefined ? (
              <time className={styles.date} dateTime={entry.date}>
                {formatDate(entry.date, locale, dateStyle)}
              </time>
            ) : null}
            <div className={styles.text}>
              <span className={styles.title}>{entry.title}</span>
              {entry.sub ? <span className={styles.sub}>{entry.sub}</span> : null}
            </div>
            <div className={styles.amounts}>
              <span
                className={styles.amount}
                data-part="amount"
                data-tone={direction === 'negative' ? negativeTone : undefined}
              >
                {sign ? (
                  <span className={styles.sign} data-part="sign">
                    {sign}
                  </span>
                ) : null}
                {formatValue(Math.abs(entry.delta))}
              </span>
              {entry.balance !== undefined ? (
                <span className={styles.balance}>{t.balance(formatValue(entry.balance))}</span>
              ) : null}
            </div>
            {onDelete && entry.isDeletable !== false ? (
              <IconButton
                variant="ghost"
                size="sm"
                icon={XIcon}
                label={t.deleteEntry(entry.title)}
                className={classNames(styles.delete)}
                onPress={() => {
                  onDelete(entry);
                }}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
