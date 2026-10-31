import { useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Heading,
  Inline,
  SearchInput,
  SegmentedControl,
  Stack,
  formatCurrency,
  matchesSearch,
  plural,
  useDSLocale,
} from '../../index';
import type { BadgeTone } from '../../index';
import { useUndoable } from '../../hooks/useUndoable';

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
