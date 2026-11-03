import { formatDate, isISODate } from '../../utils/date';
import { reportInvalid } from '../../utils/env';
import { createCache } from '../../utils/formatCache';

const formats = createCache<Intl.DateTimeFormat>();

export interface EventTime {
  /** Text for people, formatted with `Intl` for the locale. */
  text: string;
  /** Machine-readable value for `<time dateTime>`. */
  dateTime: string;
  /** Epoch milliseconds, `NaN` when the value is not a valid date. */
  epoch: number;
}

/** Epoch milliseconds of an event time; `NaN` when invalid. */
export function eventEpoch(value: Date | string): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

/**
 * Formats the time of an event. A date-only string (`2026-10-31`) is shown as a date in UTC,
 * so the day never shifts; a date-time (`2026-10-31T14:30:00Z`, or a `Date`) is shown as date
 * and time in `timeZone` (the viewer's zone when omitted). Invalid input throws in development
 * and is shown unchanged in production.
 */
export function formatEventTime(
  value: Date | string,
  locale: string,
  timeZone?: string,
): EventTime {
  const epoch = eventEpoch(value);
  const raw = value instanceof Date ? '' : value;
  if (Number.isNaN(epoch)) {
    reportInvalid(`Timeline expects each time as an ISO 8601 string or a Date, received "${raw}".`);
    return { text: raw, dateTime: raw, epoch };
  }
  if (typeof value === 'string' && isISODate(value)) {
    return { text: formatDate(value, locale, 'medium'), dateTime: value, epoch };
  }
  const format = formats.get(
    `${locale}|${timeZone ?? ''}`,
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...(timeZone ? { timeZone } : {}),
      }),
  );
  return {
    text: format.format(epoch),
    dateTime: value instanceof Date ? value.toISOString() : value,
    epoch,
  };
}
