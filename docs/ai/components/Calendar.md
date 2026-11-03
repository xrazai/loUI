# Calendar

> A month calendar (React Aria `Calendar`, an ARIA grid). The value is a `YYYY-MM-DD` string.
> Months, weekday names and the first day of the week follow the `DSProvider` locale.

Keys: arrows move by day and week, `PageUp` / `PageDown` by month, `Shift+PageUp` /
`Shift+PageDown` by year, `Home` / `End` to the start / end of the week, `Enter` / `Space`
select. Each day button is named with its full date ("Wednesday, October 28, 2026"); today is
ringed and named "Today".

`DatePicker` is a date field (typed segments) with a calendar popover and "Today" / "Clear" buttons. `Calendar` is the standalone month grid. Built on React Aria `DatePicker`, `DateInput`, `DateSegment`, `Calendar`, `CalendarGrid`, `CalendarCell`, `Popover`. Task: CMP-INP-02.

- Import: `import { Calendar } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/DatePicker/Calendar.tsx`
- Stories (Storybook title `Components/DatePicker`): Default, CalendarKeyboard, Open, PickDate, EscapeRestoresFocus, WithValue, MinAndMax, Required, Invalid, Disabled, ReadOnly, Brazilian, Sizes, StandaloneCalendar, FullWidthInRow

## Props

| Prop              | Type                                                     | Required | Default | Description                                                                                                                  |
| ----------------- | -------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `min`             | `string`                                                 |          |         | Earliest selectable date (`YYYY-MM-DD`). Earlier days are disabled.                                                          |
| `max`             | `string`                                                 |          |         | Latest selectable date (`YYYY-MM-DD`). Later days are disabled.                                                              |
| `isDisabled`      | `boolean`                                                |          |         | Disables the whole calendar: days cannot be focused or selected.                                                             |
| `isReadOnly`      | `boolean`                                                |          |         | The calendar can be navigated and focused but the value cannot change.                                                       |
| `autoFocus`       | `boolean`                                                |          |         | Moves focus into the grid on mount.                                                                                          |
| `className`       | `string`                                                 |          |         |                                                                                                                              |
| `messages`        | `Partial<{ previousMonth: string; nextMonth: string; }>` |          |         | Message overrides for this instance: `previousMonth`, `nextMonth`.                                                           |
| `ref`             | `Ref<HTMLDivElement>`                                    |          |         |                                                                                                                              |
| `aria-label`      | `string`                                                 |          |         | Accessible name of the calendar grid. Required unless `aria-labelledby` is given. Accessible name of the calendar grid.      |
| `aria-labelledby` | `string`                                                 |          |         | Id of the element that names the calendar. Required unless `aria-label` is given. Id of the element that names the calendar. |
| `value`           | `string \| null`                                         |          |         | The selected date as `YYYY-MM-DD`, or `null` for none. Pair with `onChange`.                                                 |
| `defaultValue`    | `string \| null`                                         |          |         | The initially selected date when uncontrolled.                                                                               |
| `onChange`        | `((value: string) => void)`                              |          |         | Called with the picked date as `YYYY-MM-DD`.                                                                                 |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Calendar: { ... } }}>`.

| Key            | English default | Notes                                                  |
| -------------- | --------------- | ------------------------------------------------------ |
| `today`        | `Today`         | Footer button that picks today's date.                 |
| `clear`        | `Clear`         | Footer button that empties the field.                  |
| `openCalendar` | `Open calendar` | Accessible name of the button that opens the calendar. |

## Design tokens used

`--ds-accent`, `--ds-calendar-cell-size`, `--ds-calendar-today-ring-width`, `--ds-calendar-weekday-height`, `--ds-field-control-padding-inline`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-sm`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-target-min`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-text-inverse`, `--ds-weight-medium`, `--ds-weight-semibold`, `--ds-z-dropdown`

## When to use

- A single calendar date: delivery, due date, birthday.
- `Calendar` alone for inline planners and for composing your own picker.

## When not to use

- A date range: not supported yet (range picker is P2).
- A time of day or a timestamp: the value has no time and no time zone.
- Dates years away from now: typing the segments is faster than the grid.

## Value contract

`value`, `defaultValue`, `onChange`, `min` and `max` are **ISO strings `YYYY-MM-DD`** (the `ISODate` type of `src/utils/date`), never `Date`. Conversion to React Aria's `CalendarDate` happens inside the component (`@internationalized/date`, see below), so the day cannot shift with the viewer's time zone. Invalid strings are treated as "no date". `onChange` receives a string only once every segment is filled, or `null` from the Clear button; an incomplete date is not reported. The form receives the ISO string under `name`.

## Props (key ones)

| Prop                                                                                                 | Notes                                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby`                                                           | One is required.                                                                                                                |
| `value` / `defaultValue` / `onChange`                                                                | ISO string or `null`.                                                                                                           |
| `min`, `max`                                                                                         | ISO strings. Outside days are disabled in the grid; typed dates outside are invalid. "Today" is disabled when today is outside. |
| `description`, `errorMessage`, `size`, `name`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly` | As in `Select`.                                                                                                                 |
| `fullWidth`                                                                                          | Take the free space of a flex row such as `Inline` (`flex: 1 1 auto`, can shrink). Off by default.                              |
| `messages`                                                                                           | `today`, `clear`, `openCalendar`, `previousMonth`, `nextMonth`, `requiredMark`.                                                 |

`Calendar` takes `value`, `defaultValue`, `onChange(iso)`, `min`, `max`, `isDisabled`, `isReadOnly`, `autoFocus`, `messages`, and requires `aria-label` or `aria-labelledby`.

## Locale

Segment order and separators, placeholders (`dd/mm/aaaa`), month names, weekday letters and the first day of the week come from the `DSProvider` locale through React Aria; there are no hard-coded names. Only the button texts are in the message catalog (`Calendar` key for the month buttons, `DatePicker` for the rest).

## Accessibility and keyboard

| Key (calendar grid)               | Behavior                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| Arrows                            | Previous / next day, previous / next week                     |
| `PageUp` / `PageDown`             | Previous / next month                                         |
| `Shift+PageUp` / `Shift+PageDown` | Previous / next year                                          |
| `Home` / `End`                    | First / last day of the **month** (React Aria; APG says week) |
| `Enter` / `Space`                 | Select the focused day                                        |
| `Escape`                          | Close the popover, focus returns to the button                |

In the field: digits fill the segment and move to the next; arrows change a segment's value; `Backspace` clears a segment; `Tab` moves between segments. Each day is named with its full date ("Wednesday, October 28, 2026", "Today, ..."), so the grid is usable without sight. Today has a ring (`--ds-text-3`), the selected day an accent fill with `--ds-text-inverse`; disabled days are dimmed and `aria-disabled`.

## Content rules

Label with the date's role ("Delivery date"). Errors say how to fix: "Choose a date after today."

## Example

```tsx
<DatePicker
  label="Delivery date"
  name="delivery"
  min="2026-10-30"
  value={date}
  onChange={setDate}
/>
```

## Dependency note

The component imports `@internationalized/date`, which React Aria already depends on. It is not a direct dependency of this package yet, so under pnpm's strict layout it must be added to `package.json` (`pnpm add @internationalized/date@^3.12.4`, already in the lockfile as a transitive dependency).

## Related components

- Renders: IconButton
