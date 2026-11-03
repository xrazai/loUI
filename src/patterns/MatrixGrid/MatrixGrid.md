# MatrixGrid

Status: experimental

A rows-by-columns matrix of toggle cells, where each cell links or unlinks one row with one column (for example which colors a product comes in). It is an ARIA `grid` with roving focus and full arrow-key navigation. Import it from `loui-ds/patterns`.

- Handoff source: `components/erp/MatrixGrid.jsx` (TODO `CMP-PAT-11`).

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

## Props

| Prop          | Type                           | Default      | Notes                                                                 |
| ------------- | ------------------------------ | ------------ | --------------------------------------------------------------------- |
| `aria-label`  | `string`                       | required     | Names the grid; the scroll region is named "{label}, scrollable".     |
| `rows`        | `{ id, label, meta? }[]`       | required     | Display order is yours (sort alphabetically by default).              |
| `columns`     | `{ id, label, color? }[]`      | required     | `color` is `#rgb` / `#rrggbb`; fills linked cells and shows a swatch. |
| `isLinked`    | `(rowId, columnId) => boolean` | required     | Source of truth is yours.                                             |
| `onToggle`    | `(rowId, columnId) => void \| Promise` | required | Update your state here. A returned promise gives the cell a pending state. |
| `onToggleError` | `(error, rowId, columnId) => void` | none | Runs when the promise from `onToggle` rejects. |
| `cornerLabel` | `string`                       | hidden "Row" | Caption of the row header column.                                     |
| `countLabel`  | `string`                       | none         | Adds a count column ("Linked") with the per-row number of links.      |
| `hint`        | `ReactNode`                    | none         | Help text under the grid, linked with `aria-describedby`.             |

## Async toggle, sticky headers and focus guides

- **Async toggle.** `onToggle` may return a promise (saving the link on a server). While it is pending the cell is `aria-busy` (on the `gridcell`), shows a small spinner, is named "{row} · {column}: linked, saving" (message `cellPending`) and ignores further toggles; focus stays on it and other cells keep working. The grid never flips a cell by itself: it shows what `isLinked` says. If you update your state optimistically, revert it in `onToggleError`, which runs when the promise rejects (also when `onToggle` throws). Use it for a toast: `onToggleError={() => toast.error('Could not save the link')}`. The grid also announces "Couldn't update {row} · {column}. Try again." in a visually hidden `role="status"` (message `toggleFailed`).
- **Sticky headers.** The column header row and the row header column are `position: sticky`; the corner sits above both. For vertical scrolling give the root a height or `max-block-size` through `className` / `style` (the scroll region fills it). `scroll-padding` keeps a focused cell out from behind the sticky parts (WCAG 2.4.11).
- **Focus guides.** While a cell has focus, its row, its column and the column header get one surface step (`--ds-surface-row-hover`). It is a visual aid only: the focus ring and the cell name carry the meaning, nothing changes in the accessibility tree.

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
import { MatrixGrid } from 'loui-ds/patterns';

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

## Differences from the handoff

- Plain `div`s with `aria-pressed` buttons become an ARIA grid with arrow-key navigation and roving focus; the handoff had only Tab through every cell.
- The mouse-only Portuguese `title` tooltip is replaced by an accessible name from messages.
- The 0.299/0.587/0.114 luma shortcut is replaced by `readableTextOn` (WCAG 2.x contrast).
- The scroll container is a labelled, focusable region.
- Sizes (cell 40, column 64, label 220, count 64, row 60) are tokens `--ds-matrix-grid-*`; `labelWidth` and `cell` props are gone. Column colors are applied via the `--ds-matrix-grid-color` custom property, not inline fills.
- The hover scale respects reduced motion. Column headers use a decorative `Swatch`.
