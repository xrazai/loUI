# DueIndicator

Status: experimental

A due date with a status in words and a tone dot: "Mar 9 Overdue by 3 days", "Due today", "Due in 5 days", "Paid", "Paid Oct 30". Color reinforces the status; the text always states it.

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

Two forms, enforced by a discriminated union: pass `date`, or pass `label` + `tone`.

| Prop        | Type                                                          | Default       | Notes                                                                                      |
| ----------- | ------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `date`      | `ISODate \| Date \| string`                                   | required      | `YYYY-MM-DD`, a `Date`, or an ISO date-time string. Malformed values throw in development. |
| `today`     | `ISODate \| Date \| string`                                   | local day now | Same forms as `date`. Inject for tests, stories and deterministic output.                  |
| `paid`      | `boolean`                                                     | `false`       | Shows "Paid" in the success tone, ignoring the date.                                       |
| `paidDate`  | `ISODate \| Date \| string`                                   | none          | Implies `paid` and shows "Paid Oct 30" (`paidOn` message, formatted with `dateStyle`).     |
| `showDate`  | `boolean`                                                     | `true`        | Shows the formatted due date before the status.                                            |
| `dateStyle` | `DateStyle`                                                   | `'monthDay'`  | Any `formatDate` style; also used for `paidDate`.                                          |
| `label`     | `string`                                                      | none          | Free-text form: the status text. Requires `tone`; excludes `date`.                         |
| `tone`      | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | none          | Free-text form only. In the date form the tone is computed.                                |
| `messages`  | `{ overdue, due, paid, paidOn }`                              | none          | Overrides the texts for this instance.                                                     |

Tone in the date form comes from `dueStatus`: overdue is `danger`, 0 to 7 days `warning`, later `neutral`.

`paidDate` is a separate prop instead of widening `paid` to `boolean | date`: `paid` stays a plain flag, and "paid, date unknown" and "paid on Oct 30" read differently at the call site.

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

## Differences from the handoff

- `dueInfo` left the component: urgency is the tested `dueStatus` utility and day arithmetic is `daysBetween` (UTC calendar math, no `T12:00:00` trick), so daylight-saving changes never shift the count. Component tests cover US and EU transitions and a leap day.
- Month names are no longer a table: dates come from `formatDate`; wording and plurals come from messages (`en`, `pt-BR`) and `formatRelativeDays`.
- Texts are English by default ("Overdue by 3 days"), not hard-coded Portuguese; `paidText` is now the `paid` message.
- `today` stays injectable; the default is the local day of the system clock. Colors and sizes are tokens.
