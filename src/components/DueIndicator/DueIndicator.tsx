import type { ComponentPropsWithRef } from 'react';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { dueStatus, formatDate, formatRelativeDays, toISODate } from '../../utils/date';
import type { DateStyle, ISODate } from '../../utils/date';
import { messages } from './DueIndicator.messages';
import styles from './DueIndicator.module.css';

export interface DueIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The due date as `YYYY-MM-DD` (`ISODate`). Invalid values throw in development. */
  date: ISODate;
  /**
   * The current day as `YYYY-MM-DD`. Defaults to the user's local day at render time. Pass it
   * to make output deterministic (tests, stories, server rendering with a known day).
   */
  today?: ISODate;
  /** The item is settled: shows "Paid" in the success tone, whatever the date. */
  paid?: boolean;
  /** Shows the formatted date before the status. Default `true`. */
  showDate?: boolean;
  /** Format of the date (`formatDate` styles). Default `monthDay` ("Mar 9"). */
  dateStyle?: DateStyle;
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

/**
 * A due date with a status in words: "Mar 9  Overdue by 3 days", "Due today", "Due in 5 days",
 * "Paid". A dot and the text color follow the tone (`danger` overdue, `warning` within a week,
 * `neutral` later, `success` paid), but the status is always text, never color alone.
 *
 * The urgency comes from `dueStatus`, the wording from messages and `Intl` (`formatRelativeDays`),
 * the date from `formatDate`. Day arithmetic is calendar-based, so daylight-saving changes never
 * shift the count.
 */
export function DueIndicator({
  date,
  today,
  paid = false,
  showDate = true,
  dateStyle = 'monthDay',
  messages: overrides,
  className,
  ...rest
}: DueIndicatorProps) {
  const t = useMessages('DueIndicator', messages, overrides);
  const locale = useDSLocale();
  // `dueStatus` also validates `date` (it throws in development when malformed).
  const result = dueStatus(date, today ?? toISODate(new Date()));
  const tone = paid ? 'success' : result.tone;
  let status = '';
  if (paid) status = t.paid;
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
