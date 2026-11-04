# ProportionBar

> A single bar split into the parts of a whole (payment methods, composition). It is an image
> with a text summary ("Payment methods: Pix 47%, Cash 16%…"), and an optional legend with the
> percentage and the value of each part.

Neutral by default: signal colors are not used for categories. Parts are separated by a
gap, and beyond four parts the ramp repeats with a hatch so they never look alike.

One bar split into the parts of a whole (payment methods, composition), with a text summary for assistive technology and an optional legend with the percentage and value of each part.

- Import: `import { ProportionBar } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ProportionBar/ProportionBar.tsx`
- Stories (Storybook title `Components/ProportionBar`): Default, WithLegend, EightParts, ExplicitColors, ZeroPart, AllZero, OneDecimalPercent, LongLabels, PortugueseBrazil, LegendColumns, PartOfWhole

## Props

| Prop            | Type                                                                                                                                       | Required | Default              | Description                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `segments`      | `readonly ProportionSegment[]`                                                                                                             | yes      |                      | The parts of the whole, in display order. Without `color` they use a neutral ramp of four steps (`text`, `text-2`, `text-3`, `line-control`); from the fifth part on, the ramp repeats with a hatch pattern so no two parts look the same (up to eight; group the tail into "Other" or give explicit colors beyond that). The bar never sorts.                                     |
| `label`         | `string`                                                                                                                                   |          |                      | Name of the whole ("Payment methods"). It starts the summary read for the bar.                                                                                                                                                                                                                                                                                                     |
| `legend`        | `boolean`                                                                                                                                  |          | `false`              | Shows a list under the bar with swatch, label, percentage and formatted value for each part.                                                                                                                                                                                                                                                                                       |
| `total`         | `number`                                                                                                                                   |          |                      | The size of the whole, in the unit of the segment values. When it is larger than the sum of the segments, the difference is the remaining part: an unlabelled track after the segments, named "Remaining" in the summary and in the legend. This is how a single segment becomes a "part of the whole" indicator ("Paid 1,240 of 2,000"). When smaller than the sum it is ignored. |
| `legendColumns` | `readonly ProportionLegendColumn[]`                                                                                                        |          | `['share', 'value']` | Columns of the legend, in order: `share` (percentage), `value` (formatted with `format`) and `count` (the segment `count`). Default `['share', 'value']`. Percentages are rounded one by one and may not add up to exactly 100%.                                                                                                                                                   |
| `format`        | `(value: number) => ReactNode`                                                                                                             |          |                      | Formats each value in the legend. Default: `formatNumber` with the active locale. Use `formatCurrency` for money.                                                                                                                                                                                                                                                                  |
| `percentDigits` | `number`                                                                                                                                   |          | `0`                  | Decimals of the percentages in the summary and the legend. Default `0`.                                                                                                                                                                                                                                                                                                            |
| `messages`      | `Partial<{ segment: (label: string, percent: string) => string; summary: (items: string, label?: string) => string; remaining: string; }>` |          |                      | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                                                                                                                                   |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ProportionBar: { ... } }}>`.

| Key                                       | English default     | Notes                                                                                                                                         |
| ----------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `segment(label: string, percent: string)` | `{label} {percent}` | One segment in the summary read for the bar: "Cash 16%". Both arguments are already formatted.                                                |
| `summary(items: string, label?: string)`  | `{label?}: {items}` | The whole summary. `items` is the list of segments joined for the locale ("Cash 16%, Card 11% and Pix 73%"); `label` names the bar, if given. |
| `remaining`                               | `Remaining`         | Name of the unfilled part when `total` is larger than the sum of the segments: read in the summary and printed in the legend.                 |

## Design tokens used

`--ds-bg`, `--ds-font-mono`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line`, `--ds-line-control`, `--ds-line-subtle`, `--ds-proportion-bar-color`, `--ds-proportion-bar-columns`, `--ds-proportion-bar-hatch-size`, `--ds-proportion-bar-height`, `--ds-proportion-bar-percent-col-w`, `--ds-proportion-bar-segment-gap`, `--ds-proportion-bar-share`, `--ds-proportion-bar-swatch-size`, `--ds-radius-pill`, `--ds-radius-sm`, `--ds-space-3`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`

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

| Prop            | Type                                      | Default | Notes                                                                                                                                               |
| --------------- | ----------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `segments`      | `{ id?, label, value, count?, color? }[]` | -       | Display order; never sorted. Negative and non-finite values count as 0. `id` links the segment to its legend item, `count` feeds the `count` column |
| `total`         | `number`                                  |         | Size of the whole. When larger than the sum, the rest is an unlabelled track named "Remaining"                                                      |
| `legendColumns` | `('share'                                 | 'value' | 'count')[]`                                                                                                                                         | `['share', 'value']` | Columns of the legend, in order |
| `label`         | `string`                                  |         | Name of the whole; starts the summary                                                                                                               |
| `legend`        | `boolean`                                 | `false` | List with swatch, label, percentage and formatted value                                                                                             |
| `format`        | `(value) => ReactNode`                    | `Intl`  | Formats legend values. Use `formatCurrency` for money                                                                                               |
| `percentDigits` | `number`                                  | `0`     | Decimals of the percentages                                                                                                                         |
| `messages`      | `Partial<messages>`                       |         | `segment(label, percent)`, `summary(items, label?)`, `remaining`                                                                                    |

## Part of the whole

A single segment plus `total` is the "Paid 1,240 of 2,000" indicator; there is no separate component:

```tsx
<ProportionBar
  label="Invoice"
  total={2000}
  legend
  format={(value) => formatCurrency(value * 100, 'USD', locale)}
  segments={[{ id: 'paid', label: 'Paid', value: 1240 }]}
/>
```

The summary reads "Invoice: Paid 62% and Remaining 38%" (the word comes from the `remaining` message, `Restante` in pt-BR). The remaining part is drawn as the empty track, so it carries no color; in the legend it has a hollow, dashed swatch. A `total` smaller than the sum of the segments is ignored. Use `DonutMeter` instead when the share is the only message and a ring fits better.

## Linking segments and legend items

Each segment can carry a stable `id`. The bar segment gets `data-segment="<id>"` and its legend item gets the same attribute and the DOM id `<bar id>-<id>`, so tests and consumer code can find the pair. For people the link is the order, the label and the matching swatch (color is never the only link). The bar itself is one `role="img"` whose children are presentational, so the accessible link is the summary: it names every part in the same order as the legend, and the legend repeats the same labels.

## Legend columns

`legendColumns` picks and orders the columns after the label: `share` (percentage), `value` (formatted with `format`) and `count` (the segment `count`, formatted with `Intl`). All rows share one grid, so the columns line up (tabular mono figures). Shares are rounded one by one and may not add up to 100%.

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

## Related components

- Instead, see Progress: Progress of a task: use `Progress`. A quantity within a range: use `Meter`.
- Instead, see Meter: Progress of a task: use `Progress`. A quantity within a range: use `Meter`.
- Instead, see Chart: Comparing separate values or many categories: use `Chart` or `RankList`.
- Instead, see RankList: Comparing separate values or many categories: use `Chart` or `RankList`.
