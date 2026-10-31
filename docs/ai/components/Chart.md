# Chart

> A responsive bar or line chart for one series, drawn in SVG.

It is a single focusable image: `Tab` focuses it, the left and right arrow keys (and Home and
End) move between data points, and each point is announced politely ("Tue: 58. 2 of 7") and
shown in a label above it. Pointer users get the same label on hover. A visually hidden
`<table>` with a caption carries the same data for assistive technology.

Limits: one series, a value axis that always includes zero, categories spaced evenly, no
zoom, no stacked or grouped bars, no legend. The axis is not mirrored in right-to-left
languages (time reads left to right in charts).

A small responsive bar or line chart for one series, drawn in SVG with no chart library. Grid and axis are quiet (dashed lines, mono labels); the data is reachable by keyboard and by a hidden table.

- Import: `import { Chart } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Chart/Chart.tsx`
- Stories (Storybook title `Components/Chart`): Default, Line, Highlight, LineHighlight, NegativeValues, SmallValues, AllZero, SinglePoint, Empty, Tones, CustomHeight, ManyPoints, KeyboardNavigation, Hover, PortugueseBrazil

## Props

| Prop              | Type                                                                                                                                                                                                                                                                               | Required | Default    | Description                                                                                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`            | `readonly ChartDatum[]`                                                                                                                                                                                                                                                            | yes      |            | The data, in display order (usually time). The chart does not sort.                                                                                                                                                                                                  |
| `type`            | `'line' \| 'bar'`                                                                                                                                                                                                                                                                  |          | `'bar'`    | `bar` (default) or `line`. One series per chart.                                                                                                                                                                                                                     |
| `format`          | `(value: number) => string`                                                                                                                                                                                                                                                        |          |            | Formats values on the axis, in the tooltip, in the announcement and in the data table. Receives a number and returns text; use `formatCurrency` or `formatNumber` with the active locale. Default: `formatNumber` (compact on the axis, full in the tooltip).        |
| `tone`            | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'`                                                                                                                                                                                                                      |          | `'accent'` | Color of the active point and of the line: `accent` (default), `neutral`, `success`, `warning` or `danger`.                                                                                                                                                          |
| `highlight`       | `Readonly<Record<number, string>>`                                                                                                                                                                                                                                                 |          |            | Marks points by index with short text, for example `{ 29: 'Today', 12: 'Best day' }`. The marked point is drawn in the strong ink color, and its text is printed above it and read by screen readers, so the highlight never depends on color. Keep the texts short. |
| `height`          | `string \| number`                                                                                                                                                                                                                                                                 |          |            | Height of the chart (a number is px, or any CSS length). Default `--ds-chart-height` (200px). The width is always 100% of the container.                                                                                                                             |
| `description`     | `string`                                                                                                                                                                                                                                                                           |          |            | Longer description of what the chart shows. Read after the name, together with the keyboard instructions.                                                                                                                                                            |
| `categoryLabel`   | `string`                                                                                                                                                                                                                                                                           |          |            | Header of the category column in the hidden data table. Default: the "Category" message.                                                                                                                                                                             |
| `valueLabel`      | `string`                                                                                                                                                                                                                                                                           |          |            | Header of the value column in the hidden data table (for example "Sales"). Default: the "Value" message.                                                                                                                                                             |
| `messages`        | `Partial<{ instructions: (count: number, formatted: string) => string; point: (label: string, value: string, position: string, count: string, note?: string) => string; tableCaption: (name?: string) => string; category: string; value: string; note: string; empty: string; }>` |          |            | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                     |
| `aria-label`      | `string`                                                                                                                                                                                                                                                                           |          |            | Accessible name of the chart: what it shows ("Sales, last 30 days"). Required unless `aria-labelledby` is set.                                                                                                                                                       |
| `aria-labelledby` | `string`                                                                                                                                                                                                                                                                           |          |            | Id of the element that names the chart (a visible heading).                                                                                                                                                                                                          |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `tone`: `neutral`, `accent`, `success`, `warning`, `danger`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Chart: { ... } }}>`.

| Key                                                                                   | English default                                                                                                           | Notes                                                                                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions(count: number, formatted: string)`                                      | `{formatted} data points. Use the left and right arrow keys to move between points, Home and End for the first and last.` | Instructions linked to the chart with `aria-describedby`. `count` is the number of data points; `formatted` is the same number formatted for the locale. |
| `point(label: string, value: string, position: string, count: string, note?: string)` | `{label}: {value}, {note?}. {position} of {count}`                                                                        | Announced (polite) when the user moves to a point. `value` is already formatted; `note` is the highlight text of the point, if any ("Today").            |
| `tableCaption(name?: string)`                                                         | `Data for {name?}`                                                                                                        | Caption of the visually hidden data table. `name` is the accessible name of the chart, if it has a text one.                                             |
| `category`                                                                            | `Category`                                                                                                                | Header of the category column of the data table, unless `categoryLabel` is given.                                                                        |
| `value`                                                                               | `Value`                                                                                                                   | Header of the value column of the data table, unless `valueLabel` is given.                                                                              |
| `note`                                                                                | `Note`                                                                                                                    | Header of the note column of the data table (shown when a point is highlighted).                                                                         |
| `empty`                                                                               | `No data to show`                                                                                                         | Text shown inside the plot when there is no data.                                                                                                        |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-chart-area-opacity`, `--ds-chart-bar-radius`, `--ds-chart-color`, `--ds-chart-grid-dash`, `--ds-chart-grid-gap`, `--ds-chart-height`, `--ds-chart-outline-w`, `--ds-chart-point-r`, `--ds-chart-stroke-w`, `--ds-chart-tooltip-padding-block`, `--ds-chart-tooltip-padding-inline`, `--ds-chart-tooltip-x`, `--ds-chart-tooltip-y`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-label`, `--ds-line-control`, `--ds-line-strong`, `--ds-line-subtle`, `--ds-primary-bg`, `--ds-primary-fg`, `--ds-radius-sm`, `--ds-space-1`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-warning`, `--ds-weight-medium`

## When to use

- A trend or a comparison across a handful to a few dozen categories: sales per day, orders per week.
- Next to the number it explains (a `StatCard`).

## When not to use

- Several series, stacked or grouped bars, zoom, brushing, pie charts: not supported (see limits).
- Parts of a whole: use `ProportionBar`.
- Rankings with names: use `RankList`.
- Exact values the user must read or compare: use `DataTable` (the chart is for shape).

## Anatomy

```
div.root
  div[role=img][tabindex=0]   named by aria-label / aria-labelledby, described by the instructions
    svg[aria-hidden]          grid + tick labels, bars or line + area, category labels, highlight texts
    span                      value label of the active point (aria-hidden)
  span                        visually hidden description + keyboard instructions
  span[role=status]           visually hidden polite live region: "Tue: 58. 2 of 7"
  table (visually hidden)     caption, headers, one row per point
