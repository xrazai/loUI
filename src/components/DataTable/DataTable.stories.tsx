import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { Button } from '../Button';
import { DataTable } from './DataTable';
import type { DataTableProps, DataTableSort } from './DataTable';
import { orderColumns, orders } from './DataTable.fixtures';
import type { Order } from './DataTable.fixtures';

type Props = Extract<DataTableProps<Order>, { 'aria-label': string }>;

const meta = {
  title: 'Components/DataTable',
  component: DataTable<Order>,
  tags: ['autodocs'],
  args: {
    columns: orderColumns,
    rows: orders,
    'aria-label': 'Orders',
  },
  // Four columns need more than the default 384 px frame; narrower, the Customer column collapses.
  parameters: { visual: { width: 640 } },
} satisfies Meta<Props>;

export default meta;
type Story = StoryObj<Props>;

function firstColumnTexts(canvasElement: HTMLElement, column: number): string[] {
  return [...canvasElement.querySelectorAll('tbody tr')].map(
    (row) => row.querySelectorAll('td, th')[column]?.textContent ?? '',
  );
}

/** Rows appear in the order given; the table never reorders on its own. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid', { name: 'Orders' })).toBeInTheDocument();
    await expect(firstColumnTexts(canvasElement, 0)[0]).toBe('ORD-1001');
  },
};

/**
 * Lists are alphabetical by default (AGENTS.md rule 5b). `defaultSort` applies a locale-aware
 * sort (accent- and case-insensitive) on first render; the user can still change it.
 */
export const AlphabeticalByDefault: Story = {
  args: { defaultSort: { key: 'customer', direction: 'asc' } },
  play: async ({ canvasElement }) => {
    await expect(firstColumnTexts(canvasElement, 1)).toEqual([
      'Alfa Confecções',
      'ana lima',
      'Bruno Costa',
      'Casa Norte',
      'Émile Studio',
      'Eva Moda',
      'Zeta Supplies',
    ]);
  },
};

/** Pressing a header cycles ascending, descending, none. */
export const Sorting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('columnheader', { name: /Total/ });
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstColumnTexts(canvasElement, 3)[0]).toBe('$10.00');
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(firstColumnTexts(canvasElement, 3)[0]).toBe('$2,300.00');
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await expect(firstColumnTexts(canvasElement, 0)[0]).toBe('ORD-1001');
  },
};

/** Tab enters the grid on the first row; Arrow Up reaches the headers; Enter or Space sorts. */
export const KeyboardSort: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}{ArrowRight}');
    const header = canvas.getByRole('columnheader', { name: /Customer/ });
    await expect(header).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.keyboard(' ');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  },
};

export const Selection: Story = {
  args: {
    selectionMode: 'multiple',
    onSelectionChange: fn(),
    bulkActions: (_keys, clear) => (
      <Button size="sm" onPress={clear}>
        Archive
      </Button>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row ORD-1001' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row ORD-1003' }));
    await expect(
      canvas.getByRole('group', { name: 'Actions for selected rows' }),
    ).toHaveTextContent('2 selected');
    await expect(canvas.getByRole('status')).toHaveTextContent('2 selected');
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
      new Set(['ORD-1001', 'ORD-1003']),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Archive' }));
    await expect(canvas.queryByRole('group')).not.toBeInTheDocument();
  },
};

/** The header checkbox selects the rows of the current page; selection survives page changes. */
export const SelectAllOnPage: Story = {
  args: { selectionMode: 'multiple', pageSize: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows on this page' }));
    const bulkBar = canvas.getByRole('group', { name: 'Actions for selected rows' });
    await expect(bulkBar).toHaveTextContent('3 selected');
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(bulkBar).toHaveTextContent('3 selected');
    await expect(canvas.getByRole('checkbox', { name: 'Select row ORD-1004' })).not.toBeChecked();
  },
};

/** Space toggles the focused checkbox. */
export const KeyboardSelection: Story = {
  args: { selectionMode: 'multiple' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('checkbox', { name: 'Select row ORD-1002' }).focus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('checkbox', { name: 'Select row ORD-1002' })).toBeChecked();
    await expect(canvas.getByRole('status')).toHaveTextContent('1 selected');
  },
};

