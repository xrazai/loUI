# DataTable

> A data table with locale-aware sorting, row selection with a bulk action bar, client-side
> pagination, loading and empty states. Built on React Aria `Table` (a real `<table>` with
> grid keyboard navigation): the header cell of a sortable column is a press target with
> `aria-sort`, and the selection checkboxes are labelled.

Sorting cycles ascending, descending, none, and is stable: rows that compare equal keep the
order you passed. Strings compare with the active locale (accent- and case-insensitive,
natural number order), numbers numerically. The table never reorders rows on its own;
lists are alphabetical by default in this design system, so pass sorted rows or `defaultSort`.

A table of records with locale-aware sorting, row selection with a bulk action bar, clickable rows, client-side pagination, loading and empty states. Built on React Aria `Table`: a real `<table>` with grid keyboard navigation, `aria-sort` on sortable headers and labelled selection checkboxes.

- Import: `import { DataTable } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/DataTable/DataTable.tsx`
- Stories (Storybook title `Components/DataTable`): Default, AlphabeticalByDefault, Sorting, KeyboardSort, Selection, SelectAllOnPage, KeyboardSelection, SingleSelection, Paginated, ClickableRows, SelectionAndRowAction, Loading, Empty, CustomEmpty, StickyHeader, LongText, Controlled, PortugueseBrazil

## Props

| Prop                  | Type                                                                                                                                                                                                                                             | Required | Default                    | Description                                                                                                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`             | `readonly DataTableColumn<T>[]`                                                                                                                                                                                                                  | yes      |                            | Column definitions, in display order.                                                                                                                                                                                                                               |
| `rows`                | `readonly T[]`                                                                                                                                                                                                                                   | yes      |                            | The rows, in the order you want them shown until the user sorts. Lists are alphabetical by default in this design system (AGENTS.md rule 5b): sort the rows before passing them, or pass `defaultSort` for a text column. The table never reorders rows on its own. |
| `rowKey`              | `string`                                                                                                                                                                                                                                         |          | `'id' as keyof T & string` | Property of a row that holds its unique id. Default `id`. The value is converted to a string.                                                                                                                                                                       |
| `selectionMode`       | `'none' \| 'single' \| 'multiple'`                                                                                                                                                                                                               |          | `'none'`                   | `none` (default), `single` or `multiple`. Selecting adds a checkbox column.                                                                                                                                                                                         |
| `selectedKeys`        | `ReadonlySet<string>`                                                                                                                                                                                                                            |          |                            | Selected row ids (controlled). Selection survives page changes; "select all" applies to the rows of the current page.                                                                                                                                               |
| `defaultSelectedKeys` | `ReadonlySet<string>`                                                                                                                                                                                                                            |          |                            | Selected row ids when uncontrolled.                                                                                                                                                                                                                                 |
| `onSelectionChange`   | `(keys: ReadonlySet<string>) => void`                                                                                                                                                                                                            |          |                            | Called with the new set of selected row ids.                                                                                                                                                                                                                        |
| `bulkActions`         | `(selectedKeys: ReadonlySet<string>, clear: () => void) => ReactNode`                                                                                                                                                                            |          |                            | Content of the bulk action bar, shown while rows are selected: usually small `Button`s. `clear` empties the selection.                                                                                                                                              |
| `sort`                | `DataTableSort \| null`                                                                                                                                                                                                                          |          |                            | Current sort (controlled). `null` means no sort.                                                                                                                                                                                                                    |
| `defaultSort`         | `DataTableSort \| null`                                                                                                                                                                                                                          |          |                            | Sort applied first when uncontrolled, for example `{ key: 'customer', direction: 'asc' }`.                                                                                                                                                                          |
| `onSortChange`        | `(sort: DataTableSort \| null) => void`                                                                                                                                                                                                          |          |                            | Called when the user changes the sort. Header presses cycle ascending, descending, none.                                                                                                                                                                            |
| `pageSize`            | `number \| false`                                                                                                                                                                                                                                |          | `10`                       | Rows per page; `false` shows all rows without pagination. Default `10`. Pagination appears only when there is more than one page.                                                                                                                                   |
| `page`                | `number`                                                                                                                                                                                                                                         |          |                            | Current page, 1-based (controlled).                                                                                                                                                                                                                                 |
| `defaultPage`         | `number`                                                                                                                                                                                                                                         |          | `1`                        | Page shown first when uncontrolled. Default `1`. The page returns to 1 when the sort or the set of rows changes.                                                                                                                                                    |
| `onPageChange`        | `(page: number) => void`                                                                                                                                                                                                                         |          |                            | Called with the new page.                                                                                                                                                                                                                                           |
| `onRowAction`         | `(row: T) => void`                                                                                                                                                                                                                               |          |                            | Called when the user activates a row (click, or Enter on the focused row). Adds a pointer cursor and hover style.                                                                                                                                                   |
| `activeKey`           | `string`                                                                                                                                                                                                                                         |          |                            | Id of the active row (for example the one open in a side sheet). It gets the raised background and the ink bar.                                                                                                                                                     |
| `isLoading`           | `boolean`                                                                                                                                                                                                                                        |          | `false`                    | Replaces the rows with skeleton rows and announces "Loading rows".                                                                                                                                                                                                  |
| `loadingRowCount`     | `number`                                                                                                                                                                                                                                         |          | `5`                        | Number of skeleton rows while loading. Default `5`.                                                                                                                                                                                                                 |
| `emptyState`          | `ReactNode`                                                                                                                                                                                                                                      |          |                            | Content when there are no rows. Default: an `EmptyState` with built-in text.                                                                                                                                                                                        |
| `reserveBulkBarSpace` | `boolean`                                                                                                                                                                                                                                        |          | `true`                     | Keeps the space of the bulk action bar free while nothing is selected, so the table does not jump down when the first row is selected (fixed positions). Turn off to let the table move up. Default `true`; only applies when `selectionMode` is not `none`.        |
| `stickyHeader`        | `boolean`                                                                                                                                                                                                                                        |          | `false`                    | Keeps the header visible while the body scrolls. Set `maxHeight` to scroll inside the table; without it the header sticks to the page scroll.                                                                                                                       |
| `maxHeight`           | `string \| number`                                                                                                                                                                                                                               |          |                            | Maximum height of the table area before it scrolls (a number is px, or any CSS length).                                                                                                                                                                             |
| `messages`            | `Partial<{ selectRow: string; selection: string; selectAll: string; selectedCount: (count: number, formatted: string) => string; clearSelection: string; bulkActions: string; loading: string; emptyTitle: string; emptyDescription: string; }>` |          |                            | Per-instance overrides of the built-in messages.                                                                                                                                                                                                                    |
| `aria-label`          | `string`                                                                                                                                                                                                                                         |          |                            | Accessible name of the table. Required unless `aria-labelledby` is set.                                                                                                                                                                                             |
| `aria-labelledby`     | `string`                                                                                                                                                                                                                                         |          |                            | Id of the element that names the table (a visible heading).                                                                                                                                                                                                         |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ DataTable: { ... } }}>`.

