import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import type { CalendarDate } from '@internationalized/date';
import { isISODate } from '../../utils/date';
import type { ISODate } from '../../utils/date';

/**
 * Boundary between the design system (ISO `YYYY-MM-DD` strings, no time zone, see
 * `docs/architecture/utilities.md`) and React Aria (`CalendarDate` objects from
 * `@internationalized/date`). Invalid strings are treated as "no date".
 */
export function toCalendarDate(iso: ISODate | null | undefined): CalendarDate | null {
  if (iso === null || iso === undefined || !isISODate(iso)) return null;
  return parseDate(iso);
}

/** `CalendarDate.toString()` is already `YYYY-MM-DD`. */
export function toISO(date: CalendarDate | null): ISODate | null {
  return date === null ? null : date.toString();
}

/** Today's date in the viewer's time zone. Call it in event handlers and effects, not during render. */
export function todayDate(): CalendarDate {
  return today(getLocalTimeZone());
}
