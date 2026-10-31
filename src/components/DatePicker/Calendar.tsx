import { getLocalTimeZone, isToday } from '@internationalized/date';
import type { Ref } from 'react';
import {
  Calendar as RACCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
} from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import type { ISODate } from '../../utils/date';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icon/icons';
import { IconButton } from '../IconButton';
import { messages } from './Calendar.messages';
import styles from './Calendar.module.css';
import { toCalendarDate, toISO } from './dates';

export type CalendarMessages = Partial<typeof messages.en>;

/** Props shared by the standalone `Calendar` and the calendar inside `DatePicker`. */
export interface CalendarViewProps {
  /** Earliest selectable date (`YYYY-MM-DD`). Earlier days are disabled. */
  min?: ISODate | undefined;
  /** Latest selectable date (`YYYY-MM-DD`). Later days are disabled. */
  max?: ISODate | undefined;
  /** Disables the whole calendar: days cannot be focused or selected. */
  isDisabled?: boolean | undefined;
  /** The calendar can be navigated and focused but the value cannot change. */
  isReadOnly?: boolean | undefined;
  /** Moves focus into the grid on mount. */
  autoFocus?: boolean | undefined;
  className?: string | undefined;
  /** Message overrides for this instance: `previousMonth`, `nextMonth`. */
  messages?: CalendarMessages | undefined;
  ref?: Ref<HTMLDivElement> | undefined;
}

interface NamedProps {
  /** Accessible name of the calendar grid. Required unless `aria-labelledby` is given. */
  'aria-label'?: string | undefined;
  /** Id of the element that names the calendar. Required unless `aria-label` is given. */
  'aria-labelledby'?: string | undefined;
}

export type CalendarProps = CalendarViewProps &
  NamedProps & {
    /** The selected date as `YYYY-MM-DD`, or `null` for none. Pair with `onChange`. */
    value?: ISODate | null | undefined;
    /** The initially selected date when uncontrolled. */
    defaultValue?: ISODate | null | undefined;
    /** Called with the picked date as `YYYY-MM-DD`. */
    onChange?: ((value: ISODate) => void) | undefined;
  } & (
    | {
        /** Accessible name of the calendar grid. Required unless `aria-labelledby` is given. */
        'aria-label': string;
        /** Id of the element that names the calendar. */
        'aria-labelledby'?: string;
      }
    | {
        /** Accessible name of the calendar grid. */
        'aria-label'?: string;
        /** Id of the element that names the calendar. Required unless `aria-label` is given. */
        'aria-labelledby': string;
      }
  );

/**
 * The month grid with its header, shared by `Calendar` and `DatePicker`. It reads the date state
 * from React Aria context when rendered inside a `DatePicker`; standalone it takes the props
 * passed to `Calendar`.
 */
export function CalendarView({
  min,
  max,
  isDisabled,
  isReadOnly,
  autoFocus,
  className,
  messages: overrides,
  ref,
  ...rest
}: CalendarViewProps & Record<string, unknown>) {
  const t = useMessages('Calendar', messages, overrides);
  const minValue = toCalendarDate(min);
  const maxValue = toCalendarDate(max);
  return (
    <RACCalendar
      {...rest}
      ref={ref}
      className={classNames(styles.root, className)}
      {...(minValue ? { minValue } : {})}
      {...(maxValue ? { maxValue } : {})}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isReadOnly === undefined ? {} : { isReadOnly })}
      {...(autoFocus === undefined ? {} : { autoFocus })}
    >
      <div className={styles.header}>
        <IconButton
          slot="previous"
          variant="ghost"
          size="sm"
          icon={ChevronLeftIcon}
          label={t.previousMonth}
        />
        <Heading className={classNames(styles.heading)} />
        <IconButton
          slot="next"
          variant="ghost"
          size="sm"
          icon={ChevronRightIcon}
          label={t.nextMonth}
        />
      </div>
      <CalendarGrid className={classNames(styles.grid)}>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className={classNames(styles.weekday)}>{day}</CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody>
          {(date) => (
            <CalendarCell date={date} className={classNames(styles.cell)}>
              {({ formattedDate }) => (
                <span
                  className={styles.day}
                  {...(isToday(date, getLocalTimeZone()) ? { 'data-today': true } : {})}
                >
                  {formattedDate}
                </span>
              )}
            </CalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </RACCalendar>
  );
}

/**
 * A month calendar (React Aria `Calendar`, an ARIA grid). The value is a `YYYY-MM-DD` string.
 * Months, weekday names and the first day of the week follow the `DSProvider` locale.
 *
 * Keys: arrows move by day and week, `PageUp` / `PageDown` by month, `Shift+PageUp` /
 * `Shift+PageDown` by year, `Home` / `End` to the start / end of the week, `Enter` / `Space`
 * select. Each day button is named with its full date ("Wednesday, October 28, 2026"); today is
 * ringed and named "Today".
 */
export function Calendar({ value, defaultValue, onChange, ...rest }: CalendarProps) {
  const controlled = value === undefined ? {} : { value: toCalendarDate(value) };
  const initial = defaultValue === undefined ? {} : { defaultValue: toCalendarDate(defaultValue) };
  return (
    <CalendarView
      {...rest}
      {...controlled}
      {...initial}
      onChange={(date: unknown) => {
        const iso = toISO(date as Parameters<typeof toISO>[0]);
        if (iso !== null) onChange?.(iso);
      }}
    />
  );
}
