# Grid

Status: experimental

A grid of equal columns: either a fixed number, or as many as fit with a minimum item width.

## When to use

- A page of cards or stats: `minItemWidth` reflows from many columns to one without media queries.
- A form laid out in two or three equal columns: `columns`.

## When not to use

- For one column of content: use `Stack`.
- For a row that wraps and does not need aligned columns: use `Inline`.
- For tabular data: use `DataTable`.

## Anatomy

```
div (grid, gap)
  children (one per cell)
```

## Props

| Prop           | Type                                                                          | Default | Notes                                                                    |
| -------------- | ----------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `columns`      | `1` to `12`                                                                   |         | Fixed equal columns. Pass this **or** `minItemWidth`                     |
| `minItemWidth` | `'sm' \| 'md' \| 'lg'`                                                        |         | Auto-fill; items are at least 160 / 240 / 320px (`--ds-grid-min-item-*`) |
| `gap`          | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 12 \| 16` or the same as a string (`"4"`) | `4`     | Space token key, used for rows and columns                               |
| `as`           | `'div' \| 'ul' \| 'ol' …`                                                     | `'div'` | Lists get the reset and `role="list"`                                    |

The types make `columns` and `minItemWidth` exclusive. Item widths are tokens, not pixels, like the gap.

## Responsive behavior

- `minItemWidth` uses `repeat(auto-fill, minmax(min(<width>, 100%), 1fr))`: in a container narrower than the minimum, the grid is one column and never overflows.
- `columns` does not collapse by itself. For a layout that changes by screen size, prefer `minItemWidth`, or switch `columns` from the app with a media query or `useMediaQuery`.

## Accessibility

- No semantics of its own; use `as="ul"` when the cells are list items.
- Source order is visual order for the row-first reading direction. Do not rely on CSS placement to reorder content.
- Cells can shrink (`minmax(0, 1fr)`), so long words wrap instead of widening a column.

## Examples

```tsx
<Grid minItemWidth="md" gap={4}>
  <StatCard … />
  <StatCard … />
  <StatCard … />
</Grid>

<Grid columns={2} gap={4}>
  <Input label="First name" />
  <Input label="Last name" />
</Grid>
```

## Differences from the handoff

- The handoff hard-coded `grid-template-columns: repeat(N, 1fr)` per screen with raw pixel gaps and a 1180px minimum width. Here the minimum item width is a token and nothing needs a minimum viewport.
