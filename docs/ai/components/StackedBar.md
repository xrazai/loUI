# StackedBar

> Stacked bars: how each category divides into the same set of parts, horizontal (a row per
> category) or vertical (a column per category). Drawn in HTML and CSS, no axis: the total of
> each bar is printed with it and the bars share one scale.

Series are told apart without color: a gap separates neighbouring parts, the neutral ramp
differs in lightness, and beyond four series a hatch pattern repeats the ramp. The legend
names every series (and can hide them), and a visually hidden table carries all the numbers.

Each bar is an image with a text summary ("Q1: Online 40 and Store 30. Total 70."). The bars
are one tab stop; the arrow keys move between them, and the active bar's summary is also
printed in a readout line under the chart (hover works the same). A single readout per bar,
not per segment, keeps the keyboard path short and the focus target large.

Stacked bars for parts of a whole per category, horizontal (a row per category) or vertical (a column per category). Each bar has a text summary, a total, and the chart comes with a legend and a hidden data table.

- Import: `import { StackedBar } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/StackedBar/StackedBar.tsx`
- Stories (Storybook title `Components/StackedBar`): Default, Vertical, VerticalTall, Normalized, NormalizedVertical, WithCurrency, EightSeries, ExplicitColors, InteractiveLegend, InteractiveLegendControlled, AllSeriesHidden, KeyboardReadout, WithoutLegend, ZeroBar, Empty, LongLabels, PortugueseBrazil, RightToLeft, LegendShare

## Props

