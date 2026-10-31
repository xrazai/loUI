import { reportInvalid } from './env';
import { createCache } from './formatCache';

/**
 * Calendar dates travel as ISO 8601 date strings (`YYYY-MM-DD`), never as `Date`
 * objects: they carry no time zone, so they cannot shift by a day.
 */
export type ISODate = string;

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses `YYYY-MM-DD` into UTC epoch milliseconds; `undefined` if malformed or not a real date. */
function parseISODate(iso: string): number | undefined {
  const match = ISO_DATE.exec(iso);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  // setUTCFullYear avoids Date.UTC mapping years 0-99 to 1900-1999.
  date.setUTCFullYear(year, month - 1, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return date.getTime();
}

/** True if `value` is a real calendar date written as `YYYY-MM-DD`. */
export function isISODate(value: string): value is ISODate {
  return parseISODate(value) !== undefined;
}

export type DateStyle = 'short' | 'medium' | 'long' | 'full' | 'monthDay' | 'monthYear';

const STYLE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { dateStyle: 'short' },
  medium: { dateStyle: 'medium' },
  long: { dateStyle: 'long' },
  full: { dateStyle: 'full' },
  monthDay: { month: 'short', day: 'numeric' },
  monthYear: { month: 'long', year: 'numeric' },
};

const dateFormats = createCache<Intl.DateTimeFormat>();

/**
 * Formats an ISO date for `locale`. Formatting happens in UTC, so the day never
 * shifts with the viewer's time zone. Invalid input throws in development and
 * is returned unchanged in production.
 *
 * `formatDate('2026-10-31', 'en-US', 'medium')` is `Oct 31, 2026`.
 */
export function formatDate(iso: ISODate, locale: string, style: DateStyle = 'medium'): string {
  const time = parseISODate(iso);
  if (time === undefined) {
    reportInvalid(`formatDate expects a real date as YYYY-MM-DD, received "${iso}".`);
    return iso;
  }
  const format = dateFormats.get(
    `${locale}|${style}`,
    () => new Intl.DateTimeFormat(locale, { ...STYLE_OPTIONS[style], timeZone: 'UTC' }),
  );
  return format.format(time);
}

/**
 * Converts a `Date` to `YYYY-MM-DD` using its **local** calendar day (what the
 * user sees on their clock). Pass `{ utc: true }` to use the UTC day instead.
 * Invalid dates and years outside 0000-9999 throw in development and give `''` in production.
 */
export function toISODate(date: Date, options: { utc?: boolean } = {}): ISODate {
  const utc = options.utc === true;
  const year = utc ? date.getUTCFullYear() : date.getFullYear();
  const month = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  const day = utc ? date.getUTCDate() : date.getDate();
  if (Number.isNaN(year) || year < 0 || year > 9999) {
    reportInvalid('toISODate received an invalid Date or a year outside 0000-9999.');
    return '';
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Whole days from `isoA` to `isoB` (positive when `isoB` is later). Uses UTC
 * date math, so daylight-saving changes cannot produce 23- or 25-hour "days".
 * Invalid input throws in development and returns `NaN` in production.
 */
export function daysBetween(isoA: ISODate, isoB: ISODate): number {
  const a = parseISODate(isoA);
  const b = parseISODate(isoB);
  if (a === undefined || b === undefined) {
    reportInvalid(`daysBetween expects dates as YYYY-MM-DD, received "${isoA}" and "${isoB}".`);
    return Number.NaN;
  }
  return Math.round((b - a) / MS_PER_DAY);
}

export type DueTone = 'danger' | 'warning' | 'neutral';

export interface DueStatus {
  /** Days from today until the due date; negative when overdue, 0 when due today. */
  days: number;
  tone: DueTone;
}

/**
 * Urgency of a due date: overdue (`< 0` days) is `danger`, due within a week
 * (`0` to `7`) is `warning`, later is `neutral`. The visible text always comes
 * from messages (color is never the only signal, AGENTS.md section 5).
 */
export function dueStatus(dueISO: ISODate, todayISO: ISODate): DueStatus {
  const days = daysBetween(todayISO, dueISO);
  if (days < 0) return { days, tone: 'danger' };
  if (days <= 7) return { days, tone: 'warning' };
  return { days, tone: 'neutral' };
}

const relativeFormats = createCache<Intl.RelativeTimeFormat>();

/**
 * Relative day label from `Intl.RelativeTimeFormat` with `numeric: 'auto'`:
 * `-1` is `yesterday`, `0` is `today`, `1` is `tomorrow`, `3` is `in 3 days`.
 * `days` must be an integer (throws in development, rounded in production).
 */
export function formatRelativeDays(days: number, locale: string): string {
  let value = days;
  if (!Number.isInteger(value)) {
    reportInvalid(
      `formatRelativeDays expects an integer number of days, received ${String(days)}.`,
    );
    value = Math.round(value);
  }
  const format = relativeFormats.get(
    locale,
    () => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
  );
  // Normalizes -0, which would format as "0 days ago" in some engines.
  return format.format(value === 0 ? 0 : value, 'day');
}
