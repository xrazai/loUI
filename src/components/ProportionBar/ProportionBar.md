# ProportionBar

Status: experimental

One bar split into the parts of a whole (payment methods, composition), with a text summary for assistive technology and an optional legend with the percentage and value of each part.

## When to use

- Showing how a total divides into a few parts (2 to 8) at a glance.
- Next to or inside a `StatCard`.

## When not to use

- Progress of a task: use `Progress`. A quantity within a range: use `Meter`.
- Comparing separate values or many categories: use `Chart` or `RankList`.
- Exact figures the user must read: show the legend (or a table).

## Anatomy

```
div.root
  div[role=img][aria-label="Payment methods: Pix 53%, Cash 18%…"]   the track, 10px, pill radius
    div  one segment per non-zero part (flex share = its share of the whole, 2px gap)
  ul (legend, optional)
    li  swatch (aria-hidden) · label · percentage · value
```

## Props (key ones)

| Prop            | Type                         | Default | Notes                                                                  |
| --------------- | ---------------------------- | ------- | ---------------------------------------------------------------------- |
| `segments`      | `{ label, value, color? }[]` | -       | Display order; never sorted. Negative and non-finite values count as 0 |
| `label`         | `string`                     |         | Name of the whole; starts the summary                                  |
| `legend`        | `boolean`                    | `false` | List with swatch, label, percentage and formatted value                |
| `format`        | `(value) => ReactNode`       | `Intl`  | Formats legend values. Use `formatCurrency` for money                  |
| `percentDigits` | `number`                     | `0`     | Decimals of the percentages                                            |
| `messages`      | `Partial<messages>`          |         | `segment(label, percent)`, `summary(items, label?)`                    |

## Distinguishing the parts

Neutral by default: signal colors are not used for categories.

- The ramp has four solid steps: `text`, `text-2`, `text-3`, `line-control`. All reach 3:1 against the track background.
- Neighbours are always separated by a 2px gap.
- From the fifth part on, the ramp **repeats with a diagonal hatch**, so up to eight parts look different. This is the only place a gradient is used, as a pattern, not as decoration.
- Beyond eight parts, group the smallest into "Other" or pass explicit `color`s. In development a warning appears when more than eight parts have no color.
- Even so, the legend and the summary carry the identity of every part; the fill only helps sighted users.

## Accessibility

- The bar is `role="img"` with an `aria-label` that lists every part with its percentage: "Payment methods: Pix 53%, Cash 18%, Debit 17%, and Credit 11%". The list is joined with `Intl.ListFormat` for the locale; the per-part text comes from messages.
- The legend is a real list. It repeats the summary on purpose: it is the content sighted users read, and it stays available when you need more than the bar.
- Zero parts are listed in the legend (with 0%) but not drawn.
- Forced colors: segments use system colors (`CanvasText`, `GrayText`, `LinkText`, `Highlight`) and the track gets a border.

## Content rules

- Part labels are short nouns ("Cash", "Pix"); the whole gets a label when the bar is not obvious from context.
- Percentages are rounded; they may not add up to exactly 100%. Use `percentDigits` if that matters.

## Example

```tsx
<ProportionBar
  label="Payment methods"
  legend
  format={(value) => formatCurrency(value, 'USD', locale)}
  segments={[
    { label: 'Pix', value: 1693000 },
    { label: 'Cash', value: 573400 },
    { label: 'Debit', value: 538800 },
    { label: 'Credit', value: 359600 },
  ]}
/>
```

## Differences from the handoff

- A text alternative: `role="img"` with a summary; the handoff relied on `title` tooltips.
- The ramp's fourth step is `line-control` (3:1) instead of `line-strong`, and parts beyond four are hatched instead of repeating the same four colors.
- `height` is a token (`--ds-proportion-bar-height`), not a prop; `RAMP` is not exported.
- Legend values and percentages use `Intl`; the legend is a list.
- Segment widths use a flex share, so they are exact even when values are fractions.
