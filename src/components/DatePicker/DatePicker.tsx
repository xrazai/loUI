import type { CalendarDate } from '@internationalized/date';
import { useContext } from 'react';
import type { ReactNode, Ref } from 'react';
import {
  Button,
  DateInput,
  DatePicker as RACDatePicker,
  DatePickerStateContext,
  DateSegment,
  Dialog,
  Group,
  Popover,
} from 'react-aria-components';
import type { DatePickerProps as RACDatePickerProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import type { ISODate } from '../../utils/date';
import { FieldMessages, Label } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Button as DSButton } from '../Button';
import { Icon } from '../Icon';
import { CalendarIcon } from '../Icon/icons';
import { CalendarView } from './Calendar';
import type { CalendarMessages } from './Calendar';
import { messages } from './DatePicker.messages';
import styles from './DatePicker.module.css';
import { toCalendarDate, toISO, todayDate } from './dates';

export type DatePickerSize = 'sm' | 'md' | 'lg';

export type DatePickerMessages = Partial<
  typeof messages.en & typeof fieldMessages.en & CalendarMessages
>;

interface DatePickerBaseProps extends Omit<
  RACDatePickerProps<CalendarDate>,
  | 'children'
  | 'className'
  | 'style'
  | 'render'
  | 'aria-label'
  | 'aria-labelledby'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'minValue'
  | 'maxValue'
  | 'placeholderValue'
  | 'granularity'
  | 'hideTimeZone'
  | 'hourCycle'
  | 'shouldForceLeadingZeros'
  | 'isDateUnavailable'
  | 'defaultOpen'
> {
  /** The date as `YYYY-MM-DD` (no time zone), or `null` for none. Pair with `onChange`. */
  value?: ISODate | null | undefined;
  /** The initial date when uncontrolled. */
  defaultValue?: ISODate | null | undefined;
  /** Called with the new date as `YYYY-MM-DD` once every segment is filled, or `null` from the Clear button. An incomplete date is not reported. */
  onChange?: ((value: ISODate | null) => void) | undefined;
  /** Earliest selectable date (`YYYY-MM-DD`). Typing an earlier date makes the field invalid. */
  min?: ISODate | undefined;
  /** Latest selectable date (`YYYY-MM-DD`). */
  max?: ISODate | undefined;
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: DatePickerSize | undefined;
  /**
   * Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink
   * below its content width. Off by default. In a block context the field already spans the width.
   */
  fullWidth?: boolean | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the popover that holds the calendar. */
  popoverClassName?: string | undefined;
  /** Message overrides for this instance: `today`, `clear`, `openCalendar`, `previousMonth`, `nextMonth`, `requiredMark`. */
  messages?: DatePickerMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type DatePickerProps = DatePickerBaseProps & FieldLabelingProps;

function Footer({
  min,
  max,
  labels,
  isReadOnly,
}: {
  min: ISODate | undefined;
  max: ISODate | undefined;
  labels: { today: string; clear: string };
  isReadOnly: boolean;
}) {
  const state = useContext(DatePickerStateContext);
  const todayISO = todayDate().toString();
  const todayInRange =
    (min === undefined || todayISO >= min) && (max === undefined || todayISO <= max);
  return (
    <div className={styles.footer}>
      <DSButton
        variant="ghost"
        size="sm"
        isDisabled={!todayInRange || isReadOnly}
        onPress={() => {
          state?.setValue(todayDate());
          state?.close();
        }}
      >
        {labels.today}
      </DSButton>
      <DSButton
        variant="ghost"
        size="sm"
        isDisabled={state?.value == null || isReadOnly}
        onPress={() => {
          state?.setValue(null);
          state?.close();
        }}
      >
        {labels.clear}
      </DSButton>
    </div>
  );
}

/**
 * A date field with a calendar popover (React Aria `DatePicker`). The value is a
 * `YYYY-MM-DD` string (no time zone, so the day never shifts); the typed segments, the
 * placeholder, month and weekday names and the first day of the week all follow the
 * `DSProvider` locale. Type the date (arrows or digits per segment) or open the calendar;
 * "Today" and "Clear" sit under the grid.
 *
 * The form receives the ISO date under `name`. Range selection is not part of this component.
 */
export function DatePicker({
  label,
  description,
  errorMessage,
  value,
  defaultValue,
  onChange,
  min,
  max,
  size = 'md',
  fullWidth = false,
  className,
  popoverClassName,
  messages: messageOverrides,
  ref,
  ...rest
}: DatePickerProps) {
  warnMissingName('DatePicker', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('DatePicker', messages, messageOverrides);
  const minValue = toCalendarDate(min);
  const maxValue = toCalendarDate(max);
  return (
    <RACDatePicker
      {...rest}
      ref={ref}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={classNames(fieldStyles.root, styles.field, className)}
      {...(value === undefined ? {} : { value: toCalendarDate(value) })}
      {...(defaultValue === undefined ? {} : { defaultValue: toCalendarDate(defaultValue) })}
      {...(minValue ? { minValue } : {})}
      {...(maxValue ? { maxValue } : {})}
      onChange={(date) => {
        onChange?.(toISO(date));
      }}
    >
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <Group className={classNames(fieldStyles.control, fieldStyles.row, styles.group)}>
        <DateInput className={classNames(styles.input)}>
          {(segment) => <DateSegment segment={segment} className={classNames(styles.segment)} />}
        </DateInput>
        <Button aria-label={t.openCalendar} className={classNames(styles.trigger)}>
          <Icon icon={CalendarIcon} size="sm" />
        </Button>
      </Group>
      <FieldMessages description={description} errorMessage={errorMessage} />
      {/* RAC writes an inline z-index of 100000; the style prop is the only way to put the popover on the dropdown layer. */}
      <Popover
        className={classNames(styles.popover, popoverClassName)}
        style={{ zIndex: 'var(--ds-z-dropdown)' }}
      >
        <Dialog className={classNames(styles.dialog)}>
          <CalendarView min={min} max={max} messages={messageOverrides} />
          <Footer
            min={min}
            max={max}
            isReadOnly={rest.isReadOnly === true}
            labels={{ today: t.today, clear: t.clear }}
          />
        </Dialog>
      </Popover>
    </RACDatePicker>
  );
}
