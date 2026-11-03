# DataTable

Status: experimental

A table of records with locale-aware sorting, row selection with a bulk action bar, clickable rows, client-side pagination, loading and empty states. Built on React Aria `Table`: a real `<table>` with grid keyboard navigation, `aria-sort` on sortable headers and labelled selection checkboxes.

## When to use

- Lists of records the user scans, sorts and acts on: orders, customers, invoices.
- Several columns of comparable data. For one line per record with a menu of actions use `ActionList`.

## When not to use

- Fewer than three columns, or content that is mostly text: use `ActionList` or a plain list.
- Server-side sorting and paging over very large data sets: control `sort` and `page` yourself and pass the page rows with `pageSize={false}` (virtualization is not provided).
- Layout: this is a data grid, not a layout table.

## Anatomy

```
div.root
  div[role=group]        bulk action bar (while rows are selected): "N selected", bulkActions, Clear selection
  div.scroll
    table[role=grid]     named by aria-label / aria-labelledby
      thead  th[aria-sort] caption-mono header per column (+ selection checkbox column)
      tbody  tr > td      row height --ds-row-h; active/selected: raised bg + 2px ink bar
  nav                    Pagination (only when there is more than one page)
  span[role=status]      visually hidden live region: "N selected" / "Loading rows"
```

## Props (key ones)

