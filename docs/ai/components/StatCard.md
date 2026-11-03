# StatCard

> An indicator card: a mono caption, a large mono number and a short note, optionally with a
> trend and a small visual (such as a `ProportionBar`) in between.

It is a description list: the label is the term, the value and the note are its
descriptions, so a screen reader announces "Sold, $37,655.30, Up 12% vs previous 30 days".
A colored value is never the only signal: `tone` other than `neutral` requires a `note` or a
`trend`, and the trend is written as text ("Up 12%").

An indicator card for the top of a screen: a mono caption, a large mono number, an optional small visual and a short note or trend in words.

- Import: `import { StatCard } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/StatCard/StatCard.tsx`
- Stories (Storybook title `Components/StatCard`): Default, Large, WithAside, WarningTone, DangerTone, SuccessTone, TrendUp, TrendUpIsBad, TrendDownAndFlat, WithProportionBar, LongText, Grid, PortugueseBrazil

## Props

| Prop       | Type                                                                                                            | Required | Default     | Description                                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`    | `ReactNode`                                                                                                     | yes      |             | What the number is, in a few words: "Sold", "Overdue". Shown as a mono caption (uppercase by CSS) and used as the term of the card.                                                                                              |
| `value`    | `ReactNode`                                                                                                     | yes      |             | The number or amount. Format it with `formatCurrency` or `formatNumber` for the active locale.                                                                                                                                   |
| `size`     | `'md' \| 'lg'`                                                                                                  |          | `'md'`      | `md` (default, 24px) or `lg` (30px).                                                                                                                                                                                             |
| `aside`    | `ReactNode`                                                                                                     |          |             | Short mono text at the end of the label row: "42%". Read after the value.                                                                                                                                                        |
| `children` | `ReactNode`                                                                                                     |          |             | Content between the value and the note, for example a 4px `ProportionBar`.                                                                                                                                                       |
| `noteTone` | `'neutral' \| 'success' \| 'warning' \| 'danger'`                                                               |          | `'neutral'` | Color of the note text. Default `neutral`. Only affects color: the note is text anyway.                                                                                                                                          |
| `messages` | `Partial<{ trendUp: (percent: string) => string; trendDown: (percent: string) => string; trendFlat: string; }>` |          |             | Per-instance overrides of the built-in messages.                                                                                                                                                                                 |
| `tone`     | `'neutral' \| 'success' \| 'warning' \| 'danger'`                                                               |          | `'neutral'` | Color of the value. Use `danger` or `warning` only when the number asks for action, `success` when everything is fine. Default `neutral`. A colored value must be backed by text: pass `note` or `trend` (type error otherwise). |
| `note`     | `ReactNode`                                                                                                     |          |             | Context or change in words: "3 sales · average ticket $120".                                                                                                                                                                     |
| `trend`    | `StatCardTrend`                                                                                                 |          |             | A change versus a previous period, rendered as text through the messages.                                                                                                                                                        |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `md`, `lg`
- `tone`: `neutral`, `success`, `warning`, `danger`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ StatCard: { ... } }}>`.

| Key                          | English default  | Notes                                                                           |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `trendUp(percent: string)`   | `Up {percent}`   | Text of an upward trend. `percent` is already formatted for the locale ("12%"). |
| `trendDown(percent: string)` | `Down {percent}` | Text of a downward trend.                                                       |
| `trendFlat`                  | `No change`      | Text of a trend without change.                                                 |

## Design tokens used

`--ds-danger`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-num`, `--ds-fs-num-lg`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-lh-num`, `--ds-lh-num-lg`, `--ds-line`, `--ds-radius-lg`, `--ds-space-1`, `--ds-space-2`, `--ds-stat-card-gap`, `--ds-stat-card-padding`, `--ds-success`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-tracking-display`, `--ds-tracking-title`, `--ds-warning`, `--ds-weight-medium`, `--ds-weight-regular`, `--ds-weight-semibold`

## When to use

- A handful of key numbers at the top of a page (Today, Purchases, Finance, Reports).
- A number with context: "3 sales · average ticket $120.00", or a change versus a previous period.

## When not to use

- Many numbers that need comparing or sorting: use `DataTable`.
- A value the user edits: use a field.
- A status without a number: use `Badge`.

## Anatomy

```
dl.root (surface, 1px line, radius lg, padding 20)
  dt   label        mono caption, uppercase by CSS
  dd   value        mono 24px (md) or 30px (lg); colored by tone
  dd   aside        short mono text at the end of the label row (optional)
  dd   children     small visual, e.g. a 4px ProportionBar (optional)
  dd   note         trend (arrow + "Up 12%" + comparison) and/or note text
```

## Props (key ones)

| Prop       | Type                                        | Default   | Notes                                                                                   |
| ---------- | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `label`    | `ReactNode`                                 | -         | A few words: "Sold", "Overdue"                                                          |
| `value`    | `ReactNode`                                 | -         | Format with `formatCurrency` / `formatNumber`                                           |
| `size`     | `md \| lg`                                  | `md`      | `--ds-fs-num` / `--ds-fs-num-lg`                                                        |
| `tone`     | `neutral \| success \| warning \| danger`   | `neutral` | Color of the value. Any other tone requires `note` or `trend` (type error, dev warning) |
| `note`     | `ReactNode`                                 |           | Context in words                                                                        |
| `noteTone` | `neutral \| success \| warning \| danger`   | `neutral` | Color of the note text                                                                  |
| `trend`    | `{ direction, value?, tone?, comparedTo? }` |           | Change as text: "Up 12%", "Down 4.5%", "No change". `value` is a ratio (`0.12`)         |
| `aside`    | `ReactNode`                                 |           | "42%"                                                                                   |
| `children` | `ReactNode`                                 |           | Between the value and the note                                                          |
| `messages` | `Partial<messages>`                         |           | `trendUp(percent)`, `trendDown(percent)`, `trendFlat`                                   |

## Accessibility

- It is a description list: the label is the term (`dt`), the value and the note are its descriptions (`dd`). A screen reader announces "Sold, $37,655.30, Up 12% vs previous 30 days".
- Color is never the only signal. A non-neutral `tone` must come with a `note` or a `trend` (enforced by types, with a one-time development warning for untyped callers). The trend direction is written as text and the arrow icon is decorative.
- Contrast: the signal colors on `surface` pass 4.5:1; notes use `text-2`; the caption uses `text-3` (do not put the card on a raised or hover surface).
- No interaction. If the card should open something, wrap the label in a link or add a button in the note area.

## Content rules

- Tone only changes when there is something to do: `danger`/`warning` for numbers that ask for action, `success` for "all done". Do not decorate.
- At most four cards per row; use a grid with `repeat(auto-fit, minmax(240px, 1fr))` so large numbers are not cut.
- Trends say what changed and compared to what ("Up 12% vs previous 30 days"). When up is bad (costs, returns) set `trend.tone: 'danger'`.

## Example

```tsx
<StatCard
  label="Sold"
  value={formatCurrency(3765530, 'USD', locale)}
  trend={{ direction: 'up', value: 0.12, comparedTo: 'vs previous 30 days' }}
/>
<StatCard label="Overdue" value="$96.40" tone="danger" note="Water bill since Oct 28" />
```

## Related components

- Instead, see DataTable: Many numbers that need comparing or sorting: use `DataTable`.
- Instead, see Badge: A status without a number: use `Badge`.
- Renders: Icon
