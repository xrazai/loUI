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
      'Émile Tecidos',
      'Eva Moda',
      'Zeta Textiles',
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
        customer: 'Companhia Brasileira de Tecidos Finos e Acabamentos Industriais Ltda',
        status: 'Pending',
        total: 99900,
        date: '2026-10-29',
      },
      ...orders.slice(0, 2),
    ],
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