```

## Props (key ones)

| Prop                          | Type                    | Default  | Notes                                                                             |
| ----------------------------- | ----------------------- | -------- | --------------------------------------------------------------------------------- |
| `data`                        | `{ label, value }[]`    | -        | In display order; the chart never sorts                                           |
| `aria-label`                  | `string`                | -        | Required (or `aria-labelledby`): what the chart shows                             |
| `type`                        | `bar \| line`           | `bar`    |                                                                                   |
| `format`                      | `(value) => string`     | `Intl`   | Axis, label, announcement and table. Default: compact on the axis, full elsewhere |
| `tone`                        | `ChartTone`             | `accent` | Color of the active bar and of the line                                           |
| `highlight`                   | `Record<index, string>` |          | `{ 29: 'Today', 12: 'Best day' }`: ink fill + outline + text above + announced    |
| `height`                      | `number \| string`      | `200px`  | Width is always 100% of the container                                             |
| `description`                 | `string`                |          | Longer description, read before the keyboard instructions                         |
| `categoryLabel`, `valueLabel` | `string`                |          | Headers of the hidden table ("Day", "Sales")                                      |
| `messages`                    | `Partial<messages>`     |          | `instructions`, `point`, `tableCaption`, `category`, `value`, `note`, `empty`     |

`niceScale(min, max, tickCount?)` is exported: a pure helper that returns `{ min, max, step, ticks }` for a round axis. It always includes zero, handles all-zero data (0 to 1), tiny values (`0.00003`), huge values, negatives and non-finite input.

## Accessibility

- The plot is one `role="img"` with an accessible name and a description; the SVG inside is hidden. The visually hidden `<table>` with a `<caption>` is the text alternative and holds every value (and the highlight texts in a "Note" column).
- Keyboard: `Tab` focuses the chart (nothing announced yet). Left/Right (also Up/Down) move to the previous/next point, Home/End to the first/last, Escape clears the active point. The first Right arrow goes to the first point, the first Left arrow to the last. Movement stops at the ends.
- The active point is announced politely ("Tue: 58, Today. 2 of 7") and drawn as a label above it; hover shows the same label. The label is also in the SVG as text, never color-only.
- Highlights always carry text and a stronger shape (outline on bars, a ring marker on lines), so they do not depend on color. Active bars get a tone fill and outline.
- Bars use `line-control` (3:1 against the surface); tick labels use `text-3` (above 4.5:1 on `bg` and `surface`).
- Reduced motion: color transitions only apply when motion is allowed. Forced colors: bars, lines and labels switch to system colors (`GrayText`, `CanvasText`, `Highlight`).
- The chart does not mirror in right-to-left languages (time still runs left to right); the label position uses physical coordinates on purpose.

## Content rules

- Name says what and when: "Sales, last 30 days". Labels are short ("Mon", "28") because they are printed under the plot.
- Highlight texts are one or two words ("Today", "Best day").
- Format money with `formatCurrency` (integer minor units) and the active locale; never hand-build strings.

## Limits

- One series per chart. For two series use two charts side by side.
- Categories are spaced evenly (no time scale); labels are skipped when crowded (the table and the keyboard still reach every point).
- The value axis always includes zero. Up to about 100 ticks are generated at most (usually 4 to 7).
- Geometry (padding, bar width, label spacing) lives in `chartLayout.ts` as SVG units; every color, stroke, radius and font is a token.

## Example

```tsx
<Chart
  aria-label="Sales, last 30 days"
  type="bar"
  data={days.map((d) => ({ label: d.day, value: d.totalMinor }))}
  format={(v) => formatCurrency(v, 'USD', locale)}
  highlight={{ 29: 'Today', [bestIndex]: 'Best day' }}
/>
```

## Related components

- Instead, see ProportionBar: Parts of a whole: use `ProportionBar`.
- Instead, see RankList: Rankings with names: use `RankList`.
- Instead, see DataTable: Exact values the user must read or compare: use `DataTable` (the chart is for shape).
- Renders: VisuallyHidden
