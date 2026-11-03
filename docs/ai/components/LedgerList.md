# LedgerList

> A list of signed ledger entries: date, title, optional sub line, a signed amount and an
> optional running balance. The sign is text (`+` / `−`) as well as color. Built as a `ul`.

Amounts are integers in minor units (ADR-0006) formatted with `Intl`: pass `currency` for
money, `format` for anything else, or neither for plain quantities.

Import it from `@loui/ds/patterns`.

A list of signed entries: date, title, optional sub line, a signed amount and an optional running balance, with an optional delete button per row. The sign is shown as text and color. Import it from `@loui/ds/patterns`.

- Handoff source: `components/erp/LedgerList.jsx` (TODO `CMP-PAT-12`).

- Import: `import { LedgerList } from '@loui/ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/LedgerList/LedgerList.tsx`
- Stories (Storybook title `Patterns/LedgerList`): Default, NegativeAsSuccess, NegativeNeutral, WithoutBalance, Quantities, CustomFormat, LongText, Empty, Deletable, KeyboardDelete, Portuguese, RightToLeft, Focused

## Props

| Prop           | Type                                                                                        | Required | Default      | Description                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `entries`      | `readonly LedgerEntry[]`                                                                    | yes      |              | The entries, in display order (usually newest first).                                                                                                                                                                                                  |
| `currency`     | `string`                                                                                    |          |              | ISO 4217 currency code ("USD"). When set, amounts and balances are formatted as money with `formatCurrency` (minor units). Ignored when `format` is given.                                                                                             |
| `format`       | `(value: number) => string`                                                                 |          |              | Custom formatter for amounts and balances, receiving a number in the same unit as `delta`. The amount of an entry is passed as an absolute value (the sign is shown separately). Without `currency` or `format`, numbers are formatted for the locale. |
| `negativeTone` | `'neutral' \| 'success' \| 'warning' \| 'danger'`                                           |          | `'danger'`   | Color of negative amounts: `neutral`, `success`, `warning` or `danger` (default). The `-` sign is always shown too. Pick the tone by what the subtraction means (an expense is `danger`, a payment out of a balance owed may be `success`).            |
| `dateStyle`    | `'short' \| 'medium' \| 'long' \| 'full' \| 'monthDay' \| 'monthYear'`                      |          | `'monthDay'` | Format of each entry's date (`formatDate` styles). Default `monthDay`.                                                                                                                                                                                 |
| `onDelete`     | `(entry: LedgerEntry) => void`                                                              |          |              | Adds a "Delete entry" button to each row and calls this with the entry. Deleting must be confirmed by the consumer (dialog or inline confirmation) before data is removed.                                                                             |
| `messages`     | `Partial<{ balance: (amount: string) => string; deleteEntry: (title: string) => string; }>` |          |              | Message overrides for this instance.                                                                                                                                                                                                                   |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ LedgerList: { ... } }}>`.

| Key                          | English default        | Notes                                                                           |
| ---------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| `balance(amount: string)`    | `Balance {amount}`     | Label of the running balance after an entry. `amount` is already formatted.     |
| `deleteEntry(title: string)` | `Delete entry {title}` | Accessible name of the delete button of an entry; `title` is the entry's title. |

## Design tokens used

`--ds-danger`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-ledger-list-date-width`, `--ds-ledger-list-gap`, `--ds-ledger-list-padding-inline`, `--ds-ledger-list-text-gap`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-line-subtle`, `--ds-space-1`, `--ds-space-3`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-warning`, `--ds-weight-medium`

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
import { LedgerList } from '@loui/ds/patterns';

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

## Related components

- Instead, see DataTable: Large, sortable or filterable data: use `DataTable`.
- Renders: IconButton
