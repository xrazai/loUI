# Sparkline

> A tiny trend line (or area) without axes, drawn in SVG, for tables, stat cards and lists. It
> shows the shape of a series, not its values: put the current number next to it.

It is an image with a required text summary (`aria-label`), or `decorative` when the same
information is written next to it. It is not interactive and not focusable. The vertical
range is the data's own minimum to maximum, so a small change on a large number still
shows; use `Chart` when readers need axes, values per point or zero as a reference.

A tiny trend line (or area) without axes, drawn in SVG, for tables, stat cards and lists. It shows the shape of a series, not its values: put the current number next to it.

- TODO `GAP-007`.

- Import: `import { Sparkline } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Sparkline/Sparkline.tsx`
- Stories (Storybook title `Components/Sparkline`): Default, Area, Accent, Success, Warning, Danger, LastValue, MinMax, Larger, IncludeZero, FlatSeries, WithGaps, SinglePoint, Empty, Decorative, NarrowContainer, RightToLeft

## Props

| Prop              | Type                                                          | Required | Default     | Description                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`            | `readonly (number \| null \| undefined)[]`                    | yes      |             | The values in display order, usually time. `null`, `undefined` and non-finite numbers are gaps: the line breaks there. An empty array draws nothing.                               |
| `variant`         | `'area' \| 'line'`                                            |          | `'line'`    | `line` (default) or `area`, which also fills softly under the line.                                                                                                                |
| `tone`            | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |          | `'neutral'` | Color of the line: `neutral` (default), `accent`, `success`, `warning` or `danger`. Color is never the only signal: say what the trend means in the accessible name or next to it. |
| `width`           | `number`                                                      |          | `96`        | Width in px (user units). Shrinks to fit a narrower container. Default 96.                                                                                                         |
| `height`          | `number`                                                      |          | `24`        | Height in px (user units). Default 24.                                                                                                                                             |
| `showLast`        | `boolean`                                                     |          | `false`     | Draws a solid dot on the last value, the current one.                                                                                                                              |
| `showMinMax`      | `boolean`                                                     |          | `false`     | Draws hollow markers on the lowest and the highest value (omitted when all values are equal).                                                                                      |
| `includeZero`     | `boolean`                                                     |          | `false`     | Keeps 0 in the vertical range. Default: the range is the data's own minimum to maximum.                                                                                            |
| `className`       | `string`                                                      |          |             |                                                                                                                                                                                    |
| `aria-label`      | `string`                                                      |          |             | Summary of the trend, required unless `decorative` or `aria-labelledby`: "Revenue, last 7 days: up 12%".                                                                           |
| `aria-labelledby` | `string`                                                      |          |             | Id of the element that summarizes the trend.                                                                                                                                       |
| `decorative`      | `boolean`                                                     |          | `false`     | Hides the sparkline from assistive technology. Use it only when the same information is in text next to it (a number and "+12%"): the line alone is never the only source.         |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `area`, `line`
- `tone`: `neutral`, `accent`, `success`, `warning`, `danger`

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-danger`, `--ds-sparkline-area-opacity`, `--ds-sparkline-color`, `--ds-sparkline-dot-r`, `--ds-sparkline-marker-r`, `--ds-sparkline-stroke-w`, `--ds-success`, `--ds-text-2`, `--ds-warning`

## When to use

- Next to a number in a `StatCard`, a table row or a list item, to show the recent trend.
- When the shape matters more than exact values.

## When not to use

- When readers need axes, values per point or keyboard exploration: use `Chart`.
- To show a quantity within a range: use `Meter` or `DonutMeter`.
- As the only place a number appears: the sparkline is a summary, not a source.

## Anatomy

```
svg[role=img] aria-label            (or aria-hidden when decorative)
  path.area                         (variant="area" only)
  path.line                         (one per run of values, a gap starts a new one)
  circle.marker[min|max]            (showMinMax: hollow rings)
  circle.last                       (showLast: solid dot)
```

## Accessibility

- It is an `img` with a required text summary: say what a sighted reader sees, with the numbers that matter ("Orders, last 7 days: up 12%"). Use `decorative` only when that text is already next to the sparkline.
- It is not focusable and not interactive; there are no tooltips. For exploration use `Chart`.
- Color is never the only signal: tone changes the line color, the trend must be in the name or next to it. Min and max are hollow rings and the last value is a solid dot, so they differ by shape.
- Line, markers and area use `--ds-text-2` or a signal color (3:1 or better on the dark surfaces). Forced colors: everything is drawn in `CanvasText`.
- Under 200% zoom and in narrow containers it shrinks with the container.

## Content rules

- Summaries are one short sentence in sentence case with the period and the direction: "Revenue, last 30 days: up 8%".

## Differences from `Chart`

The vertical range is the data's own minimum to maximum, not a "nice" axis that includes zero (`niceScale`), because a trend line on `98, 100, 102` must not be flattened. For that reason `niceScale` and the `Chart` layout helpers are not reused; the geometry lives in `sparklineLayout.ts` and is unit tested.

## Examples

```tsx
<Sparkline data={daily} aria-label="Orders, last 7 days: up 12%" tone="success" showLast />

<p>
  Orders 1,248 <Sparkline data={daily} decorative /> +12%
</p>
```

## Related components

- Instead, see Chart: When readers need axes, values per point or keyboard exploration: use `Chart`.
- Instead, see Meter: To show a quantity within a range: use `Meter` or `DonutMeter`.
- Instead, see DonutMeter: To show a quantity within a range: use `Meter` or `DonutMeter`.