| Prop                   | Type                                                                                                                                                                                                                                                                                                   | Required | Default        | Description                                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                 | `readonly StackedBarDatum[]`                                                                                                                                                                                                                                                                           | yes      |                | One bar per datum, in display order. The chart does not sort.                                                                                                                                                                                                          |
| `series`               | `readonly StackedBarSeries[]`                                                                                                                                                                                                                                                                          | yes      |                | The parts of each bar, bottom to top (vertical) or start to end (horizontal). Without `color` they follow a neutral ramp of four steps; from the fifth series on the ramp repeats with a hatch (up to eight; beyond that pass `color` or group the tail into "Other"). |
| `orientation`          | `'horizontal' \| 'vertical'`                                                                                                                                                                                                                                                                           |          | `'horizontal'` | `horizontal` (default): one row per datum. `vertical`: one column per datum.                                                                                                                                                                                           |
| `normalize`            | `boolean`                                                                                                                                                                                                                                                                                              |          | `false`        | Draws every bar at full length so each shows the share of its parts (100% stacked). By default bars are scaled to the largest total, so lengths also compare the totals.                                                                                               |
| `format`               | `(value: number) => string`                                                                                                                                                                                                                                                                            |          |                | Formats values in the totals, the legend, the readout and the data table. Default: `Intl` for the active locale. Use `formatCurrency` for money.                                                                                                                       |
| `legend`               | `boolean`                                                                                                                                                                                                                                                                                              |          | `true`         | Shows the legend under the bars. On by default: the legend is what names the series.                                                                                                                                                                                   |
| `interactiveLegend`    | `boolean`                                                                                                                                                                                                                                                                                              |          | `false`        | Makes the legend items toggle buttons that hide and show series. Hidden series leave the bars, totals, summaries and the data table.                                                                                                                                   |
| `legendShare`          | `boolean`                                                                                                                                                                                                                                                                                              |          | `false`        | Adds the share of each series (its total over the total of the visible series) to the legend, next to the formatted total. Hidden series leave the denominator. Shares are rounded one by one and may not add up to exactly 100%.                                      |
| `hiddenSeries`         | `readonly string[]`                                                                                                                                                                                                                                                                                    |          |                | Controlled list of hidden series ids.                                                                                                                                                                                                                                  |
| `defaultHiddenSeries`  | `readonly string[]`                                                                                                                                                                                                                                                                                    |          | `[]`           | Initial hidden series ids when uncontrolled.                                                                                                                                                                                                                           |
| `onHiddenSeriesChange` | `(hiddenSeries: string[]) => void`                                                                                                                                                                                                                                                                     |          |                | Called with the new list of hidden series ids when the user toggles a legend item.                                                                                                                                                                                     |
| `height`               | `string \| number`                                                                                                                                                                                                                                                                                     |          |                | Height of the plot area of a vertical chart (a number is px, or any CSS length). Default `--ds-stacked-bar-height` (200px). Ignored when horizontal.                                                                                                                   |
| `description`          | `string`                                                                                                                                                                                                                                                                                               |          |                | Longer description of what the chart shows. Read after the name, together with the keyboard instructions.                                                                                                                                                              |
| `categoryLabel`        | `string`                                                                                                                                                                                                                                                                                               |          |                | Header of the category column in the hidden data table. Default: the "Category" message.                                                                                                                                                                               |
| `messages`             | `Partial<{ instructions: (count: number, formatted: string) => string; series: (label: string, value: string) => string; bar: (label: string, items: string, total: string) => string; tableCaption: (name?: string) => string; category: string; total: string; empty: string; allHidden: string; }>` |          |                | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                       |
| `aria-label`           | `string`                                                                                                                                                                                                                                                                                               |          |                | Accessible name of the chart: what it shows ("Orders by channel, per quarter"). Required unless `aria-labelledby` is set.                                                                                                                                              |
| `aria-labelledby`      | `string`                                                                                                                                                                                                                                                                                               |          |                | Id of the element that names the chart (a visible heading).                                                                                                                                                                                                            |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ StackedBar: { ... } }}>`.

| Key                                                | English default                                                                                   | Notes                                                                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions(count: number, formatted: string)`   | `{formatted} bars. Use the arrow keys to move between bars, Home and End for the first and last.` | Instructions linked to the chart with `aria-describedby`. `count` is the number of bars; `formatted` is the same number formatted for the locale.                                        |
| `series(label: string, value: string)`             | `{label} {value}`                                                                                 | One series inside the summary of a bar: "Online 40". Both arguments are already formatted.                                                                                               |
| `bar(label: string, items: string, total: string)` | `{label}: {items}. Total {total}.`                                                                | Accessible name of a bar, also shown in the readout. `items` is the list of series joined for the locale ("Online 40 and Store 30"); `total` is the formatted sum of the visible series. |
| `tableCaption(name?: string)`                      | `Data for {name?}`                                                                                | Caption of the visually hidden data table. `name` is the accessible name of the chart, if it has a text one.                                                                             |
| `category`                                         | `Category`                                                                                        | Header of the category column of the data table, unless `categoryLabel` is given.                                                                                                        |
| `total`                                            | `Total`                                                                                           | Header of the total column of the data table.                                                                                                                                            |
| `empty`                                            | `No data to show`                                                                                 | Text shown in place of the bars when there is no data.                                                                                                                                   |
| `allHidden`                                        | `All series are hidden. Show one in the legend.`                                                  | Text shown in place of the bars when every series is hidden through the legend.                                                                                                          |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-chart-series-1`, `--ds-chart-series-2`, `--ds-chart-series-3`, `--ds-chart-series-4`, `--ds-chart-series-hatch-size`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line`, `--ds-radius-sm`, `--ds-space-1`, `--ds-space-3`, `--ds-stacked-bar-bar-thickness`, `--ds-stacked-bar-category-w`, `--ds-stacked-bar-color`, `--ds-stacked-bar-column-max-w`, `--ds-stacked-bar-extent`, `--ds-stacked-bar-height`, `--ds-stacked-bar-readout-min-h`, `--ds-stacked-bar-segment-gap`, `--ds-stacked-bar-share`, `--ds-text`, `--ds-text-2`, `--ds-text-3`

## When to use

- Showing how each of a few categories (2 to about 12) divides into the same 2 to 8 parts: orders per channel per quarter, tasks per status per team.
- Comparing totals and composition together (default), or composition only (`normalize`).

## When not to use

- One whole divided into parts: `ProportionBar`.
- One series over time or categories: `Chart`. Ranked values: `RankList`.
- Exact figures the reader must look up: give them a table; the hidden table is for assistive technology.
- More than eight series: group the tail into "Other".

## Anatomy

```
div.root
  div[role=group][aria-label][aria-describedby]
    ul
      li  category (aria-hidden) · div.slot > div[role=img][tabindex][aria-label="Q1: Online 40…"] · total (aria-hidden)
  p[aria-hidden]  readout of the focused or hovered bar
  Legend           names the series (optionally toggles them)
  VisuallyHidden   instructions (aria-describedby) and a <table> with all values
```

Drawn with HTML and CSS: bars use one scale (the largest total is full length), parts are `flex` shares of their bar. There is no value axis; the total is printed with each bar and the legend shows the total of each series.

## Props (key ones)