| Prop                                                         | Type                                          | Default | Notes                                                                                                                                                    |
| ------------------------------------------------------------ | --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`                                                    | `DataTableColumn<T>[]`                        | -       | `key`, `label`, `width`, `minWidth`, `truncate`, `hideLabel`, `align` (`start`/`end`), `mono`, `muted`, `sortable`, `sortValue`, `render`, `isRowHeader` |
| `rows`                                                       | `T[]`                                         | -       | Shown in the order given until the user sorts                                                                                                            |
| `rowKey`                                                     | `keyof T`                                     | `id`    | Unique id property; converted to a string                                                                                                                |
| `aria-label`                                                 | `string`                                      | -       | Required (or `aria-labelledby`)                                                                                                                          |
| `selectionMode`                                              | `none \| single \| multiple`                  | `none`  | Adds a checkbox column                                                                                                                                   |
| `selectedKeys` / `defaultSelectedKeys` / `onSelectionChange` | `ReadonlySet<string>`                         |         | Controlled / uncontrolled. Selection survives page changes                                                                                               |
| `bulkActions`                                                | `(keys, clear) => ReactNode`                  |         | Content of the bar shown while rows are selected                                                                                                         |
| `sort` / `defaultSort` / `onSortChange`                      | `{ key, direction: 'asc' \| 'desc' } \| null` | `null`  | Controlled / uncontrolled sort                                                                                                                           |
| `pageSize`                                                   | `number \| false`                             | `10`    | `false` disables pagination                                                                                                                              |
| `page` / `defaultPage` / `onPageChange`                      | `number`                                      | `1`     | Controlled / uncontrolled page                                                                                                                           |
| `onRowAction`                                                | `(row) => void`                               |         | Row click or Enter. Adds hover style and pointer cursor. A `Button` in a cell does not trigger it (see "Buttons inside cells")                           |
| `activeKey`                                                  | `string`                                      |         | Row open elsewhere (raised background + ink bar)                                                                                                         |
| `isLoading`                                                  | `boolean`                                     | `false` | Skeleton rows (`loadingRowCount`, default 5) and a live "Loading rows"                                                                                   |
| `emptyState`                                                 | `ReactNode`                                   |         | Default: `EmptyState` with built-in text                                                                                                                 |
| `reserveBulkBarSpace`                                        | `boolean`                                     | `true`  | Keeps the bulk bar space free so the table does not jump when the first row is selected                                                                  |
| `stickyHeader`, `maxHeight`                                  | `boolean`, `number \| string`                 |         | With `maxHeight` the body scrolls and the header stays; without it the header sticks to the page scroll                                                  |
| `messages`                                                   | `Partial<messages>`                           |         | Per-instance text overrides                                                                                                                              |

## Column sizing

| Column prop | Type      | Default | Effect                                                                                                                                     |
| ----------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `width`     | `string`  | -       | CSS width (`96px`, `20%`). Columns without it share the remaining space equally                                                            |
| `minWidth`  | `string`  | -       | CSS minimum width (`120px`, `8rem`). The column is never narrower; a container that is too small scrolls horizontally instead of squashing |
| `truncate`  | `boolean` | `true`  | `true`: header and cells stay on one line and end in an ellipsis. `false`: they wrap and the row grows                                     |
| `hideLabel` | `boolean` | `false` | Hides the header text visually (icon-only or action columns). `label` stays the accessible name                                            |

- Both sizes go through CSS custom properties on the header cell (`--ds-data-table-col-w`, `--ds-data-table-col-min-w`). Browsers ignore `min-width` on cells in a fixed table layout, so when any column has a `minWidth` the table gets a minimum width (`--ds-data-table-min-w`): the sum of every column's own minimum (fixed columns at the larger of `width` and `minWidth`, flexible columns at their `minWidth`, a flexible column without `minWidth` at 0). Without any `minWidth` the layout is unchanged.
- **Flexible columns keep their own minimum.** Each flexible column is its `minWidth` plus an equal share of the space left after all minimums. Example in a 1000px container with `Order` (`width: 100px`), `Customer` (`minWidth: 240px`), `Status` (`minWidth: 80px`) and `Total` (no `minWidth`): 580px is left, so the widths are 100, 433, 273 and 193px. In a 200px container the table is 420px wide and scrolls: 100, 240, 80 and just the cell padding for `Total`. Give every flexible column that must stay readable a `minWidth`.
- Use fixed units (`px`, `rem`) for `width` and `minWidth` in a table with a `minWidth` column; percentages are not part of the minimum calculation. The scroll area is a size container (`container-type: inline-size`) because browsers treat a `calc()` mixing a percentage as `auto` in a fixed table layout; a container unit is a plain length.
- An empty table (no rows, not loading) drops the table minimum width, so the empty state never scrolls sideways. The header stays visible and its labels are cut with an ellipsis.
- A table with a `minWidth` column scrolls horizontally inside its own area (`overflow-x: auto`). A sticky header then sticks to that area, so also set `maxHeight` when using `stickyHeader`.
- Use `minWidth` for content that breaks when squeezed: a row of swatches, a badge, a code. A column with both `width` and `minWidth` is as wide as the larger of the two.
- Truncated text is not lost: the full text stays in the DOM (assistive technology reads it) and the truncated header label carries a `title`. Prefer `truncate: false` over a long truncated value that users need to read.
- **Headers never wrap by default.** The mono uppercase caption style is cut with an ellipsis in a narrow column ("SUPPL…"). Either give the column a `minWidth` that fits the label, or set `truncate: false` to allow a two-line header.
- **Icon-only columns:** set `hideLabel: true` and `sortable: false`. The header cell is named by `label` ("Row actions"), so a screen reader still announces it; never leave the label empty.

## Sorting

- Pressing a sortable header cycles **ascending, descending, none**. `aria-sort` is `ascending`, `descending` or `none` on the header cell.
- Strings use `compareText` for the active locale: accent- and case-insensitive, natural number order (`Item 2` before `Item 10`). Numbers, booleans and dates compare numerically; numbers come before strings.
- The sort is **stable in both directions**: equal rows keep the order you passed (descending is not a reversed array). Empty values (`null`, `undefined`, `NaN`, invalid dates) always come last.
- Sorting covers all rows, not just the current page; the page returns to 1 when the sort or the set of rows changes (a new array with the same row ids does not reset the page).
- Use `sortValue` when the displayed text differs from the value to sort by, `sortable: false` for columns that are not a property of the row.

### Alphabetical by default

Lists are alphabetical by default in this design system (AGENTS.md rule 5b; exceptions: tasks by urgency, dated records newest first). The table does not reorder rows on its own. Either pass rows already ordered, or set `defaultSort={{ key: 'customer', direction: 'asc' }}` (see the `AlphabeticalByDefault` story).

## Selection

- Checkboxes are named "Select row {row header text}" and "Select all rows on this page"; the row header is the column marked `isRowHeader` (default: the first column), so choose the most descriptive one.
- "Select all" applies to the rows on the current page. Selection of other pages is kept. `bulkActions` receives only ids that still exist in `rows`.
- The bulk bar shows "N selected" (plural-aware) and a "Clear selection" button. A visually hidden polite `status` announces the count as it changes.
- `single` mode shows a checkbox per row but no select-all.

## Buttons inside cells

A `Button` inside a cell handles its own press: the press does **not** also trigger `onRowAction` (covered by a test). This is a design decision, not a bug: a row can open a detail panel while its buttons run their own action ("Archive", "Open menu"). Keep the row action and the cell action distinct, give the Button an accessible name that includes the row ("Archive ORD-1001"), and do not repeat the row action in a Button.

## Accessibility

- Grid keyboard model from React Aria: `Tab` enters the table (first row), arrow keys move between cells, rows and the header (Arrow Up from the first row), `Enter` or `Space` on a sortable header sorts, `Space` on a selection checkbox toggles, `Enter` on a row runs `onRowAction`, `Tab` leaves the table.
- Sortable headers expose `aria-sort`; the sort icon is decorative. Active sorted headers also use a stronger color, never color alone.
- Selection state is `aria-selected` on rows and the checked state of the checkboxes; the count is text.
- While loading the root has `aria-busy`, skeleton rows are not selectable and the first cell of each carries visually hidden "Loading rows".
- Forced colors: selected and active rows keep the bar (system `Highlight`); focus rings are outlines.
- Not provided: `aria-rowcount`/`aria-rowindex` for the rows of other pages (React Aria derives them from the rendered page). Pagination announces the range ("11–20 of 42").

## Content rules

- Column labels in sentence case; CSS applies the uppercase mono caption style.
- Bulk actions are verb + object ("Archive orders"); destructive ones still confirm in a dialog.
- Empty text says what happened and what to do ("No records found. Try another filter or search term.").

## Examples

```tsx
<DataTable
  aria-label="Orders"
  rows={orders}
  rowKey="id"
  defaultSort={{ key: 'customer', direction: 'asc' }}
  selectionMode="multiple"
  columns={[
    { key: 'id', label: 'Order', width: '120px', mono: true, muted: true },
    { key: 'customer', label: 'Customer', isRowHeader: true },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (r) => <Badge tone="success">{r.status}</Badge>,
    },
    {
      key: 'total',
      label: 'Total',
      width: '120px',
      align: 'end',
      mono: true,
      render: (r) => formatCurrency(r.total, 'USD', locale),
    },
  ]}
  bulkActions={(keys, clear) => (
    <Button
      size="sm"
      onPress={() => {
        archive(keys);
        clear();
      }}
    >
      Archive orders
    </Button>
  )}
  onRowAction={(row) => openOrder(row.id)}
/>
```

## Differences from the handoff

- A real `<table>` (React Aria `Table`) instead of a CSS grid of `div`s: proper `rowgroup`, `columnheader`, `rowheader`, `aria-sort`, `aria-selected`; no `role` override on a button.
- Sorting is locale-aware and stable; cycling ends in "none"; `useMemo` dependencies are complete.
- `defaultSort` takes `{ key, direction }` (was `{ key, dir }`); `onRowClick` is `onRowAction`; `selectable` is `selectionMode`; `align` is `start`/`end` (logical, RTL-safe); `bulkActions` receives a `Set`.
- Selection and sort/page state are controllable; selection persists across pages; the page resets on sort or data change.
- Checkboxes are labelled from messages; selection count is a live region with plural messages.
- Loading (skeleton rows), empty (default `EmptyState`) and sticky header are built in.
- Column visibility, column resizing and virtualization are not included.
