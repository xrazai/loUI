# MatrixGrid

> A matrix of toggle cells: rows by columns, each cell linking or unlinking one row with one
> column. It is an ARIA `grid` with roving focus: the grid is one tab stop, the arrow keys move
> between cells (`Home` / `End` within a row, `Ctrl+Home` / `Ctrl+End` to the first / last
> cell), and `Space` or `Enter` toggles. Arrow keys follow the reading direction.

Each cell is a button named "{row} · {column}: linked" / "not linked" (messages). The grid
scrolls horizontally inside a labelled, focusable region.

Import it from `@loui/ds/patterns`.

A rows-by-columns matrix of toggle cells, where each cell links or unlinks one row with one column (for example which colors a product comes in). It is an ARIA `grid` with roving focus and full arrow-key navigation. Import it from `@loui/ds/patterns`.

- Handoff source: `components/erp/MatrixGrid.jsx` (TODO `CMP-PAT-11`).

- Import: `import { MatrixGrid } from '@loui/ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/MatrixGrid/MatrixGrid.tsx`
- Stories (Storybook title `Patterns/MatrixGrid`): Default, WithCountAndHint, CheckContrast, WithoutColors, ManyColumns, LongLabels, Empty, KeyboardNavigation, Portuguese, RightToLeft, Focused

## Props

| Prop          | Type                                                                                                                                      | Required | Default | Description                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| `aria-label`  | `string`                                                                                                                                  | yes      |         | Accessible name of the grid ("Product colors"). The scroll region around it is named from it too. |
| `rows`        | `readonly MatrixGridRow[]`                                                                                                                | yes      |         | The rows, in display order. Sort them yourself (alphabetically by default).                       |
| `columns`     | `readonly MatrixGridColumn[]`                                                                                                             | yes      |         | The columns, in display order.                                                                    |
| `isLinked`    | `(rowId: string, columnId: string) => boolean`                                                                                            | yes      |         | Whether a row and a column are linked. Called for every cell on each render; keep it cheap.       |
| `onToggle`    | `(rowId: string, columnId: string) => void`                                                                                               | yes      |         | Called with the row and column ids when the user toggles a cell. Update your state in it.         |
| `cornerLabel` | `string`                                                                                                                                  |          |         | Caption of the first (row header) column. Without it a visually hidden "Row" is used.             |
| `countLabel`  | `string`                                                                                                                                  |          |         | Adds a last column with the number of linked cells per row; this is its header ("Linked").        |
| `hint`        | `ReactNode`                                                                                                                               |          |         | Help text under the grid, linked to it with `aria-describedby`.                                   |
| `messages`    | `Partial<{ cell: (row: string, column: string, linked: boolean) => string; scrollRegion: (name: string) => string; rowHeader: string; }>` |          |         | Message overrides for this instance.                                                              |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ MatrixGrid: { ... } }}>`.

| Key                                                  | English default                | Notes                                                                                      |
| ---------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `cell(row: string, column: string, linked: boolean)` | `{row} · {column}: not linked` | Accessible name of a toggle cell: the row, the column and the state of the link.           |
| `scrollRegion(name: string)`                         | `{name}, scrollable`           | Accessible name of the focusable scroll region around the grid. `name` is the grid's name. |
| `rowHeader`                                          | `Row`                          | Hidden header text of the first column when no `cornerLabel` is given.                     |

## Design tokens used

`--ds-accent`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-line`, `--ds-line-control`, `--ds-line-subtle`, `--ds-matrix-grid-cell-size`, `--ds-matrix-grid-color`, `--ds-matrix-grid-column-width`, `--ds-matrix-grid-columns`, `--ds-matrix-grid-count-width`, `--ds-matrix-grid-label-width`, `--ds-matrix-grid-padding-inline`, `--ds-matrix-grid-row-min-height`, `--ds-radius-lg`, `--ds-radius-md`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-row-hover`, `--ds-swatch-ring`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-text-inverse`, `--ds-tracking-caption`, `--ds-weight-medium`

## When to use

- Editing many-to-many relations where seeing the whole matrix helps (items by options, users by roles, products by regions).
- When every cell is a quick on/off decision.

## When not to use

- Reading or sorting data: use a table (`DataTable`).
- One list of independent switches: use `CheckboxGroup` or `Switch`.
- Very large matrices (hundreds of rows): this component renders every cell.

## Anatomy

```
div.root
  div[role=region] aria-label="… scrollable" tabindex=0      (horizontal scroll)
    div[role=grid] aria-label aria-describedby=hint
      div[role=row]
        columnheader (corner caption) · columnheader (swatch + label) × N · columnheader (count)
      div[role=row] × rows
        rowheader (label + meta) · gridcell > button "{row} · {column}: linked" × N · gridcell (count)
  p.hint
```

## Accessibility

- Semantics: `region` (focusable scroll container) > `grid` > `row` > `columnheader` / `rowheader` / `gridcell`. Each cell holds a native button named "{row} · {column}: linked" or "not linked" (messages, `en` and `pt-BR`); the state is in the name, so there is no separate `aria-pressed`.
- Keyboard: the grid is one tab stop (roving tabindex; the scroll region is the stop before it). `←` `→` `↑` `↓` move one cell (horizontal arrows follow the reading direction and stop at the edges); `Home` / `End` go to the first / last cell of the row; `Ctrl+Home` / `Ctrl+End` to the first / last cell of the grid; `Space` and `Enter` toggle.
- Linked state is not color alone: linked cells are solid with a check, unlinked cells are dashed with a plus; the name says it too.
- The check color is chosen with `readableTextOn` (WCAG relative luminance) on the column color, and the choice is tested at 3:1 for a set of colors.
- Targets are 40x40px (the minimum is 24px). Unlinked cell borders use `--ds-line-control` (3:1).
- Motion: the hover scale (1.06) exists only inside `@media (hover: hover) and (prefers-reduced-motion: no-preference)`.
- Forced colors: borders use `ButtonText`, linked cells `Highlight`.

## Content rules

- Row and column labels are short nouns in sentence case; they are read in every cell name, so keep them unique within their axis.
- `countLabel` names what is counted ("Linked", "Colors").

## Examples

```tsx
import { MatrixGrid } from '@loui/ds/patterns';

<MatrixGrid
  aria-label="Product colors"
  cornerLabel="Product"
  countLabel="Linked"
  rows={products}
  columns={[{ id: 'navy', label: 'Navy', color: '#1f3a93' }]}
  isLinked={(productId, colorId) => links.has(`${productId}:${colorId}`)}
  onToggle={toggleLink}
  hint="Select a cell to link or unlink a color."
/>;
```

## Related components

- Instead, see DataTable: Reading or sorting data: use a table (`DataTable`).
- Instead, see CheckboxGroup: One list of independent switches: use `CheckboxGroup` or `Switch`.
- Instead, see Switch: One list of independent switches: use `CheckboxGroup` or `Switch`.
- Renders: Icon, Swatch, VisuallyHidden
