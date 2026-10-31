# Sparkline

Status: experimental

A tiny trend line (or area) without axes, drawn in SVG, for tables, stat cards and lists. It shows the shape of a series, not its values: put the current number next to it.

- TODO `GAP-007`.

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

## Props

| Prop                             | Type                                                          | Default      | Notes                                                                                |
| -------------------------------- | ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `data`                           | `(number \| null \| undefined)[]`                             | required     | Values in display order. `null`, `undefined`, `NaN` and `Infinity` are gaps.         |
| `aria-label` / `aria-labelledby` | `string`                                                      | one of three | A text summary of the trend. Required unless `decorative`. Enforced by the types.    |
| `decorative`                     | `true`                                                        | none         | Hides it from assistive technology. Only when the same facts are written next to it. |
| `variant`                        | `'line' \| 'area'`                                            | `'line'`     | `area` fills softly under the line.                                                  |
| `tone`                           | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'neutral'`  | Color of the line. Never the only signal.                                            |
| `width` / `height`               | `number`                                                      | 96 / 24      | Size in px. Shrinks to a narrower container, keeping its aspect ratio.               |
| `showLast`                       | `boolean`                                                     | `false`      | Solid dot on the last value.                                                         |
| `showMinMax`                     | `boolean`                                                     | `false`      | Hollow rings on the lowest and the highest value (not drawn when all are equal).     |
| `includeZero`                    | `boolean`                                                     | `false`      | Keeps 0 in the vertical range. Default: the data's own min to max.                   |

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
