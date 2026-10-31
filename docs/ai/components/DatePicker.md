# DatePicker

> A date field with a calendar popover (React Aria `DatePicker`). The value is a
> `YYYY-MM-DD` string (no time zone, so the day never shifts); the typed segments, the
> placeholder, month and weekday names and the first day of the week all follow the
> `DSProvider` locale. Type the date (arrows or digits per segment) or open the calendar;
> "Today" and "Clear" sit under the grid.

The form receives the ISO date under `name`. Range selection is not part of this component.

`DatePicker` is a date field (typed segments) with a calendar popover and "Today" / "Clear" buttons. `Calendar` is the standalone month grid. Built on React Aria `DatePicker`, `DateInput`, `DateSegment`, `Calendar`, `CalendarGrid`, `CalendarCell`, `Popover`. Task: CMP-INP-02.

- Import: `import { DatePicker } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/DatePicker/DatePicker.tsx`
- Stories (Storybook title `Components/DatePicker`): Default, CalendarKeyboard, EscapeRestoresFocus, WithValue, MinAndMax, Required, Invalid, Disabled, ReadOnly, Brazilian, Sizes, StandaloneCalendar

## Props

| Prop               | Type                                                                                                                                                    | Required | Default | Description                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `string \| null`                                                                                                                                        |          |         | The date as `YYYY-MM-DD` (no time zone), or `null` for none. Pair with `onChange`.                                                          |
| `defaultValue`     | `string \| null`                                                                                                                                        |          |         | The initial date when uncontrolled.                                                                                                         |
| `onChange`         | `((value: string \| null) => void)`                                                                                                                     |          |         | Called with the new date as `YYYY-MM-DD` once every segment is filled, or `null` from the Clear button. An incomplete date is not reported. |
| `min`              | `string`                                                                                                                                                |          |         | Earliest selectable date (`YYYY-MM-DD`). Typing an earlier date makes the field invalid.                                                    |
| `max`              | `string`                                                                                                                                                |          |         | Latest selectable date (`YYYY-MM-DD`).                                                                                                      |
| `description`      | `ReactNode`                                                                                                                                             |          |         | Helper text under the control. Linked with `aria-describedby`.                                                                              |
| `errorMessage`     | `FieldErrorMessage`                                                                                                                                     |          |         | Error text, shown while the field is invalid and the error is displayed. See `Input`.                                                       |
| `size`             | `'sm' \| 'md' \| 'lg'`                                                                                                                                  |          | `'md'`  | Control height: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                  |
| `className`        | `string`                                                                                                                                                |          |         | Class name for the field root.                                                                                                              |
| `popoverClassName` | `string`                                                                                                                                                |          |         | Class name for the popover that holds the calendar.                                                                                         |
| `messages`         | `Partial<{ today: string; clear: string; openCalendar: string; } & { requiredMark: string; } & Partial<{ previousMonth: string; nextMonth: string; }>>` |          |         | Message overrides for this instance: `today`, `clear`, `openCalendar`, `previousMonth`, `nextMonth`, `requiredMark`.                        |
| `ref`              | `Ref<HTMLDivElement>`                                                                                                                                   |          |         | Ref to the field root `<div>`.                                                                                                              |
| `label`            | `ReactNode`                                                                                                                                             |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                         |
| `aria-label`       | `string`                                                                                                                                                |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                     |
| `aria-labelledby`  | `string`                                                                                                                                                |          |         | Id of the element that names the field.                                                                                                     |

### Inherited props

- From `AriaDatePickerProps` (react-aria): `autoComplete`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `DatePickerBase` (react-stately): `firstDayOfWeek`, `pageBehavior`
- From `DatePickerStateOptions` (react-stately): `shouldCloseOnSelect`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `OverlayTriggerProps` (react-stately): `isOpen`, `onOpenChange`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ DatePicker: { ... } }}>`.

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

- Renders: Button, FieldMessages, Icon, Label
