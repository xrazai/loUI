# DueIndicator

> A due date with a status in words: "Mar 9 Overdue by 3 days", "Due today", "Due in 5 days",
> "Paid". A dot and the text color follow the tone (`danger` overdue, `warning` within a week,
> `neutral` later, `success` paid), but the status is always text, never color alone.

The urgency comes from `dueStatus`, the wording from messages and `Intl` (`formatRelativeDays`),
the date from `formatDate`. Day arithmetic is calendar-based, so daylight-saving changes never
shift the count.

A due date with a status in words and a tone dot: "Mar 9 Overdue by 3 days", "Due today", "Due in 5 days", "Paid". Color reinforces the status; the text always states it.

- Handoff source: `components/erp/DueIndicator.jsx` (TODO `CMP-PAT-07`).

- Import: `import { DueIndicator } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/DueIndicator/DueIndicator.tsx`
- Stories (Storybook title `Components/DueIndicator`): Default, Overdue, DueToday, DueTomorrow, Later, Paid, WithoutDate, LongDate, AcrossDaylightSaving, AllTones, Portuguese, RightToLeft

## Props

| Prop        | Type                                                                                               | Required | Default      | Description                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `date`      | `string`                                                                                           | yes      |              | The due date as `YYYY-MM-DD` (`ISODate`). Invalid values throw in development.                                                                                              |
| `today`     | `string`                                                                                           |          |              | The current day as `YYYY-MM-DD`. Defaults to the user's local day at render time. Pass it to make output deterministic (tests, stories, server rendering with a known day). |
| `paid`      | `boolean`                                                                                          |          | `false`      | The item is settled: shows "Paid" in the success tone, whatever the date.                                                                                                   |
| `showDate`  | `boolean`                                                                                          |          | `true`       | Shows the formatted date before the status. Default `true`.                                                                                                                 |
| `dateStyle` | `'short' \| 'medium' \| 'long' \| 'full' \| 'monthDay' \| 'monthYear'`                             |          | `'monthDay'` | Format of the date (`formatDate` styles). Default `monthDay` ("Mar 9").                                                                                                     |
| `messages`  | `Partial<{ overdue: (days: number) => string; due: (relative: string) => string; paid: string; }>` |          |              | Message overrides for this instance.                                                                                                                                        |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ DueIndicator: { ... } }}>`.

| Key                     | English default     | Notes                                                                                                                                   |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `overdue(days: number)` | `Overdue by 2 days` | Status of a date in the past. `days` is a positive whole number.                                                                        |
| `due(relative: string)` | `Due {relative}`    | Status of a date today or later. `relative` is the locale's relative time from `formatRelativeDays` ("today", "tomorrow", "in 3 days"). |
| `paid`                  | `Paid`              | Status of a settled item: the due date no longer matters.                                                                               |

## Design tokens used

`--ds-danger`, `--ds-due-indicator-dot-size`, `--ds-due-indicator-gap`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-label`, `--ds-lh-label`, `--ds-radius-pill`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

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

// Deterministic output
<DueIndicator date="2026-03-14" today="2026-03-10" dateStyle="long" />
```

## Related components

- Instead, see Badge: A workflow status that is not date-driven: use `Badge`.
