/**
 * Keyboard contract: DataTable (sort, selection, row action) and MatrixGrid.
 * Spec: AGENTS.md section 8, row "Data table": header buttons sort (aria-sort); row action via real
 * button/link; selection checkboxes labelled. MatrixGrid follows the APG grid pattern: one tab
 * stop, arrows, Home/End, Ctrl+Home/End, Enter/Space toggles (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { ActionList } from '../../components/ActionList';
import { createDocuments } from '../../components/ActionList/ActionList.fixtures';
import { DataTable } from '../../components/DataTable';
import { orderColumns, orders } from '../../components/DataTable/DataTable.fixtures';
import type { Order } from '../../components/DataTable/DataTable.fixtures';
import { MatrixGrid } from '../../patterns/MatrixGrid';
import { renderWithProvider } from '../render';
import { activeLabel, expectFocus, labelOf, press, tabOrder } from './contract';

const baseProps = { columns: orderColumns, rows: orders, 'aria-label': 'Orders' } as const;

const headerSort = (name: RegExp) =>
  [...document.querySelectorAll('[role="columnheader"]')]
    .find((h) => name.test(h.textContent))
    ?.getAttribute('aria-sort');
const columnTexts = (index: number) =>
  [...document.querySelectorAll('tbody tr')].map(
    (row) => row.querySelectorAll('td, th')[index]?.textContent ?? '',
  );

describe('keyboard contract: data table sorting', () => {
  async function toCustomerHeader() {
    await renderWithProvider(<DataTable<Order> {...baseProps} />);
    await userEvent.tab();
    // Focus lands on the grid (first row); ArrowUp reaches the header row.
    await press('{ArrowUp}');
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('columnheader');
    await press('{ArrowRight}');
    await expect.poll(() => labelOf(document.activeElement)).toMatch(/Customer/);
  }

  it('the whole table is one Tab stop', async () => {
    await renderWithProvider(
      <>
        <button type="button">Before</button>
        <DataTable<Order> {...baseProps} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    const stops = await tabOrder(2);
    expect(stops[1]).toBe('After');
  });

  it('Enter on a sortable header sorts ascending, then Space flips to descending', async () => {
    await toCustomerHeader();
    expect(headerSort(/Customer/)).toBe('none');
    await press('{Enter}');
    await expect.poll(() => headerSort(/Customer/)).toBe('ascending');
    expect(columnTexts(1)[0]).toBe('Alfa Confecções');
    await press(' ');
    await expect.poll(() => headerSort(/Customer/)).toBe('descending');
    expect(columnTexts(1)[0]).toBe('Zeta Supplies');
  });

  it('only the sorted column announces a direction', async () => {
    await toCustomerHeader();
    await press('{Enter}');
    await expect.poll(() => headerSort(/Customer/)).toBe('ascending');
    expect(headerSort(/Order/)).not.toBe('ascending');
    expect(headerSort(/Order/)).not.toBe('descending');
  });

  it('sorting keeps focus on the header that was activated', async () => {
    await toCustomerHeader();
    await press('{Enter}');
    await expect.poll(() => labelOf(document.activeElement)).toMatch(/Customer/);
  });
});

describe('keyboard contract: data table selection and row action', () => {
  it('Space on a row checkbox toggles it; the checkbox is labelled with the row', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithProvider(
      <DataTable<Order>
        {...baseProps}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    const box = screen.getByRole('checkbox', { name: 'Select row ORD-1001' }).element();
    box.focus();
    expect(document.activeElement).toBe(box);
    await press(' ');
    expect((box as HTMLInputElement).checked).toBe(true);
    expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['ORD-1001']);
    await press(' ');
    expect((box as HTMLInputElement).checked).toBe(false);
  });

  it('the select-all checkbox is keyboard operable and labelled', async () => {
    const onSelectionChange = vi.fn();
    const screen = await renderWithProvider(
      <DataTable<Order>
        {...baseProps}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    const all = screen.getByRole('checkbox', { name: /Select all/ }).element();
    // Arrive the way a keyboard user does: Tab into the grid, then Up to the header row.
    await userEvent.tab();
    await press('{ArrowUp}');
    await expect
      .poll(() => document.activeElement === all || all.contains(document.activeElement))
      .toBe(true);
    await press(' ');
    const selected = onSelectionChange.mock.lastCall?.[0] as Set<string> | 'all';
    // Select all covers the visible page of rows, not just one.
    expect(selected === 'all' || selected.size > 1).toBe(true);
  });

  it('Enter on a focused row runs the row action', async () => {
    const onRowAction = vi.fn();
    await renderWithProvider(<DataTable<Order> {...baseProps} onRowAction={onRowAction} />);
    (document.querySelector('tbody tr') as HTMLElement).focus();
    await press('{Enter}');
    expect(onRowAction).toHaveBeenLastCalledWith(orders[0]);
  });

  it('Down/Up move between rows', async () => {
    await renderWithProvider(<DataTable<Order> {...baseProps} onRowAction={vi.fn()} />);
    (document.querySelector('tbody tr') as HTMLElement).focus();
    await press('{ArrowDown}');
    await expect.poll(() => document.activeElement?.textContent).toContain('Émile Studio');
    await press('{ArrowUp}');
    await expect.poll(() => document.activeElement?.textContent).toContain('Zeta Supplies');
  });
});

describe('keyboard contract: action list with checkboxes and row action', () => {
  it('Space toggles the row checkbox and Enter runs the row action', async () => {
    const onSelectionChange = vi.fn();
    const onAction = vi.fn();
    const items = createDocuments();
    const screen = await renderWithProvider(
      <ActionList
        items={items}
        aria-label="Files"
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        onAction={onAction}
      />,
    );
    await userEvent.tab();
    await press(' ');
    expect([...(onSelectionChange.mock.lastCall?.[0] as Set<string>)]).toEqual(['contract']);
    expect(onAction).not.toHaveBeenCalled();
    await press('{Enter}');
    expect(onAction).toHaveBeenLastCalledWith(items[0]);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const box = screen.getByRole('checkbox', { name: 'Select Contract with Alfa Confecções' });
    expect((box.element() as HTMLInputElement).checked).toBe(true);
  });

  it('every checkbox has an accessible name from its row', async () => {
    const screen = await renderWithProvider(
      <ActionList items={createDocuments()} aria-label="Files" selectionMode="multiple" />,
    );
    for (const name of ['Contract with Alfa Confecções', 'Price list 2026', 'Supplier notes']) {
      expect(screen.getByRole('checkbox', { name: `Select ${name}` }).elements()).toHaveLength(1);
    }
  });
});

describe('keyboard contract: matrix grid', () => {
  const rows = [
    { id: 'lamp', label: 'Desk lamp' },
    { id: 'notebook', label: 'Notebook' },
    { id: 'backpack', label: 'Backpack' },
  ];
  const columns = [
    { id: 'navy', label: 'Navy' },
    { id: 'yellow', label: 'Yellow' },
    { id: 'gray', label: 'Gray' },
  ];

  function Matrix({
    onToggle,
  }: {
    onToggle?: (row: string, column: string) => void | PromiseLike<unknown>;
  }) {
    return (
      <>
        <button type="button">Before</button>
        <MatrixGrid
          aria-label="Product colors"
          rows={rows}
          columns={columns}
          isLinked={() => false}
          onToggle={onToggle ?? (() => undefined)}
        />
        <button type="button">After</button>
      </>
    );
  }

  async function enter() {
    // Before, then the scroll region, then the first cell.
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect.poll(activeLabel).toContain('Desk lamp · Navy');
  }

  it('the grid is a single Tab stop for its cells', async () => {
    await renderWithProvider(<Matrix />);
    await enter();
    await userEvent.tab();
    await expectFocus('After');
  });

  it('arrows move between cells and stop at the edges', async () => {
    await renderWithProvider(<Matrix />);
    await enter();
    await press('{ArrowRight}');
    await expect.poll(activeLabel).toContain('Desk lamp · Yellow');
    await press('{ArrowDown}');
    await expect.poll(activeLabel).toContain('Notebook · Yellow');
    await press('{ArrowLeft}{ArrowLeft}');
    await expect.poll(activeLabel).toContain('Notebook · Navy');
    await press('{ArrowUp}{ArrowUp}');
    await expect.poll(activeLabel).toContain('Desk lamp · Navy');
  });

  it('Home/End jump within the row and Ctrl+Home/Ctrl+End to the grid corners', async () => {
    await renderWithProvider(<Matrix />);
    await enter();
    await press('{ArrowDown}{End}');
    await expect.poll(activeLabel).toContain('Notebook · Gray');
    await press('{Home}');
    await expect.poll(activeLabel).toContain('Notebook · Navy');
    await press('{Control>}{End}{/Control}');
    await expect.poll(activeLabel).toContain('Backpack · Gray');
    await press('{Control>}{Home}{/Control}');
    await expect.poll(activeLabel).toContain('Desk lamp · Navy');
  });

  it('Space and Enter toggle the focused cell', async () => {
    const onToggle = vi.fn();
    await renderWithProvider(<Matrix onToggle={onToggle} />);
    await enter();
    await press(' ');
    expect(onToggle).toHaveBeenLastCalledWith('lamp', 'navy');
    await press('{ArrowDown}{ArrowRight}{Enter}');
    expect(onToggle).toHaveBeenLastCalledWith('notebook', 'yellow');
  });

  it('an async toggle keeps focus on the pending cell and ignores a second Enter (GAP-029)', async () => {
    let finish!: () => void;
    const onToggle = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    await renderWithProvider(<Matrix onToggle={onToggle} />);
    await enter();
    await press('{Enter}');
    await expect.poll(activeLabel).toContain('saving');
    await press('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);
    await press('{ArrowRight}');
    await expect.poll(activeLabel).toContain('Desk lamp · Yellow');
    finish();
  });

  it('Shift+Tab back into the grid returns to the last focused cell (roving tabindex)', async () => {
    await renderWithProvider(<Matrix />);
    await enter();
    await press('{ArrowDown}{ArrowRight}');
    await userEvent.tab();
    await expectFocus('After');
    await userEvent.tab({ shift: true });
    await expect.poll(activeLabel).toContain('Notebook · Yellow');
  });
});
