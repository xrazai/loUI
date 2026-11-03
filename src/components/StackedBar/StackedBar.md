# StackedBar

Status: experimental

Stacked bars for parts of a whole per category, horizontal (a row per category) or vertical (a column per category). Each bar has a text summary, a total, and the chart comes with a legend and a hidden data table.

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

| Prop                   | Type                         | Default        | Notes                                                                 |
| ---------------------- | ---------------------------- | -------------- | --------------------------------------------------------------------- |
| `data`                 | `{ label, values }[]`        | -              | `values` is keyed by series `id`; missing or negative counts as 0     |
| `series`               | `{ id, label, color? }[]`    | -              | Part order: start to end (horizontal), bottom to top (vertical)       |
| `orientation`          | `'horizontal' \| 'vertical'` | `'horizontal'` |                                                                       |
| `normalize`            | `boolean`                    | `false`        | Every bar at full length (100% stacked)                               |
| `format`               | `(value) => string`          | `Intl`         | Totals, legend, summaries, table. Use `formatCurrency` for money      |
| `legend`               | `boolean`                    | `true`         | The legend names the series; turn it off only if you name them nearby |
| `interactiveLegend`    | `boolean`                    | `false`        | Legend items hide and show series                                     |
| `hiddenSeries`         | `readonly string[]`          |                | Controlled hidden series                                              |
| `defaultHiddenSeries`  | `readonly string[]`          | `[]`           | Initial hidden series when uncontrolled                               |
| `onHiddenSeriesChange` | `(ids: string[]) => void`    |                |                                                                       |
| `height`               | `number \| string`           | 200px          | Vertical only (`--ds-stacked-bar-height`)                             |
| `description`          | `string`                     |                | Read after the name                                                   |
| `categoryLabel`        | `string`                     | "Category"     | Header of the first table column                                      |
| `messages`             | `Partial<messages>`          |                | Instructions, summaries, table headers, empty states                  |

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