| Key                                               | English default                      | Notes                                                                                                                             |
| ------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `selectRow`                                       | `Select row`                         | Accessible name of the checkbox that selects one row. React Aria appends the row name (see `getRowLabel`): "Select row ORD-1001". |
| `selection`                                       | `Selection`                          | Hidden header text of the selection column in `single` mode, where there is no select-all checkbox.                               |
| `selectAll`                                       | `Select all rows on this page`       | Accessible name of the header checkbox. It selects the rows on the current page.                                                  |
| `selectedCount(count: number, formatted: string)` | `{formatted} selected`               | Visible and announced selection summary. `formatted` is `count` formatted for the locale.                                         |
| `clearSelection`                                  | `Clear selection`                    | Button of the bulk action bar that clears the selection.                                                                          |
| `bulkActions`                                     | `Actions for selected rows`          | Accessible name of the bulk action bar.                                                                                           |
| `loading`                                         | `Loading rows`                       | Announced while the table shows loading rows.                                                                                     |
| `emptyTitle`                                      | `No records found`                   | Title of the default empty state.                                                                                                 |
| `emptyDescription`                                | `Try another filter or search term.` | Description of the default empty state.                                                                                           |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-data-table-active-bar-w`, `--ds-data-table-bulk-bar-h`, `--ds-data-table-cell-padding-inline`, `--ds-data-table-col-w`, `--ds-data-table-gap`, `--ds-data-table-header-padding-block`, `--ds-data-table-max-h`, `--ds-data-table-selection-col-w`, `--ds-data-table-sticky-z-index`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-line-subtle`, `--ds-radius-md`, `--ds-row-h`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface-raised`, `--ds-surface-row-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-weight-medium`

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

| Prop                                                         | Type                                          | Default | Notes                                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `columns`                                                    | `DataTableColumn<T>[]`                        | -       | `key`, `label`, `width`, `align` (`start`/`end`), `mono`, `muted`, `sortable`, `sortValue`, `render`    |
| `rows`                                                       | `T[]`                                         | -       | Shown in the order given until the user sorts                                                           |
| `rowKey`                                                     | `keyof T`                                     | `id`    | Unique id property; converted to a string                                                               |
| `aria-label`                                                 | `string`                                      | -       | Required (or `aria-labelledby`)                                                                         |
| `selectionMode`                                              | `none \| single \| multiple`                  | `none`  | Adds a checkbox column                                                                                  |
| `selectedKeys` / `defaultSelectedKeys` / `onSelectionChange` | `ReadonlySet<string>`                         |         | Controlled / uncontrolled. Selection survives page changes                                              |
| `bulkActions`                                                | `(keys, clear) => ReactNode`                  |         | Content of the bar shown while rows are selected                                                        |
| `sort` / `defaultSort` / `onSortChange`                      | `{ key, direction: 'asc' \| 'desc' } \| null` | `null`  | Controlled / uncontrolled sort                                                                          |
| `pageSize`                                                   | `number \| false`                             | `10`    | `false` disables pagination                                                                             |
| `page` / `defaultPage` / `onPageChange`                      | `number`                                      | `1`     | Controlled / uncontrolled page                                                                          |
| `onRowAction`                                                | `(row) => void`                               |         | Row click or Enter. Adds hover style and pointer cursor                                                 |
| `activeKey`                                                  | `string`                                      |         | Row open elsewhere (raised background + ink bar)                                                        |
| `isLoading`                                                  | `boolean`                                     | `false` | Skeleton rows (`loadingRowCount`, default 5) and a live "Loading rows"                                  |
| `emptyState`                                                 | `ReactNode`                                   |         | Default: `EmptyState` with built-in text                                                                |
| `reserveBulkBarSpace`                                        | `boolean`                                     | `true`  | Keeps the bulk bar space free so the table does not jump when the first row is selected                 |
| `stickyHeader`, `maxHeight`                                  | `boolean`, `number \| string`                 |         | With `maxHeight` the body scrolls and the header stays; without it the header sticks to the page scroll |
| `messages`                                                   | `Partial<messages>`                           |         | Per-instance text overrides                                                                             |

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

## Related components

- Instead, see ActionList: Fewer than three columns, or content that is mostly text: use `ActionList` or a plain list.
- Renders: Button, Checkbox, EmptyState, Icon, Pagination, Skeleton, VisuallyHidden
