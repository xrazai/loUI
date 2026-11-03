# LedgerList

Status: experimental

A list of signed entries: date, title, optional sub line, a signed amount and an optional running balance, with an optional delete button per row. The sign is shown as text and color. Import it from `loui-ds/patterns`.

- Handoff source: `components/erp/LedgerList.jsx` (TODO `CMP-PAT-12`).

## When to use

- A short history of changes to a balance or a quantity: account activity, wallet movements, stock adjustments.
- When the running balance after each entry matters.

## When not to use

- Large, sortable or filterable data: use `DataTable`.
- A feed of events with no amounts: use a plain list.

## Anatomy

```
ul aria-label
  li[data-direction=positive|negative|zero]
    time[datetime]                 formatDate(date, locale, dateStyle)
    title · sub
    amount                         "+" | "−" text sign + number   (color by negativeTone)
    balance                        "Balance $125.00"              (optional)
    button "Delete entry …"        (only with onDelete)
```

## Props

| Prop           | Type                                              | Default      | Notes                                                                             |
| -------------- | ------------------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| `entries`      | `LedgerEntry[]`                                   | required     | `{ id, date, title, sub?, delta, balance? }`; `delta` and `balance` are integers. |
| `currency`     | `string`                                          | none         | ISO 4217 code: amounts are minor units formatted with `formatCurrency`.           |
| `format`       | `(value: number) => string`                       | none         | Custom formatter; wins over `currency`. Amounts are passed as absolute values.    |
| `negativeTone` | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'danger'`   | Color of negative amounts; the minus sign is always shown.                        |
| `dateStyle`    | `DateStyle`                                       | `'monthDay'` | Any `formatDate` style.                                                           |
| `onDelete`     | `(entry) => void`                                 | none         | Adds a delete button to each row.                                                 |
| `messages`     | `{ balance, deleteEntry }`                        | none         | Overrides the texts for this instance.                                            |

With neither `currency` nor `format`, numbers are formatted for the locale (plain quantities).

## Accessibility

- A `ul` of `li`; the list should be named with `aria-label` or `aria-labelledby`.
- The sign is text (`+` or the minus sign U+2212), so meaning never depends on color. Positive amounts use ink, negative ones the chosen tone, zero uses secondary text.
- Dates are `<time datetime>`. The balance is labelled by text ("Balance $125.00"), not by position.
- Delete buttons are `IconButton`s named "Delete entry {title}" (one per row, distinguishable); they are 32px.
- Deleting must ask for confirmation (AGENTS.md): do it in `onDelete` with a dialog or inline confirmation, then offer Undo.
- Text truncates with an ellipsis; long titles do not push the amounts out.

## Content rules

- Titles say what happened in sentence case ("Payment received"); the sub line holds the reference.
- Amounts are integers in minor units (ADR-0006); never pre-format them.

## Examples

```tsx
import { LedgerList } from 'loui-ds/patterns';

<LedgerList
  aria-label="Account activity"
  currency="USD"
  entries={[
    { id: '2', date: '2026-03-12', title: 'Payment received', delta: 5000, balance: 15000 },
    { id: '1', date: '2026-03-01', title: 'Service fee', delta: -1000, balance: 10000 },
  ]}
  onDelete={askToDelete}
/>;
```

## Differences from the handoff

- A `div` of `div`s becomes a `ul` / `li` list; dates are `time` elements formatted with `formatDate` (the handoff printed a raw string).
- Amounts go through `Intl` (`formatCurrency` or `formatNumber`) from minor units, or a `format` prop; there is no hand-built number formatting.
- "saldo" and "Excluir lançamento" were hard-coded Portuguese; they are messages (`en`, `pt-BR`), and the delete label includes the entry title.
- `negativeTone` defaults to `danger` (the handoff defaulted to `success`, which is product specific) and takes `neutral | success | warning | danger`.
- The delete button is the shared `IconButton` (focus ring, 32px target) instead of a styled `×` glyph; layout values are tokens (`--ds-ledger-list-*`).
