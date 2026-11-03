# DatePicker and Calendar

`DatePicker` is a date field (typed segments) with a calendar popover and "Today" / "Clear" buttons. `Calendar` is the standalone month grid. Built on React Aria `DatePicker`, `DateInput`, `DateSegment`, `Calendar`, `CalendarGrid`, `CalendarCell`, `Popover`. Task: CMP-INP-02.

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

## Differences from the handoff

- Typed segments with locale-aware placeholders instead of a button showing a `toLocaleDateString` string; calendar is an ARIA grid with full keyboard navigation (the handoff used plain buttons).
- Month and weekday names come from `Intl` through the locale, not hard-coded Portuguese arrays; the week start follows the locale.
- Day buttons have full-date names; `min` / `max` are enforced for typing too; today is a ring, the footer buttons ("Today", "Clear") come from messages.
- `Date` objects and `T12:00:00` tricks are gone; the value is an ISO string end to end.
