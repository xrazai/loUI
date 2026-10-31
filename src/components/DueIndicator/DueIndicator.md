# DueIndicator

Status: experimental

A due date with a status in words and a tone dot: "Mar 9 Overdue by 3 days", "Due today", "Due in 5 days", "Paid". Color reinforces the status; the text always states it.

- Handoff source: `components/erp/DueIndicator.jsx` (TODO `CMP-PAT-07`).

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

## Props

| Prop        | Type                     | Default       | Notes                                                |
| ----------- | ------------------------ | ------------- | ---------------------------------------------------- |
| `date`      | `ISODate`                | required      | `YYYY-MM-DD`. Malformed values throw in development. |
| `today`     | `ISODate`                | local day now | Inject for tests, stories and deterministic output.  |
| `paid`      | `boolean`                | `false`       | Shows "Paid" in the success tone, ignoring the date. |
| `showDate`  | `boolean`                | `true`        | Shows the formatted date before the status.          |
| `dateStyle` | `DateStyle`              | `'monthDay'`  | Any `formatDate` style.                              |
| `messages`  | `{ overdue, due, paid }` | none          | Overrides the texts for this instance.               |

Tone comes from `dueStatus`: overdue is `danger`, 0 to 7 days `warning`, later `neutral`.

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

## Differences from the handoff

- `dueInfo` left the component: urgency is the tested `dueStatus` utility and day arithmetic is `daysBetween` (UTC calendar math, no `T12:00:00` trick), so daylight-saving changes never shift the count. Component tests cover US and EU transitions and a leap day.
- Month names are no longer a table: dates come from `formatDate`; wording and plurals come from messages (`en`, `pt-BR`) and `formatRelativeDays`.
- Texts are English by default ("Overdue by 3 days"), not hard-coded Portuguese; `paidText` is now the `paid` message.
- `today` stays injectable; the default is the local day of the system clock. Colors and sizes are tokens.