| Prop                   | Type                         | Default        | Notes                                                                                               |
| ---------------------- | ---------------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `data`                 | `{ label, values }[]`        | -              | `values` is keyed by series `id`; missing or negative counts as 0                                   |
| `series`               | `{ id, label, color? }[]`    | -              | Part order: start to end (horizontal), bottom to top (vertical)                                     |
| `orientation`          | `'horizontal' \| 'vertical'` | `'horizontal'` |                                                                                                     |
| `normalize`            | `boolean`                    | `false`        | Every bar at full length (100% stacked)                                                             |
| `format`               | `(value) => string`          | `Intl`         | Totals, legend, summaries, table. Use `formatCurrency` for money                                    |
| `legend`               | `boolean`                    | `true`         | The legend names the series; turn it off only if you name them nearby                               |
| `interactiveLegend`    | `boolean`                    | `false`        | Legend items hide and show series                                                                   |
| `legendShare`          | `boolean`                    | `false`        | Legend also shows each series' share of the visible total (rounded one by one, may not sum to 100%) |
| `hiddenSeries`         | `readonly string[]`          |                | Controlled hidden series                                                                            |
| `defaultHiddenSeries`  | `readonly string[]`          | `[]`           | Initial hidden series when uncontrolled                                                             |
| `onHiddenSeriesChange` | `(ids: string[]) => void`    |                |                                                                                                     |
| `height`               | `number \| string`           | 200px          | Vertical only (`--ds-stacked-bar-height`)                                                           |
| `description`          | `string`                     |                | Read after the name                                                                                 |
| `categoryLabel`        | `string`                     | "Category"     | Header of the first table column                                                                    |
| `messages`             | `Partial<messages>`          |                | Instructions, summaries, table headers, empty states                                                |

`aria-label` or `aria-labelledby` is required.

## Telling series apart without color

- A 2px gap (the track shows through) separates neighbouring parts.
- Series follow a neutral ramp of four steps that differ in lightness (`--ds-chart-series-1` to `-4`), so they also differ for readers with color vision deficiencies. From the fifth series the ramp repeats with a hatch pattern (up to eight). The series `color` prop is for when that is not enough; it is never hatched.
- The legend names every series and its swatch uses the same fill. A series keeps its fill when another is hidden.
- Each bar's summary and the data table list every series by name with its value.

The single-accent rule holds: the accent appears only in the focus ring. Signal colors appear only if you pass them as explicit series colors.

## Accessibility

- A group named by `aria-label`/`aria-labelledby`, described by the instructions and your `description`. Each bar is an image whose name is its summary: "Q1: Online 40, Store 30, and Phone 10. Total 80."
- Keyboard: one tab stop for all bars (roving). Arrow keys (and `Home`/`End`) move between bars, `Escape` dismisses the readout. The focused bar has a visible focus ring (system colors in forced colors).
- Why per-bar and not per-segment: a bar is a large target, the path through a chart stays short (one stop), and its single summary gives screen reader users the whole composition at once. The same text is printed in the readout line under the chart for keyboard and pointer users; the readout is `aria-hidden` because the focused bar is already announced.
- Hover shows the same readout. The line has reserved height, so nothing shifts.
- A visually hidden `<table>` (caption, category and one column per visible series, total) carries all values.
- Hidden series leave the bars, totals, summaries and table. If all are hidden, a message says so. An empty `data` shows "No data to show".
- Contrast: every ramp step keeps 3:1 against the track (`--ds-bg`); labels use `text-2`.
- Forced colors: segments use system colors; the track gets a border.
- Category labels are truncated in horizontal bars (96px column, `--ds-stacked-bar-category-w`); the summary and the table carry the full text. Keep labels short.

## Content rules

- Bar labels: short ("Q1", "North"). Series labels: short nouns in sentence case.
- Name the chart for what it shows ("Orders per quarter, by channel").
- Formatted values come from `Intl`; pass `format` for currency.

## Example

```tsx
<StackedBar
  aria-label="Orders per quarter, by channel"
  interactiveLegend
  series={[
    { id: 'online', label: 'Online' },
    { id: 'store', label: 'Store' },
    { id: 'phone', label: 'Phone' },
  ]}
  data={[
    { label: 'Q1', values: { online: 40, store: 30, phone: 10 } },
    { label: 'Q2', values: { online: 50, store: 20, phone: 30 } },
  ]}
/>
```

## Not included

- Value axis and grid lines, negative values, grouped (side by side) bars, per-segment focus, zoom. Use `Chart` for a single series with an axis.
- Series order in vertical bars is fixed (first series at the bottom); the chart never sorts.

## Related components

- Instead, see ProportionBar: One whole divided into parts: `ProportionBar`.
- Instead, see Chart: One series over time or categories: `Chart`. Ranked values: `RankList`.
- Instead, see RankList: One series over time or categories: `Chart`. Ranked values: `RankList`.
- Renders: Legend, VisuallyHidden
