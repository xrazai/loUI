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

## Differences from the handoff

- The SVG has an accessible name, description and a visually hidden data table.
- Focusable with arrow-key traversal and polite announcements instead of a mouse-only tooltip.
- Negative values, all-zero data and tiny maxima work (nice-number axis instead of `log10`).
- `highlight` is `index -> text` (was `index -> color`): the highlight has a text and shape cue. `color` is now `tone`.
- Bars use `line-control` instead of `line-strong` so they reach 3:1.
- Responsive label skipping is tested; `height` can be any CSS length.
