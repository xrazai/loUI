# Chart

Status: experimental

A small responsive bar or line chart for one series, drawn in SVG with no chart library. Grid and axis are quiet (dashed lines, mono labels); the data is reachable by keyboard and by a hidden table.

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
    svg[aria-hidden]          grid + tick labels, bars or line + area, reference lines + labels, category labels, highlight texts, note markers
    span                      value label of the active point (aria-hidden)
  span                        visually hidden description + keyboard instructions
  span[role=status]           visually hidden polite live region: "Tue: 58. 2 of 7"
  table (visually hidden)     caption, headers, one row per point, one footer row per reference line
```

## Props (key ones)

| Prop                          | Type                                       | Default   | Notes                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                        | `{ label, value }[]`                       | -         | In display order; the chart never sorts                                                                                                                                         |
| `aria-label`                  | `string`                                   | -         | Required (or `aria-labelledby`): what the chart shows                                                                                                                           |
| `type`                        | `bar \| line`                              | `bar`     |                                                                                                                                                                                 |
| `format`                      | `(value) => string`                        | `Intl`    | Axis, label, announcement and table. Default: compact on the axis, full elsewhere                                                                                               |
| `tone`                        | `ChartTone`                                | `accent`  | Color of the active bar and of the line                                                                                                                                         |
| `highlight`                   | `Record<index, string>`                    |           | `{ 29: 'Today', 12: 'Best day' }`: ink fill + outline + text above + announced                                                                                                  |
| `notes`                       | `Record<index, string>`                    |           | Long text per point: in the label of the active point, the table and the announcement; diamond marker on the point                                                              |
| `referenceLines`              | `{ value, label, kind, labelPosition? }[]` |           | Dashed lines across the plot (`kind`: `average` or `target`); the axis widens to include them. `labelPosition`: `auto` (default), `end` or `start`, see "Reference line labels" |
| `tickEvery`                   | `number`                                   | automatic | Show every nth category label. Below 1 or not finite means automatic                                                                                                            |
| `height`                      | `number \| string`                         | `200px`   | Width is always 100% of the container                                                                                                                                           |
| `description`                 | `string`                                   |           | Longer description, read before the keyboard instructions                                                                                                                       |
| `categoryLabel`, `valueLabel` | `string`                                   |           | Headers of the hidden table ("Day", "Sales")                                                                                                                                    |
| `messages`                    | `Partial<messages>`                        |           | `instructions`, `point`, `tableCaption`, `category`, `value`, `note`, `average`, `target`, `referenceLine`, `referenceSummary`, `empty`                                         |

`chartAverage(values)` is exported: the mean of numbers (or of `{ value }` data), ignoring non-finite entries, `0` when empty. Use it for the `average` line: `referenceLines={[{ kind: 'average', label: 'Average', value: chartAverage(data) }]}`.

`niceScale(min, max, tickCount?)` is exported: a pure helper that returns `{ min, max, step, ticks }` for a round axis. It always includes zero, handles all-zero data (0 to 1), tiny values (`0.00003`), huge values, negatives and non-finite input.

## Accessibility

- The plot is one `role="img"` with an accessible name and a description; the SVG inside is hidden. The visually hidden `<table>` with a `<caption>` is the text alternative and holds every value (and the highlight texts in a "Note" column).
- Notes: a point with a `notes` entry gets a small diamond above it (a shape, not a color). Its text is shown under the value in the label of the active point (wrapping, up to `--ds-chart-tooltip-max-w`), read in the announcement after the highlight ("Tue: 58, Today. Free shipping started. 2 of 7") and written in the "Note" column of the table. When a point has both, the cell reads "Today. Free shipping started."; the table gets the Note column as soon as any point has a highlight or a note.
- Reference lines: dashed across the plot with the label and the formatted value as text at the end side of the line ("Goal 120"). `average` uses long dashes, `target` dash and dot, so the kind never depends on color; the line and the text use `text-2`. Screen readers get them in the description ("Reference lines: Average, Weekly mean: 51.5 and Target, Goal: 120.") and in the footer rows of the table ("Average, Weekly mean" / "51.5"). If the label already starts with the kind name as a whole word ("Average per open day", pt-BR "Média por dia aberto"; compared ignoring case and accents in the active locale), only the label is read, so the kind is never said twice. Where the text is printed never changes what is read (see "Reference line labels").
- Axis labels: by default category labels are skipped automatically when they would collide; `tickEvery` forces every nth label (1 shows all, even if they touch). The keyboard and the table always reach every point.
- Keyboard: `Tab` focuses the chart (nothing announced yet). Left/Right (also Up/Down) move to the previous/next point, Home/End to the first/last, Escape clears the active point. The first Right arrow goes to the first point, the first Left arrow to the last. Movement stops at the ends.
- The active point is announced politely ("Tue: 58, Today. 2 of 7") and drawn as a label above it; hover shows the same label. The label is also in the SVG as text, never color-only.
- Highlights always carry text and a stronger shape (outline on bars, a ring marker on lines), so they do not depend on color. Active bars get a tone fill and outline.
- Bars use `line-control` (3:1 against the surface); tick labels use `text-3` (above 4.5:1 on `bg` and `surface`).
- Reduced motion: color transitions only apply when motion is allowed. Forced colors: bars, lines and labels switch to system colors (`GrayText`, `CanvasText`, `Highlight`).
- The chart does not mirror in right-to-left languages (time still runs left to right); the label position uses physical coordinates on purpose.

## Reference line labels

The text of a reference line ("Average $1.8K") is placed where it does not cover the bars, the line, a highlight text ("Today"), a note marker or the text of another reference line. With `labelPosition: 'auto'` (the default) the chart tries, in order:

1. the end of the line, above it (the usual place, used whenever it is clear);
2. the start of the line, above it;
3. the end, then the start, below the line;
4. outside the plot, on the end side, level with its line: the plot gives up the width of the text. This happens when bars cross the line at both ends, as in a 90-day report whose last bar is the tallest. Texts of nearby lines are moved apart there.

Step 4 is skipped when the margin would take more than 40% of the chart width or would hide category labels that all fit before; then the text stays at the place with the least overlap (the background-colored halo keeps it readable).

`labelPosition: 'end'` or `'start'` pins the text to that end of the line: above it, or below it when above is taken, and never outside. Use it only when the position must stay fixed across data, since the text may then cover bars.

The accessible name, the description and the hidden table are the same wherever the text is printed. The placement uses estimated text widths (caption mono), measured in the browser at 800 and 1366 px in the tests.

## Content rules

- Reference line labels: either a short name that adds to the kind ("Goal", "Weekly mean"; read as "Target, Goal") or a full name that starts with the kind ("Average per open day"; read as written). Do not put the kind in the middle or the end of the label ("Daily average" is read "Average, Daily average"). The visible text is always the label alone.
- Name says what and when: "Sales, last 30 days". Labels are short ("Mon", "28") because they are printed under the plot.
- Highlight texts are one or two words ("Today", "Best day").
- Format money with `formatCurrency` (integer minor units) and the active locale; never hand-build strings.

## Limits

- One series per chart. For two series use two charts side by side.
- Categories are spaced evenly (no time scale); labels are skipped when crowded unless `tickEvery` is set (the table and the keyboard still reach every point).
- Reference lines are horizontal only. Their labels avoid marks (see "Reference line labels"), except in a narrow chart or with a pinned `labelPosition`, where they can cross bars (they carry a background-colored halo).
- The value axis always includes zero, and reference line values (a target far above the data, for example) widen it. Up to about 100 ticks are generated at most (usually 4 to 7).
- Geometry (padding, bar width, label spacing) lives in `chartLayout.ts` as SVG units; every color, stroke, radius and font is a token.

## Example

```tsx
<Chart
  aria-label="Sales, last 30 days"
  type="bar"
  data={days.map((d) => ({ label: d.day, value: d.totalMinor }))}
  format={(v) => formatCurrency(v, 'USD', locale)}
  highlight={{ 29: 'Today', [bestIndex]: 'Best day' }}
  notes={{ [bestIndex]: 'Free shipping campaign started this day.' }}
  referenceLines={[
    { kind: 'average', label: 'Average', value: chartAverage(days.map((d) => d.totalMinor)) },
    { kind: 'target', label: 'Goal', value: 500000 },
  ]}
  tickEvery={7}
/>
```

## Differences from the handoff

- The SVG has an accessible name, description and a visually hidden data table.
- Focusable with arrow-key traversal and polite announcements instead of a mouse-only tooltip.
- Negative values, all-zero data and tiny maxima work (nice-number axis instead of `log10`).
- `highlight` is `index -> text` (was `index -> color`): the highlight has a text and shape cue. `color` is now `tone`.
- Bars use `line-control` instead of `line-strong` so they reach 3:1.
- Responsive label skipping is tested; `height` can be any CSS length.
