# FilterableTable

Status: experimental

A list of records with search, status filters that show counts, a sortable table, row selection with a bulk action and an empty state that tells the user what to do.

Components: `SearchInput`, `SegmentedControl`, `DataTable`, `EmptyState`, `Badge`, `Toast` (through `useUndoable`).

## When to use

- Orders, customers, invoices, projects: any list the user scans, narrows and acts on.
- When the filters are a small fixed set. For many filters use a `Menu`/`Popover` filter panel and keep the same table.

## When not to use

- Fewer than three columns: use `ActionList`.
- Server-side data sets: control `sort` and `page` on `DataTable` and fetch per change.

## What it does

- **Alphabetical by default** (`defaultSort` on the customer column; AGENTS.md rule 5b). The user can sort other columns; the cycle ends in "none".
- **Search** matches the customer or the order number, ignoring case and accents (`matchesSearch`).
- **Filters** are a `SegmentedControl` named "Order status". Counts come from all rows, not from the current search, so they do not jump while typing. `countLabel` gives the screen reader a sentence ("3 open").
- **Empty state:** "No orders found. Try another filter or search term." with a "Clear filters" button.
- **Bulk action:** select rows (the checkbox is named "Select row Contoso"), press "Archive orders". It is reversible, so it applies at once and a toast offers Undo: "2 orders archived" (plural-aware with `plural`).

## Things to keep when you adapt it

- The bulk bar reserves its space, so the table does not jump when the first row is selected.
- Money is integer minor units formatted with `formatCurrency` and the active locale; never build the string by hand.
- A destructive bulk action (delete) still goes through a `ConfirmDialog`. See `destructive-confirm`.
- The segmented control changes the selection with `Space`; arrows only move focus.

## Code

<!-- recipe-source:start -->

```tsx
import { useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  formatCurrency,
  Heading,
  Inline,
  matchesSearch,
  plural,
  SearchInput,
  SegmentedControl,
  Stack,
  useDSLocale,
  useUndoable,
} from 'loui-ds';
import type { BadgeTone } from 'loui-ds';

type Status = 'open' | 'shipped' | 'archived';

export interface Order {
  id: string;
  number: string;
  customer: string;
  status: Status;
  /** Integer minor units (cents). */
  total: number;
}

const ORDERS: Order[] = [
  { id: 'o-1', number: 'ORD-1046', customer: 'Acme Supply', status: 'shipped', total: 128_000 },
  { id: 'o-2', number: 'ORD-1047', customer: 'Northwind', status: 'open', total: 45_050 },
  { id: 'o-3', number: 'ORD-1048', customer: 'Contoso', status: 'open', total: 310_075 },
  { id: 'o-4', number: 'ORD-1049', customer: 'Globex', status: 'archived', total: 9_900 },
  { id: 'o-5', number: 'ORD-1050', customer: 'Initech', status: 'shipped', total: 76_200 },
  { id: 'o-6', number: 'ORD-1051', customer: 'Umbrella', status: 'open', total: 18_400 },
];

const STATUS_TONE: Record<Status, BadgeTone> = {
  open: 'warning',
  shipped: 'success',
  archived: 'neutral',
};

const STATUS_LABEL: Record<Status, string> = {
  open: 'Open',
  shipped: 'Shipped',
  archived: 'Archived',
};

export interface FilterableTableProps {
  initialOrders?: Order[];
}

/**
 * Search plus status filters with counts above a sortable table. Alphabetical by customer
 * until the user sorts, rows selectable with a bulk action that offers Undo, and an empty state
 * that says what happened and what to do.
 */
export function FilterableTable({ initialOrders = ORDERS }: FilterableTableProps) {
  const locale = useDSLocale();
  const undoable = useUndoable();
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');

  const count = (status: Status) => orders.filter((order) => order.status === status).length;
  const rows = orders.filter(
    (order) =>
      (filter === 'all' || order.status === filter) &&
      (matchesSearch(order.customer, query) || matchesSearch(order.number, query)),
  );

  function clearFilters() {
    setQuery('');
    setFilter('all');
  }

  function archive(keys: ReadonlySet<string>) {
    const previous = orders; // saved before acting
    const n = keys.size;
    undoable.run({
      message: plural(locale, n, {
        one: '1 order archived',
        other: `${String(n)} orders archived`,
      }),
      apply: () => {
        setOrders((list) =>
          list.map((order) => (keys.has(order.id) ? { ...order, status: 'archived' } : order)),
        );
      },
      revert: () => {
        setOrders(previous);
      },
    });
  }

  return (
    <Stack gap={4}>
      <Heading level={2}>Orders</Heading>
      <Inline justify="between">
        <SearchInput aria-label="Search orders" value={query} onChange={setQuery} />
        <SegmentedControl
          aria-label="Order status"
          size="sm"
          value={filter}
          onChange={(value) => {
            setFilter(value as 'all' | Status);
          }}
          options={[
            { value: 'all', label: 'All', count: orders.length },
            {
              value: 'open',
              label: 'Open',
              count: count('open'),
              countLabel: `${String(count('open'))} open`,
            },
            { value: 'shipped', label: 'Shipped', count: count('shipped') },
            { value: 'archived', label: 'Archived', count: count('archived') },
          ]}
        />
      </Inline>
      <DataTable
        aria-label="Orders"
        rows={rows}
        defaultSort={{ key: 'customer', direction: 'asc' }}
        selectionMode="multiple"
        columns={[
          { key: 'number', label: 'Order', width: '140px', mono: true, muted: true },
          { key: 'customer', label: 'Customer', isRowHeader: true },
          {
            key: 'status',
            label: 'Status',
            width: '140px',
            render: (order) => (
              <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
            ),
          },
          {
            key: 'total',
            label: 'Total',
            width: '140px',
            align: 'end',
            mono: true,
            render: (order) => formatCurrency(order.total, 'USD', locale),
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
        emptyState={
          <EmptyState
            compact
            bordered={false}
            title="No orders found"
            description="Try another filter or search term."
            action={<Button onPress={clearFilters}>Clear filters</Button>}
          />
        }
      />
    </Stack>
  );
}
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/FilterableTable/FilterableTable.test.tsx` (alphabetical order, filter, search, combined, empty state and reset, bulk archive and Undo, keyboard, axe including the bulk bar and the empty state) and the `Recipes/FilterableTable` stories.
