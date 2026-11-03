# LedgerList

Status: stable

A list of signed entries: date, title, optional sub line, a signed amount and an optional running balance, with optional edit and delete buttons per row. Rows can be fixed (no buttons) and the date is optional. The sign is shown as text and color. Import it from `loui-ds/patterns`.

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
    time[datetime]                 formatDate(date, locale, dateStyle)   (only when the entry has a date)
    title · sub
    amount                         "+" | "−" text sign + number   (color by negativeTone)
    balance                        "Balance $125.00"              (optional)
    button "Edit entry …"          (only with onEdit and isEditable !== false)
    button "Delete entry …"        (only with onDelete and isDeletable !== false)
```

## Props

| Prop           | Type                                              | Default      | Notes                                                                                                         |
| -------------- | ------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `entries`      | `LedgerEntry[]`                                   | required     | `{ id, date?, title, sub?, delta, balance?, isEditable?, isDeletable? }`; `delta` and `balance` are integers. |
| `currency`     | `string`                                          | none         | ISO 4217 code: amounts are minor units formatted with `formatCurrency`.                                       |
| `format`       | `(value: number) => string`                       | none         | Custom formatter; wins over `currency`. Amounts are passed as absolute values.                                |
| `negativeTone` | `'neutral' \| 'success' \| 'warning' \| 'danger'` | `'danger'`   | Color of negative amounts; the minus sign is always shown.                                                    |
| `dateStyle`    | `DateStyle`                                       | `'monthDay'` | Any `formatDate` style.                                                                                       |
| `onEdit`       | `(entry) => void`                                 | none         | Adds an edit button (pencil) before the delete button of each editable row (see below).                       |
| `onDelete`     | `(entry) => void`                                 | none         | Adds a delete button to each deletable row (see below).                                                       |
| `messages`     | `{ balance, editEntry, deleteEntry }`             | none         | Overrides the texts for this instance.                                                                        |

With neither `currency` nor `format`, numbers are formatted for the locale (plain quantities).

### Entry fields added for mixed lists

| Field         | Type      | Default | Notes                                                                     |
| ------------- | --------- | ------- | ------------------------------------------------------------------------- |
| `date`        | `ISODate` | none    | Optional. Without it the row renders no `time` element.                   |
| `isEditable`  | `boolean` | `true`  | `false` renders no edit button on that row. Ignored without `onEdit`.     |
| `isDeletable` | `boolean` | `true`  | `false` renders no delete button on that row. Ignored without `onDelete`. |

### Mixed deletable and fixed rows

Pass `onDelete` and set `isDeletable: false` on the entries that must stay (an opening balance, a system adjustment). Those rows render no button at all, so there is nothing to focus or announce on them, and the delete column is still reserved so their amounts align with the rows above and below. Omitting `isDeletable` keeps the previous behavior: every row is deletable when `onDelete` is set.

### Editing entries

Pass `onEdit` to add an "Edit entry {title}" button (pencil icon) before the delete button of every row, or only of rows that are not `isEditable: false`. The buttons share one fixed actions column (one or two 32px buttons, depending on which handlers the list has), so amounts stay aligned between rows with both, one or no button. The component only calls `onEdit(entry)`; the editing UI belongs to the consumer, either way:

- **Sheet.** Keep the entry in state and open a controlled `Sheet` with a `CurrencyInput` (see the `EditInSheet` story). When the sheet closes, the overlay restores focus to the edit button that opened it; do not move focus yourself.
- **Inline.** Reveal a field (a `CurrencyInput`) in place of or under the row (see `EditInline`), move focus into it, save on `Enter` and return focus to the edit button after saving or cancelling with `Escape`.

Saving should show a "Saved"-style toast or inline confirmation; editing is reversible, so there is no confirmation dialog.

### Entries without a date

- If at least one entry has a date, the date column is kept: dated rows show it and undated rows leave it empty, so titles and amounts stay in the same columns.
- If no entry has a date, the column is dropped and titles start at the left edge.
- Reading order is unchanged: title, sub line, amount, balance, delete button; the date comes first only on rows that have one.

## Accessibility

- A `ul` of `li`; the list should be named with `aria-label` or `aria-labelledby`.
- The sign is text (`+` or the minus sign U+2212), so meaning never depends on color. Positive amounts use ink, negative ones the chosen tone, zero uses secondary text.
- Dates are `<time datetime>`. The balance is labelled by text ("Balance $125.00"), not by position.
- Edit buttons are `IconButton`s named "Edit entry {title}" and come before the delete button in the tab order. Rows with `isEditable: false` have none.
- Delete buttons are `IconButton`s named "Delete entry {title}" (one per deletable row, distinguishable); they are 32px. Rows with `isDeletable: false` have no button, so they are skipped by `Tab`.
- The component only calls `onDelete(entry)`; it never removes anything or asks for confirmation (AGENTS.md section 5.5). The consumer opens a confirmation dialog (title "Delete X?", the consequence, a danger button naming the action, initial focus on Cancel) in `onDelete`, removes the entry on confirm and then shows a toast with Undo.
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

A drawer that mixes a fixed opening balance with deletable payments, where `askToDelete` opens the confirmation dialog:

```tsx
<LedgerList
  aria-label="Account activity"
  currency="USD"
  entries={[
    { id: '2', date: '2026-03-12', title: 'Payment received', delta: 5000, balance: 15000 },
    { id: '1', title: 'Opening balance', delta: 10000, balance: 10000, isDeletable: false },
  ]}
  onDelete={askToDelete}
/>
```

## Differences from the handoff

- A `div` of `div`s becomes a `ul` / `li` list; dates are `time` elements formatted with `formatDate` (the handoff printed a raw string).
- Amounts go through `Intl` (`formatCurrency` or `formatNumber`) from minor units, or a `format` prop; there is no hand-built number formatting.
- "saldo" and "Excluir lançamento" were hard-coded Portuguese; they are messages (`en`, `pt-BR`), and the delete label includes the entry title.
- `negativeTone` defaults to `danger` (the handoff defaulted to `success`, which is product specific) and takes `neutral | success | warning | danger`.
- The edit and delete buttons are the shared `IconButton` (focus ring, 32px target) instead of a styled `×` glyph; layout values are tokens (`--ds-ledger-list-*`).

## Narrow containers

The list is a size container. At 480 px or less the date moves under the title as a meta line, the padding shrinks and the amount, balance and actions columns stay fixed, so titles keep a readable width. The DOM and reading order do not change.