export const SingleSelection: Story = {
  args: { selectionMode: 'single' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row ORD-1001' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select row ORD-1002' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select row ORD-1001' })).not.toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Select row ORD-1002' })).toBeChecked();
  },
};

/** Client-side pagination with the `Pagination` component; it returns to page 1 when the sort changes. */
export const Paginated: Story = {
  args: { pageSize: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByText('4–6 of 7')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('columnheader', { name: /Customer/ }));
    await expect(canvas.getByText('1–3 of 7')).toBeInTheDocument();
  },
};

/** Sort, select and paginate in one flow: the selection and the sort survive the page change. TEST-012. */
export const SortSelectPaginate: Story = {
  args: { selectionMode: 'multiple', pageSize: 3 },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const total = canvas.getByRole('columnheader', { name: /Total/ });
    const before = firstColumnTexts(canvasElement, 1);
    await userEvent.click(total);
    await expect(total).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstColumnTexts(canvasElement, 1)).not.toEqual(before);

    const [firstRow] = canvas.getAllByRole('checkbox', { name: /^Select row / });
    if (!firstRow) throw new Error('No selectable row rendered.');
    await userEvent.click(firstRow);
    await expect(
      canvas.getByRole('group', { name: 'Actions for selected rows' }),
    ).toHaveTextContent('1 selected');

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByText('4–6 of 7')).toBeInTheDocument();
    await expect(total).toHaveAttribute('aria-sort', 'ascending');
    await expect(
      canvas.getByRole('group', { name: 'Actions for selected rows' }),
    ).toHaveTextContent('1 selected');
  },
};

/** Clickable rows (`onRowAction`) and the active row, for a list that opens a detail panel. */
export const ClickableRows: Story = {
  render: function Render(args) {
    const [activeKey, setActiveKey] = useState<string | undefined>('ORD-1002');
    return (
      <DataTable<Order>
        {...args}
        {...(activeKey === undefined ? {} : { activeKey })}
        onRowAction={(row) => {
          setActiveKey(row.id);
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('tr[data-active]')).toHaveTextContent('Émile');
    await userEvent.click(canvas.getByText('Eva Moda'));
    await expect(canvasElement.querySelector('tr[data-active]')).toHaveTextContent('Eva Moda');
  },
};

/** Selected and clickable rows together: the checkbox selects, the row opens. */
export const SelectionAndRowAction: Story = {
  args: { selectionMode: 'multiple', onRowAction: fn(), activeKey: 'ORD-1004' },
};

export const Loading: Story = {
  args: { isLoading: true, loadingRowCount: 4, selectionMode: 'multiple' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(4);
    await expect(canvas.getByRole('status')).toHaveTextContent('Loading rows');
  },
};

export const Empty: Story = {
  args: { rows: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { name: 'No records found' }),
    ).toBeInTheDocument();
  },
};

export const CustomEmpty: Story = {
  args: {
    rows: [],
    emptyState: (
      <p>
        No orders yet. <Button size="sm">Create order</Button>
      </p>
    ),
  },
};

/** The header stays visible while the body scrolls inside `maxHeight`. */
export const StickyHeader: Story = {
  args: { stickyHeader: true, maxHeight: 220, pageSize: false },
};

/** Long text is truncated with an ellipsis; fixed-width columns keep their size. */
export const LongText: Story = {
  args: {
    rows: [
      {
        id: 'ORD-2001',
        customer: 'Companhia Brasileira de Papéis Finos e Acabamentos Industriais Ltda',
        status: 'Pending',
        total: 99900,
        date: '2026-10-29',
      },
      ...orders.slice(0, 2),
    ],
  },
};

const LONG_CUSTOMER = 'Companhia Brasileira de Papéis Finos e Acabamentos Industriais Ltda';

/**
 * `minWidth` keeps a column from being squashed: in a container that is too narrow the table area
 * scrolls horizontally instead. Here the container is 360 px wide and the table needs more.
 */
