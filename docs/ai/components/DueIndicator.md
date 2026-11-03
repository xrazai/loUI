# DueIndicator

> A due date with a status in words: "Mar 9 Overdue by 3 days", "Due today", "Due in 5 days",
> "Paid", "Paid Oct 30". A dot and the text color follow the tone (`danger` overdue, `warning`
> within a week, `neutral` later, `success` paid), but the status is always text, never color
> alone. Pass `label` + `tone` instead of `date` for free-text chips ("Pickup at 2 pm").

The urgency comes from `dueStatus`, the wording from messages and `Intl` (`formatRelativeDays`),
the date from `formatDate`. Day arithmetic is calendar-based, so daylight-saving changes never
shift the count.

A due date with a status in words and a tone dot: "Mar 9 Overdue by 3 days", "Due today", "Due in 5 days", "Paid", "Paid Oct 30". Color reinforces the status; the text always states it.

- Handoff source: `components/erp/DueIndicator.jsx` (TODO `CMP-PAT-07`).

- Import: `import { DueIndicator } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/DueIndicator/DueIndicator.tsx`
- Stories (Storybook title `Components/DueIndicator`): Default, Overdue, DueToday, DueTomorrow, Later, Paid, PaidWithDate, DateObject, DateTimeString, LabelAndTone, WithoutDate, LongDate, AcrossDaylightSaving, AllTones, Portuguese, RightToLeft

## Props

| Prop        | Type                                                                                                                                 | Required | Default | Description                                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `date`      | `DueDateInput`                                                                                                                       |          |         | The due date: `YYYY-MM-DD` (`ISODate`, never shifted by a time zone), a `Date` or an ISO date-time string (`2026-10-31T23:30:00-03:00`). A `Date` or date-time maps to the **local** calendar day of the viewer. Invalid values throw in development. |
| `today`     | `DueDateInput`                                                                                                                       |          |         | The current day, same accepted forms as `date`. Defaults to the user's local day at render time. Pass it to make output deterministic (tests, stories, server rendering).                                                                             |
| `paid`      | `boolean`                                                                                                                            |          |         | The item is settled: shows "Paid" in the success tone, whatever the date.                                                                                                                                                                             |
| `paidDate`  | `DueDateInput`                                                                                                                       |          |         | The day the item was paid (same forms as `date`). Implies `paid` and shows "Paid Oct 30" from the `paidOn` message, formatted with `dateStyle`.                                                                                                       |
| `showDate`  | `boolean`                                                                                                                            |          |         | Shows the formatted date before the status. Default `true`.                                                                                                                                                                                           |
| `dateStyle` | `'short' \| 'medium' \| 'long' \| 'full' \| 'monthDay' \| 'monthYear'`                                                               |          |         | Format of the date (`formatDate` styles). Default `monthDay` ("Mar 9").                                                                                                                                                                               |
| `label`     | `string`                                                                                                                             |          |         | The status text ("Pickup at 2 pm"). It carries the meaning; the tone only reinforces it.                                                                                                                                                              |
| `tone`      | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'`                                                                        |          |         | Tone of the dot and the text.                                                                                                                                                                                                                         |
| `messages`  | `Partial<{ overdue: (days: number) => string; due: (relative: string) => string; paid: string; paidOn: (date: string) => string; }>` |          |         | Message overrides for this instance.                                                                                                                                                                                                                  |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `tone`: `neutral`, `accent`, `success`, `warning`, `danger`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ DueIndicator: { ... } }}>`.

| Key                     | English default     | Notes                                                                                                                                                                      |
| ----------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overdue(days: number)` | `Overdue by 2 days` | Status of a date in the past. `days` is a positive whole number.                                                                                                           |
| `due(relative: string)` | `Due {relative}`    | Status of a date today or later. `relative` is the locale's relative time from `formatRelativeDays` ("today", "tomorrow", "in 3 days").                                    |
| `paid`                  | `Paid`              | Status of a settled item: the due date no longer matters.                                                                                                                  |
| `paidOn(date: string)`  | `Paid {date}`       | Status of an item paid on a known day. `date` is already formatted for the locale ("Oct 30"). Word it without grammatical gender so it fits any item ("Paid", not "Paga"). |

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-due-indicator-dot-size`, `--ds-due-indicator-gap`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-label`, `--ds-lh-label`, `--ds-radius-pill`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

## When to use

- A deadline in a list row, a card or a detail header (invoice due, task due, renewal).
- When urgency should be readable at a glance without relying on color.

## When not to use

- A timestamp of something that already happened: format it with `formatDate` / `formatRelativeDays`.
- A workflow status that is not date-driven: use `Badge`.

## Anatomy

```
span[data-tone=danger|warning|neutral|success]
  span.dot          (aria-hidden)
  time[datetime]    formatDate(date, locale, dateStyle)     (showDate)
  span.status       "Overdue by 3 days" | "Due today" | "Due in 5 days" | "Paid"
```

## Time zones

- `YYYY-MM-DD` is a calendar day with no time zone and takes a fast path: it is used as written and never shifted.
- A `Date` or an ISO date-time string (`2026-10-31T23:30:00-03:00`, `2026-10-31T23:30:00Z`) is an instant. It is converted to the **viewer's local calendar day** with `toISODate`, so `2026-11-01T01:30:00Z` is Oct 31 in Sao Paulo and Nov 1 in Berlin. A date-time without an offset is read as local time.
- Only strings that contain a time part (`YYYY-MM-DDTHH...` or `YYYY-MM-DD HH...`) are parsed with `new Date()`. If the due day must not depend on the viewer, send `YYYY-MM-DD`.
- `today` follows the same rules. Unparsable date-times and malformed dates throw in development.

## Free-text form

For chips whose text is not date-driven ("Due today", "Pickup at 2 pm", "Waiting for you"), pass `label` and `tone`. It renders the same dot and text; no date is shown and no wording is generated, so translate `label` yourself.

```tsx
<DueIndicator label="Pickup at 2 pm" tone="neutral" />
<DueIndicator label="Waiting for you" tone="accent" />
```

## Paid date and locales

`paidDate` calls the `paidOn(date)` message with the date already formatted by `formatDate` for the active locale. The default is `Paid ${date}` (en) and `Pagamento em ${date}` (pt-BR), which avoids gendered agreement ("Paga em" / "Pago em" would have to match the item). Override it per instance (`messages`), per provider or in a locale catalog:

```tsx
<DueIndicator
  date="2026-03-01"
  paidDate="2026-03-08"
  messages={{ paidOn: (date) => `Settled on ${date}` }}
/>
```

## Accessibility

- The status is text (`Overdue by 3 days`), so color is never the only signal; the dot is `aria-hidden`.
- The date is a `<time datetime>` element.
- Contrast: the status uses `--ds-danger`, `--ds-warning`, `--ds-success` or `--ds-text-2` on the page background, all above 4.5:1.
- Forced colors: the dot and the text fall back to `CanvasText`.

## Content rules

- "Overdue by 3 days", "Due today", "Due tomorrow", "Due in 5 days", "Paid". Sentence case, no exclamation marks.
- Dates and relative wording come from `Intl` for the active locale; never build them by hand.

## Examples

```tsx
<DueIndicator date={invoice.dueISO} paid={invoice.paid} />

// A Date or date-time maps to the local calendar day
<DueIndicator date={order.dueAt} paidDate={order.paidAt} />

// Deterministic output
<DueIndicator date="2026-03-14" today="2026-03-10" dateStyle="long" />
```

## Related components

- Instead, see Badge: A workflow status that is not date-driven: use `Badge`.
