import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { DataTable } from './DataTable';
import type { DataTableSort } from './DataTable';
import { orderColumns, orders } from './DataTable.fixtures';
import type { Order } from './DataTable.fixtures';

function columnTexts(container: Element, columnIndex: number): string[] {
  return [...container.querySelectorAll('tbody tr')].map(
    (row) => row.querySelectorAll('td, th')[columnIndex]?.textContent ?? '',
  );
}

type Screen = Awaited<ReturnType<typeof renderWithProvider>>;

/** The native input sits under its label, so a real click goes to the label (the visible box). */
async function toggle(screen: Screen, name: string) {
  const label = screen.getByRole('checkbox', { name }).element().closest('label');
  if (!label) throw new Error('checkbox without label');
  await userEvent.click(label);
}

const baseProps = { columns: orderColumns, rows: orders, 'aria-label': 'Orders' } as const;

describe('DataTable', () => {
  describe('structure', () => {
    it('renders a named table with column headers and the rows in the order given', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} />);
      await expect.element(screen.getByRole('grid', { name: 'Orders' })).toBeVisible();
      expect(screen.getByRole('columnheader').elements()).toHaveLength(4);
      expect(columnTexts(screen.container, 1)).toEqual([
        'Zeta Textiles',
        'Émile Tecidos',
        'Alfa Confecções',
        'Eva Moda',
        'Bruno Costa',
        'ana lima',
        'Casa Norte',
      ]);
    });

    it('shows header text, mono cells and custom renderers', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={2} />);
      await expect.element(screen.getByRole('columnheader', { name: /Order/ })).toBeVisible();
      await expect.element(screen.getByText('$1,240.00')).toBeVisible();
      await expect.element(screen.getByText('Paid')).toBeVisible();
    });

    it('uses the row height token', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={2} />);
      const row = screen.container.querySelector('tbody tr');
      expect(row?.getBoundingClientRect().height).toBe(52);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <DataTable<Order> {...baseProps} ref={ref} className="extra" data-testid="table" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('table');
    });

    it('names the table with aria-labelledby', async () => {
      const screen = await renderWithProvider(
        <div>
          <h2 id="title">All orders</h2>
          <DataTable<Order> columns={orderColumns} rows={orders} aria-labelledby="title" />
        </div>,
      );
      await expect.element(screen.getByRole('grid', { name: 'All orders' })).toBeVisible();
    });
  });

  describe('sorting', () => {
    it('applies defaultSort with aria-sort on the sorted column only', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} defaultSort={{ key: 'customer', direction: 'asc' }} />,
      );
      // Locale-aware: accents and case are ignored ("ana lima" before "Alfa Confecções" is wrong).
      expect(columnTexts(screen.container, 1)).toEqual([
        'Alfa Confecções',
        'ana lima',
        'Bruno Costa',
        'Casa Norte',
        'Émile Tecidos',
        'Eva Moda',
        'Zeta Textiles',
      ]);
      const headers = screen.getByRole('columnheader').elements();
      expect(headers.map((header) => header.getAttribute('aria-sort'))).toEqual([
        'none',
        'ascending',
        'none',
        'none',
      ]);
    });

    it('cycles ascending, descending and none when the header is pressed', async () => {
      const onSortChange = vi.fn();
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} onSortChange={onSortChange} />,
      );
      const header = screen.getByRole('columnheader', { name: /Customer/ });
      await userEvent.click(header);
      expect(onSortChange).toHaveBeenLastCalledWith({ key: 'customer', direction: 'asc' });
      expect(header.element().getAttribute('aria-sort')).toBe('ascending');
      await userEvent.click(header);
      expect(onSortChange).toHaveBeenLastCalledWith({ key: 'customer', direction: 'desc' });
      expect(header.element().getAttribute('aria-sort')).toBe('descending');
      expect(columnTexts(screen.container, 1)[0]).toBe('Zeta Textiles');
      await userEvent.click(header);
      expect(onSortChange).toHaveBeenLastCalledWith(null);
      expect(header.element().getAttribute('aria-sort')).toBe('none');
      expect(columnTexts(screen.container, 1)[0]).toBe('Zeta Textiles');
      expect(columnTexts(screen.container, 1)[1]).toBe('Émile Tecidos');
    });

    it('sorts from the keyboard with Enter and Space on the focused header', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} />);
      await userEvent.keyboard('{Tab}');
      // The grid receives focus on its first row; Arrow Up reaches the header cells.
      await userEvent.keyboard('{ArrowUp}');
      const first = screen.getByRole('columnheader', { name: /Order/ });
      await expect.element(first).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('columnheader', { name: /Customer/ })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(
        screen
          .getByRole('columnheader', { name: /Customer/ })
          .element()
          .getAttribute('aria-sort'),
      ).toBe('ascending');
      await userEvent.keyboard(' ');
      expect(
        screen
          .getByRole('columnheader', { name: /Customer/ })
          .element()
          .getAttribute('aria-sort'),
      ).toBe('descending');
    });

    it('sorts numeric columns numerically', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} defaultSort={{ key: 'total', direction: 'asc' }} />,
      );
      expect(columnTexts(screen.container, 3)).toEqual([
        '$10.00',
        '$89.00',
        '$155.00',
        '$450.50',
        '$760.00',
        '$1,240.00',
        '$2,300.00',
      ]);
    });

    it('uses sortValue when given and respects sortable: false', async () => {
      const columns = [
        { key: 'id', label: 'Order' },
        { key: 'customer', label: 'Customer', sortValue: (row: Order) => row.date },
        { key: 'status', label: 'Status', sortable: false },
      ];
      const screen = await renderWithProvider(
        <DataTable<Order>
          columns={columns}
          rows={orders}
          aria-label="Orders"
          defaultSort={{ key: 'customer', direction: 'asc' }}
        />,
      );
      expect(columnTexts(screen.container, 1)[0]).toBe('ana lima');
      const status = screen.getByRole('columnheader', { name: /Status/ }).element();
      expect(status.hasAttribute('aria-sort')).toBe(false);
    });

    it('is controlled by the sort prop', async () => {
      const onSortChange = vi.fn();
      const sort: DataTableSort = { key: 'customer', direction: 'desc' };
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} sort={sort} onSortChange={onSortChange} />,
      );
      expect(columnTexts(screen.container, 1)[0]).toBe('Zeta Textiles');
      await userEvent.click(screen.getByRole('columnheader', { name: /Customer/ }));
      expect(onSortChange).toHaveBeenLastCalledWith(null);
      // The parent did not update: the table keeps the controlled sort.
      expect(
        screen
          .getByRole('columnheader', { name: /Customer/ })
          .element()
          .getAttribute('aria-sort'),
      ).toBe('descending');
    });

    it('sorts the whole data set, not only the current page', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order>
          {...baseProps}
          pageSize={3}
          defaultSort={{ key: 'customer', direction: 'asc' }}
        />,
      );
      expect(columnTexts(screen.container, 1)).toEqual([
        'Alfa Confecções',
        'ana lima',
        'Bruno Costa',
      ]);
    });
  });

  describe('selection', () => {
    it('labels the checkboxes from messages', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} selectionMode="multiple" pageSize={3} />,
      );
      await expect
        .element(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))
        .toBeVisible();
      await expect
        .element(screen.getByRole('checkbox', { name: 'Select row ORD-1001' }))
        .toBeVisible();
      expect(screen.getByRole('checkbox').elements()).toHaveLength(4);
    });

    it('names the selection checkbox after the row header column', async () => {
      const columns = orderColumns.map((column) =>
        column.key === 'customer' ? { ...column, isRowHeader: true } : column,
      );
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} columns={columns} selectionMode="multiple" pageSize={2} />,
      );
      await expect
        .element(screen.getByRole('checkbox', { name: 'Select row Zeta Textiles' }))
        .toBeVisible();
    });

    it('shows the bulk bar with a live count, runs bulk actions and clears', async () => {
      const onArchive = vi.fn();
      const screen = await renderWithProvider(
        <DataTable<Order>
          {...baseProps}
          selectionMode="multiple"
          bulkActions={(keys, clear) => (
            <Button
              size="sm"
              onPress={() => {
                onArchive([...keys]);
                clear();
              }}
            >
              Archive
            </Button>
          )}
        />,
      );
      expect(
        screen.getByRole('group', { name: 'Actions for selected rows' }).elements(),
      ).toHaveLength(0);
      await toggle(screen, 'Select row ORD-1001');
      await expect
        .element(screen.getByRole('group', { name: 'Actions for selected rows' }))
        .toBeVisible();
      await expect.element(screen.getByText('1 selected').first()).toBeVisible();
      await toggle(screen, 'Select row ORD-1003');
      await expect.element(screen.getByText('2 selected').first()).toBeVisible();
      // A persistent polite status carries the count for screen readers.
      const status = screen.getByRole('status').first().element();
      expect(status.textContent).toBe('2 selected');
      await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
      expect(onArchive).toHaveBeenCalledWith(['ORD-1001', 'ORD-1003']);
      expect(
        screen.getByRole('group', { name: 'Actions for selected rows' }).elements(),
      ).toHaveLength(0);
      expect(status.textContent).toBe('');
    });

    it('keeps the table in place when the first row is selected, unless the space is not reserved', async () => {
      const reserved = await renderWithProvider(
        <DataTable<Order> {...baseProps} selectionMode="multiple" />,
      );
      const topBefore = reserved.getByRole('grid').element().getBoundingClientRect().top;
      await toggle(reserved, 'Select row ORD-1001');
      expect(reserved.getByRole('grid').element().getBoundingClientRect().top).toBe(topBefore);
      await reserved.unmount();
      const collapsed = await renderWithProvider(
        <DataTable<Order> {...baseProps} selectionMode="multiple" reserveBulkBarSpace={false} />,
      );
      const collapsedBefore = collapsed.getByRole('grid').element().getBoundingClientRect().top;
      await toggle(collapsed, 'Select row ORD-1001');
      expect(collapsed.getByRole('grid').element().getBoundingClientRect().top).toBeGreaterThan(
        collapsedBefore,
      );
    });

    it('clears the selection with the clear button', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} selectionMode="multiple" />,
      );
      await toggle(screen, 'Select row ORD-1001');
      await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(
        screen.getByRole('checkbox', { name: 'Select row ORD-1001' }).element(),
      ).not.toBeChecked();
    });

    it('selects all rows on the current page and keeps other pages selected', async () => {
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(
        <DataTable<Order>
          {...baseProps}
          selectionMode="multiple"
          pageSize={3}
          onSelectionChange={onSelectionChange}
        />,
      );
      await toggle(screen, 'Select all rows on this page');
      expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual([
        'ORD-1001',
        'ORD-1002',
        'ORD-1003',
      ]);
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      await toggle(screen, 'Select row ORD-1004');
      expect((onSelectionChange.mock.lastCall?.[0] as Set<string>).size).toBe(4);
      await expect.element(screen.getByText('4 selected').first()).toBeVisible();
      // Back on page 1: still selected; deselecting all of page 1 keeps page 2.
      await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
      await toggle(screen, 'Select all rows on this page');
      expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['ORD-1004']);
    });

    it('supports single selection without a select-all checkbox', async () => {
      const onSelectionChange = vi.fn();
      const screen = await renderWithProvider(
        <DataTable<Order>
          {...baseProps}
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        />,
      );
      expect(
        screen.getByRole('checkbox', { name: 'Select all rows on this page' }).elements(),
      ).toHaveLength(0);
      await toggle(screen, 'Select row ORD-1001');
      await toggle(screen, 'Select row ORD-1002');
      expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['ORD-1002']);
    });

    it('toggles a row with Space on its checkbox', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} selectionMode="multiple" />,
      );
      screen.getByRole('checkbox', { name: 'Select row ORD-1001' }).element().focus();
      await userEvent.keyboard(' ');
      expect(screen.getByRole('checkbox', { name: 'Select row ORD-1001' }).element()).toBeChecked();
      expect(screen.container.querySelector('tbody tr[aria-selected="true"]')).not.toBeNull();
    });

    it('supports controlled selection', async () => {
      function Parent() {
        const [keys, setKeys] = useState<ReadonlySet<string>>(new Set(['ORD-1002']));
        return (
          <DataTable<Order>
            {...baseProps}
            selectionMode="multiple"
            selectedKeys={keys}
            onSelectionChange={setKeys}
          />
        );
      }
      const screen = await renderWithProvider(<Parent />);
      expect(screen.getByRole('checkbox', { name: 'Select row ORD-1002' }).element()).toBeChecked();
      await toggle(screen, 'Select row ORD-1004');
      await expect.element(screen.getByText('2 selected').first()).toBeVisible();
    });

    it('supports defaultSelectedKeys', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order>
          {...baseProps}
          selectionMode="multiple"
          defaultSelectedKeys={new Set(['ORD-1001'])}
        />,
      );
      await expect.element(screen.getByText('1 selected').first()).toBeVisible();
    });
  });

  describe('pagination', () => {
    it('shows one page of rows and the range text', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={3} />);
      expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(3);
      await expect.element(screen.getByText('1–3 of 7')).toBeVisible();
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      expect(columnTexts(screen.container, 1)).toEqual(['Eva Moda', 'Bruno Costa', 'ana lima']);
      await expect.element(screen.getByText('4–6 of 7')).toBeVisible();
    });

    it('hides pagination when everything fits, and when pageSize is false', async () => {
      const fits = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={10} />);
      expect(fits.getByRole('navigation').elements()).toHaveLength(0);
      await fits.unmount();
      const all = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={false} />);
      expect(all.container.querySelectorAll('tbody tr')).toHaveLength(7);
      expect(all.getByRole('navigation').elements()).toHaveLength(0);
    });

    it('returns to page 1 when the sort changes', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={3} />);
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      await expect.element(screen.getByText('4–6 of 7')).toBeVisible();
      await userEvent.click(screen.getByRole('columnheader', { name: /Customer/ }));
      await expect.element(screen.getByText('1–3 of 7')).toBeVisible();
    });

    it('returns to page 1 when the rows change', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={3} />);
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      await screen.rerender(
        <DataTable<Order> {...baseProps} rows={orders.slice(0, 6)} pageSize={3} />,
      );
      await expect.element(screen.getByText('1–3 of 6')).toBeVisible();
    });

    it('does not reset the page when the same rows arrive in a new array', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={3} />);
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      await screen.rerender(<DataTable<Order> {...baseProps} rows={[...orders]} pageSize={3} />);
      await expect.element(screen.getByText('4–6 of 7')).toBeVisible();
    });

    it('supports a controlled page', async () => {
      const onPageChange = vi.fn();
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} pageSize={3} page={2} onPageChange={onPageChange} />,
      );
      await expect.element(screen.getByText('4–6 of 7')).toBeVisible();
      await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('rows', () => {
    it('calls onRowAction on click and on Enter', async () => {
      const onRowAction = vi.fn();
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} onRowAction={onRowAction} />,
      );
      await userEvent.click(screen.getByText('Eva Moda'));
      expect(onRowAction).toHaveBeenLastCalledWith(orders[3]);
      await userEvent.keyboard('{Tab}');
      // Header is first in tab order; move into the body with the arrow keys.
      const row = screen.container.querySelector('tbody tr');
      (row as HTMLElement).focus();
      await userEvent.keyboard('{Enter}');
      expect(onRowAction).toHaveBeenLastCalledWith(orders[0]);
    });

    it('marks the active row', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} activeKey="ORD-1002" />,
      );
      const active = screen.container.querySelectorAll('tbody tr[data-active]');
      expect(active).toHaveLength(1);
      expect(active[0]?.textContent).toContain('Émile Tecidos');
    });

    it('allows arrow key navigation between rows', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} onRowAction={vi.fn()} />,
      );
      (screen.container.querySelector('tbody tr') as HTMLElement).focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement?.textContent).toContain('Émile Tecidos');
    });
  });

  describe('loading and empty', () => {
    it('shows skeleton rows, marks the table busy and announces loading', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} isLoading loadingRowCount={3} selectionMode="multiple" />,
      );
      expect(screen.container.querySelectorAll('tbody tr')).toHaveLength(3);
      expect(screen.container.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(screen.getByRole('status').first().element().textContent).toBe('Loading rows');
      expect(screen.getByRole('checkbox', { name: /Select row/ }).elements()).toHaveLength(0);
      expect(screen.container.textContent).not.toContain('Zeta Textiles');
    });

    it('shows the default empty state', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} rows={[]} />);
      await expect.element(screen.getByRole('heading', { name: 'No records found' })).toBeVisible();
      await expect.element(screen.getByText('Try another filter or search term.')).toBeVisible();
      expect(screen.getByRole('navigation').elements()).toHaveLength(0);
    });

    it('shows a custom empty state', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} rows={[]} emptyState={<p>Nothing here</p>} />,
      );
      await expect.element(screen.getByText('Nothing here')).toBeVisible();
    });
  });

  describe('sticky header and scrolling', () => {
    it('keeps the header visible inside a scrolling area', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} stickyHeader maxHeight={200} pageSize={false} />,
      );
      const scroller = screen.container.querySelector('[data-scrollable]') as HTMLElement;
      expect(scroller.getBoundingClientRect().height).toBeLessThanOrEqual(200);
      scroller.scrollTop = 100;
      const header = screen.getByRole('columnheader', { name: /Customer/ }).element();
      expect(header.getBoundingClientRect().top).toBeCloseTo(
        scroller.getBoundingClientRect().top,
        0,
      );
      expect(getComputedStyle(header).position).toBe('sticky');
    });
  });

  describe('messages and locale', () => {
    it('translates built-in text to pt-BR', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order> {...baseProps} selectionMode="multiple" pageSize={3} />,
        { locale: 'pt-BR' },
      );
      await expect
        .element(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas desta página' }))
        .toBeVisible();
      await toggle(screen, 'Selecionar linha ORD-1001');
      await expect.element(screen.getByText('1 selecionada').first()).toBeVisible();
      await expect.element(screen.getByText('1–3 de 7')).toBeVisible();
    });

    it('sorts with the provider locale', async () => {
      const rows = [
        { id: '1', name: 'z' },
        { id: '2', name: 'ä' },
      ];
      const columns = [{ key: 'name', label: 'Name' }];
      const sv = await renderWithProvider(
        <DataTable
          columns={columns}
          rows={rows}
          aria-label="Names"
          defaultSort={{ key: 'name', direction: 'asc' }}
        />,
        { locale: 'sv' },
      );
      expect(columnTexts(sv.container, 0)).toEqual(['z', 'ä']);
      await sv.unmount();
      const de = await renderWithProvider(
        <DataTable
          columns={columns}
          rows={rows}
          aria-label="Names"
          defaultSort={{ key: 'name', direction: 'asc' }}
        />,
        { locale: 'de' },
      );
      expect(columnTexts(de.container, 0)).toEqual(['ä', 'z']);
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(<DataTable<Order> {...baseProps} rows={[]} />, {
        messages: { DataTable: { emptyTitle: 'Nothing to show' } },
      });
      await expect
        .element(provider.getByRole('heading', { name: 'Nothing to show' }))
        .toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <DataTable<Order> {...baseProps} rows={[]} messages={{ emptyTitle: 'Empty list' }} />,
        { messages: { DataTable: { emptyTitle: 'Nothing to show' } } },
      );
      await expect.element(instance.getByRole('heading', { name: 'Empty list' })).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations by default', async () => {
      const screen = await renderWithProvider(<DataTable<Order> {...baseProps} pageSize={3} />);
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with selection, a selected row and the bulk bar', async () => {
      const screen = await renderWithProvider(
        <DataTable<Order>
          {...baseProps}
          selectionMode="multiple"
          defaultSelectedKeys={new Set(['ORD-1001'])}
          activeKey="ORD-1003"
          onRowAction={vi.fn()}
          defaultSort={{ key: 'customer', direction: 'asc' }}
          pageSize={4}
        />,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when loading, empty and sticky', async () => {
      const loading = await renderWithProvider(
        <DataTable<Order> {...baseProps} isLoading selectionMode="multiple" />,
      );
      await expectNoA11yViolations(loading.container);
      await loading.unmount();
      const empty = await renderWithProvider(<DataTable<Order> {...baseProps} rows={[]} />);
      await expectNoA11yViolations(empty.container);
      await empty.unmount();
      const sticky = await renderWithProvider(
        <DataTable<Order> {...baseProps} stickyHeader maxHeight={240} pageSize={false} />,
      );
      await expectNoA11yViolations(sticky.container);
    });
  });
});
