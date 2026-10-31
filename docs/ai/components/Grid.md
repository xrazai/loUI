# Grid

> A CSS grid with equal columns: a fixed `columns` count, or an auto-fill grid that keeps each
> item at least `minItemWidth` wide (the responsive choice for card grids). Gaps are space
> token keys.

A grid of equal columns: either a fixed number, or as many as fit with a minimum item width.

- Import: `import { Grid } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Grid/Grid.tsx`
- Stories (Storybook title `Layout/Grid`): Default, TwoColumns, AutoFillMedium, AutoFillSmall, AutoFillLarge, NarrowContainer, LongText, RightToLeft

## Props

| Prop           | Type                                                                                                                      | Required | Default | Description                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`      | `'1' \| '2' \| '3' \| '4' \| '5' \| '6' \| '7' \| '8' \| '9' \| '10' \| '11' \| '12'`                                     |          |         | A fixed number of equal columns (1 to 12). Items can shrink below their content width.                                                                                            |
| `minItemWidth` | `'sm' \| 'md' \| 'lg'`                                                                                                    |          |         | Fills the row with as many equal columns as fit, each at least this wide: `sm` 160px, `md` 240px, `lg` 320px (`--ds-grid-min-item-*`). Collapses to one column on narrow screens. |
| `gap`          | `'1' \| '2' \| '3' \| '4' \| '5' \| '6' \| '8' \| '12' \| '16'`                                                           |          | `'4'`   | Space between rows and columns, as a key of the space scale. Default `4`.                                                                                                         |
| `as`           | `'div' \| 'article' \| 'aside' \| 'footer' \| 'form' \| 'header' \| 'li' \| 'main' \| 'nav' \| 'ol' \| 'section' \| 'ul'` |          | `'div'` | Element to render, `div` by default. Use `ul` or `ol` for a list of `li` children: the list reset is applied and `role="list"` keeps the list semantics in Safari.                |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-grid-columns`, `--ds-grid-gap`, `--ds-grid-min-item-lg`, `--ds-grid-min-item-md`, `--ds-grid-min-item-sm`, `--ds-space-4`

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

## Related components

- Instead, see Stack: For one column of content: use `Stack`.
- Instead, see Inline: For a row that wraps and does not need aligned columns: use `Inline`.
- Instead, see DataTable: For tabular data: use `DataTable`.
