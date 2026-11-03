import type { ComponentPropsWithRef } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import {
  dueStatus,
  formatDate,
  formatRelativeDays,
  toCalendarDay,
  toISODate,
} from '../../utils/date';
import type { DateStyle } from '../../utils/date';
import { messages } from './DueIndicator.messages';
import styles from './DueIndicator.module.css';

/** A calendar day: `YYYY-MM-DD` (`ISODate`, fast path), a `Date` or an ISO date-time string (local day). */
export type DueDateInput = Date | string;

/** Tones of the free-text form (the shared tone vocabulary). */
export type DueIndicatorTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface DueIndicatorBaseProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

/** Date form: the status is computed from a due date. */
export interface DueIndicatorDateProps extends DueIndicatorBaseProps {
  /**
   * The due date: `YYYY-MM-DD` (`ISODate`, never shifted by a time zone), a `Date` or an ISO
   * date-time string (`2026-10-31T23:30:00-03:00`). A `Date` or date-time maps to the **local**
   * calendar day of the viewer. Invalid values throw in development.
   */
  date: DueDateInput;
  /**
   * The current day, same accepted forms as `date`. Defaults to the user's local day at render
   * time. Pass it to make output deterministic (tests, stories, server rendering).
   */
  today?: DueDateInput;
  /** The item is settled: shows "Paid" in the success tone, whatever the date. */
  paid?: boolean;
  /**
   * The day the item was paid (same forms as `date`). Implies `paid` and shows "Paid Oct 30"
   * from the `paidOn` message, formatted with `dateStyle`.
   */
  paidDate?: DueDateInput;
  /** Shows the formatted date before the status. Default `true`. */
  showDate?: boolean;
  /** Format of the date (`formatDate` styles). Default `monthDay` ("Mar 9"). */
  dateStyle?: DateStyle;
  label?: never;
  tone?: never;
}

/** Free-text form: the caller supplies the status text and its tone; no date logic. */
export interface DueIndicatorLabelProps extends DueIndicatorBaseProps {
  /** The status text ("Pickup at 2 pm"). It carries the meaning; the tone only reinforces it. */
  label: string;
  /** Tone of the dot and the text. */
  tone: DueIndicatorTone;
  date?: never;
  today?: never;
  paid?: never;
  paidDate?: never;
  showDate?: never;
  dateStyle?: never;
}

export type DueIndicatorProps = DueIndicatorDateProps | DueIndicatorLabelProps;

/**
 * A due date with a status in words: "Mar 9  Overdue by 3 days", "Due today", "Due in 5 days",
 * "Paid", "Paid Oct 30". A dot and the text color follow the tone (`danger` overdue, `warning`
 * within a week, `neutral` later, `success` paid), but the status is always text, never color
 * alone. Pass `label` + `tone` instead of `date` for free-text chips ("Pickup at 2 pm").
 *
 * The urgency comes from `dueStatus`, the wording from messages and `Intl` (`formatRelativeDays`),
 * the date from `formatDate`. Day arithmetic is calendar-based, so daylight-saving changes never
 * shift the count.
 */
export function DueIndicator(props: DueIndicatorProps) {
  const {
    date: dateInput,
    today,
    paid = false,
    paidDate,
    showDate = true,
    dateStyle = 'monthDay',
    label,
    tone: labelTone,
    messages: overrides,
    className,
    ...rest
  } = props;
  const t = useMessages('DueIndicator', messages, overrides);
  const locale = useDSLocale();

  if (label !== undefined) {
    return (
      <span {...rest} className={classNames(styles.root, className)} data-tone={labelTone}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.status}>{label}</span>
      </span>
    );
  }

  const date = toCalendarDay(dateInput);
  const isPaid = paid || paidDate !== undefined;
  // `dueStatus` also validates `date` (it throws in development when malformed).
  const result = dueStatus(
    date,
    today === undefined ? toISODate(new Date()) : toCalendarDay(today),
  );
  const tone = isPaid ? 'success' : result.tone;
  let status = '';
  if (paidDate !== undefined) {
    status = t.paidOn(formatDate(toCalendarDay(paidDate), locale, dateStyle));
  } else if (isPaid) status = t.paid;
  else if (!Number.isNaN(result.days)) {
    status =
      result.days < 0 ? t.overdue(-result.days) : t.due(formatRelativeDays(result.days, locale));
  }
  return (
    <span {...rest} className={classNames(styles.root, className)} data-tone={tone}>
      <span className={styles.dot} aria-hidden="true" />
      {showDate ? (
        <time className={styles.date} dateTime={date}>
          {formatDate(date, locale, dateStyle)}
        </time>
      ) : null}
      {status ? <span className={styles.status}>{status}</span> : null}
    </span>
  );
}