/** An empty table with `minWidth` columns does not scroll sideways: the empty state fits the container. */
export const EmptyWithMinimumColumnWidth: Story = {
  args: {
    rows: [],
    columns: orderColumns.map((column) =>
      column.key === 'customer' ? { ...column, minWidth: '300px' } : column,
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'calc(var(--ds-space-16) * 5.625)', maxInlineSize: '100%' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector('thead')?.closest('table')?.parentElement;
    await expect(scroller?.scrollWidth).toBe(scroller?.clientWidth);
  },
};

export const MinimumColumnWidth: Story = {
  args: {
    columns: orderColumns.map((column) => {
      if (column.key === 'customer') return { ...column, minWidth: '200px' };
      if (column.key === 'status') return { ...column, width: '90px', minWidth: '120px' };
      if (column.key === 'total') return { ...column, width: '90px', minWidth: '120px' };
      return column;
    }),
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'calc(var(--ds-space-16) * 5.625)', maxInlineSize: '100%' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const headers = [...canvasElement.querySelectorAll('thead th')];
    await expect(headers[1]?.getBoundingClientRect().width).toBeGreaterThanOrEqual(200);
    await expect(headers[2]?.getBoundingClientRect().width).toBeGreaterThanOrEqual(120);
    const scroller = canvasElement.querySelector('[data-min-sized]');
    await expect((scroller?.scrollWidth ?? 0) > (scroller?.clientWidth ?? 0)).toBe(true);
  },
};

/**
 * `truncate: false` lets a column wrap instead of ending in an ellipsis, and a mono header such as
 * "Supplier name" can use two lines instead of being cut to "SUPPL…". Other columns still truncate.
 */
export const WrappingColumns: Story = {
  args: {
    columns: [
      { key: 'id', label: 'Order', width: '110px', mono: true, muted: true },
      { key: 'customer', label: 'Supplier name', width: '140px', truncate: false },
      { key: 'status', label: 'Status', width: '120px' },
    ],
    rows: [
      {
        id: 'ORD-2001',
        customer: LONG_CUSTOMER,
        status: 'Pending',
        total: 99900,
        date: '2026-10-29',
      },
      ...orders.slice(0, 2),
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'calc(var(--ds-space-16) * 6)', maxInlineSize: '100%' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const cell = canvasElement.querySelectorAll('tbody td, tbody th')[1];
    await expect(cell?.textContent).toBe(LONG_CUSTOMER);
    await expect((cell?.scrollWidth ?? 0) <= (cell?.clientWidth ?? 0)).toBe(true);
  },
};

/**
 * `hideLabel` hides the header text of an icon-only or action column; `label` stays the accessible
 * name of the column header.
 */
export const HiddenHeaderLabel: Story = {
  args: {
    columns: [
      ...orderColumns.slice(0, 2),
      {
        key: 'actions',
        label: 'Open order',
        width: '64px',
        hideLabel: true,
        sortable: false,
        render: (row) => (
          <Button size="sm" variant="ghost">
            {`Open ${row.id}`}
          </Button>
        ),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('columnheader', { name: 'Open order' }),
    ).toBeInTheDocument();
  },
};

/** A Button inside a cell handles its own press; the row action does not run. */
export const ButtonInCell: Story = {
  args: {
    columns: [
      ...orderColumns.filter((column) => column.key === 'customer'),
      {
        key: 'archive',
        label: 'Archive',
        sortable: false,
        render: (row) => (
          <Button size="sm" variant="ghost">
            {`Archive ${row.id}`}
          </Button>
        ),
      },
    ],
    onRowAction: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Archive ORD-1001' }));
    await expect(args.onRowAction).not.toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [sort, setSort] = useState<DataTableSort | null>({ key: 'total', direction: 'desc' });
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['ORD-1005']));
    return (
      <DataTable<Order>
        {...args}
        selectionMode="multiple"
        sort={sort}
        onSortChange={setSort}
        selectedKeys={selected}
        onSelectionChange={setSelected}
      />
    );
  },
  play: async ({ canvasElement }) => {
    await expect(firstColumnTexts(canvasElement, 4)[0]).toBe('$2,300.00');
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('1 selected');
  },
};

/** Text, plurals, numbers and the sort order follow the provider locale. */
export const PortugueseBrazil: Story = {
  args: { selectionMode: 'multiple', defaultSort: { key: 'customer', direction: 'asc' } },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Selecionar linha ORD-1001' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('1 selecionada');
  },
};
