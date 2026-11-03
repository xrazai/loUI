import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { LedgerList } from './LedgerList';
import type { LedgerEntry, LedgerListProps } from './LedgerList';

const entries: LedgerEntry[] = [
  {
    id: 'e3',
    date: '2026-03-12',
    title: 'Refund',
    sub: 'Order 1048',
    delta: -2500,
    balance: 12500,
  },
  { id: 'e2', date: '2026-03-10', title: 'Payment received', delta: 5000, balance: 15000 },
  { id: 'e1', date: '2026-03-01', title: 'Opening balance', delta: 10000 },
];

function Example(props: Partial<LedgerListProps>) {
  return <LedgerList aria-label="Account activity" entries={entries} currency="USD" {...props} />;
}

describe('LedgerList', () => {
  describe('rendering and ARIA', () => {
    it('is a named list with one item per entry', async () => {
      const screen = await renderWithProvider(<Example />);
      const list = screen.getByRole('list', { name: 'Account activity' });
      expect(list.element().tagName).toBe('UL');
      expect(screen.getByRole('listitem').elements()).toHaveLength(3);
    });

    it('shows date, title, sub line, signed amount and balance', async () => {
      const screen = await renderWithProvider(<Example />);
      const first = screen.getByRole('listitem').first().element() as HTMLElement;
      const text = first.innerText.replace(/\s+/g, ' ');
      expect(text).toContain('Mar 12');
      expect(text).toContain('Refund');
      expect(text).toContain('Order 1048');
      expect(text).toContain('− $25.00');
      expect(text).toContain('Balance $125.00');
      expect(first.querySelector('time')?.getAttribute('datetime')).toBe('2026-03-12');
    });

    it('states the sign as text: + for additions, a minus for subtractions', async () => {
      const screen = await renderWithProvider(<Example />);
      const items = screen.getByRole('listitem').elements() as HTMLElement[];
      const signs = items.map((item) => item.querySelector('[data-part="sign"]')?.textContent);
      expect(signs).toEqual(['−', '+', '+']);
    });

    it('shows no sign for a zero change and no balance when it is omitted', async () => {
      const screen = await renderWithProvider(
        <Example entries={[{ id: 'z', date: '2026-03-01', title: 'Correction', delta: 0 }]} />,
      );
      const item = screen.getByRole('listitem').element() as HTMLElement;
      expect(item.querySelector('[data-part="sign"]')).toBeNull();
      expect(item.innerText).not.toContain('Balance');
    });

    it('colors negative amounts by negativeTone', async () => {
      const screen = await renderWithProvider(
        <>
          <Example aria-label="A" />
          <Example aria-label="B" negativeTone="success" />
        </>,
      );
      const colorOf = (list: string) =>
        getComputedStyle(
          screen
            .getByRole('list', { name: list })
            .getByRole('listitem')
            .first()
            .element()
            .querySelector('[data-part="amount"]') as Element,
        ).color;
      expect(colorOf('A')).not.toBe(colorOf('B'));
    });

    it('formats plain quantities for the locale when there is no currency', async () => {
      const screen = await renderWithProvider(
        <LedgerList
          aria-label="Stock"
          entries={[
            { id: 'a', date: '2026-03-01', title: 'Delivery', delta: 12500, balance: 12500 },
          ]}
        />,
        { locale: 'pt-BR' },
      );
      const item = screen.getByRole('listitem').element() as HTMLElement;
      const text = item.innerText.replace(/\s+/g, ' ');
      expect(text).toContain('+ 12.500');
      expect(text).toContain('Saldo 12.500');
    });

    it('uses a custom format (absolute value for amounts)', async () => {
      const format = vi.fn((value: number) => `${String(value / 100)} units`);
      const screen = await renderWithProvider(<Example format={format} />);
      const first = (screen.getByRole('listitem').first().element() as HTMLElement).innerText;
      expect(first).toContain('25 units');
      expect(first).toContain('Balance 125 units');
      expect(format).toHaveBeenCalledWith(2500);
    });

    it('formats money by the currency exponent (zero-decimal currency)', async () => {
      const screen = await renderWithProvider(
        <LedgerList
          aria-label="Yen"
          currency="JPY"
          entries={[{ id: 'y', date: '2026-03-01', title: 'Sale', delta: 1500 }]}
        />,
      );
      expect((screen.getByRole('listitem').element() as HTMLElement).innerText).toContain('¥1,500');
    });

    it('renders an empty list without items', async () => {
      const screen = await renderWithProvider(<Example entries={[]} />);
      expect(screen.getByRole('listitem').elements()).toHaveLength(0);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLUListElement>();
      await renderWithProvider(<Example ref={ref} className="extra" data-testid="l" />);
      expect(ref.current).toBeInstanceOf(HTMLUListElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('l');
    });
  });

  describe('delete', () => {
    it('has no delete buttons without onDelete', async () => {
      const screen = await renderWithProvider(<Example />);
      expect(screen.getByRole('button').elements()).toHaveLength(0);
    });

    it('adds a named delete button per entry and reports the entry', async () => {
      const onDelete = vi.fn();
      const screen = await renderWithProvider(<Example onDelete={onDelete} />);
      expect(screen.getByRole('button').elements()).toHaveLength(3);
      await userEvent.click(screen.getByRole('button', { name: 'Delete entry Payment received' }));
      expect(onDelete).toHaveBeenCalledWith(entries[1]);
    });

    it('is reachable and operable by keyboard', async () => {
      const onDelete = vi.fn();
      const screen = await renderWithProvider(<Example onDelete={onDelete} />);
      await userEvent.keyboard('{Tab}');
      await expect
        .element(screen.getByRole('button', { name: 'Delete entry Refund' }))
        .toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onDelete).toHaveBeenCalledWith(entries[0]);
    });
  });

  describe('edit', () => {
    it('has no edit buttons without onEdit', async () => {
      const screen = await renderWithProvider(<Example onDelete={vi.fn()} />);
      expect(screen.getByRole('button', { name: /Edit entry/ }).elements()).toHaveLength(0);
    });

    it('adds a named edit button per entry and reports the entry', async () => {
      const onEdit = vi.fn();
      const screen = await renderWithProvider(<Example onEdit={onEdit} />);
      expect(screen.getByRole('button').elements()).toHaveLength(3);
      await userEvent.click(screen.getByRole('button', { name: 'Edit entry Payment received' }));
      expect(onEdit).toHaveBeenCalledWith(entries[1]);
    });

    it('puts edit before delete in the tab order and operates by keyboard', async () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const screen = await renderWithProvider(<Example onEdit={onEdit} onDelete={onDelete} />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Edit entry Refund' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onEdit).toHaveBeenCalledWith(entries[0]);
      await userEvent.keyboard('{Tab}');
      await expect
        .element(screen.getByRole('button', { name: 'Delete entry Refund' }))
        .toHaveFocus();
    });

    it('skips entries with isEditable false and treats true and omitted the same', async () => {
      const screen = await renderWithProvider(
        <Example
          entries={[
            { id: 'a', date: '2026-03-12', title: 'Fixed', delta: 1, isEditable: false },
            { id: 'b', date: '2026-03-11', title: 'Explicit', delta: 1, isEditable: true },
            { id: 'c', date: '2026-03-10', title: 'Default', delta: 1 },
          ]}
          onEdit={vi.fn()}
        />,
      );
      expect(screen.getByRole('button').elements()).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'Edit entry Fixed' }).elements()).toHaveLength(0);
    });

    it('ignores isEditable without onEdit', async () => {
      const screen = await renderWithProvider(
        <Example entries={[{ id: 'a', title: 'Row', delta: 1, isEditable: true }]} />,
      );
      expect(screen.getByRole('button').elements()).toHaveLength(0);
    });

    it('keeps amounts aligned across rows with both, one or no buttons', async () => {
      const screen = await renderWithProvider(
        <Example
          entries={[
            { id: 'a', date: '2026-03-12', title: 'Both', delta: 100 },
            { id: 'b', date: '2026-03-11', title: 'Edit only', delta: 100, isDeletable: false },
            { id: 'c', date: '2026-03-10', title: 'Delete only', delta: 100, isEditable: false },
            {
              id: 'd',
              date: '2026-03-09',
              title: 'Neither',
              delta: 100,
              isEditable: false,
              isDeletable: false,
            },
          ]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      const rights = (screen.getByRole('listitem').elements() as HTMLElement[]).map(
        (item) => item.querySelector('[data-part="amount"]')?.getBoundingClientRect().right,
      );
      expect(new Set(rights).size).toBe(1);
    });

    it('speaks pt-BR and accepts an override', async () => {
      const pt = await renderWithProvider(<Example onEdit={vi.fn()} />, { locale: 'pt-BR' });
      await expect
        .element(pt.getByRole('button', { name: 'Editar lançamento Refund' }))
        .toBeVisible();
      const en = await renderWithProvider(<Example onEdit={vi.fn()} />, {
        messages: { LedgerList: { editEntry: (title: string) => `Change ${title}` } },
      });
      await expect.element(en.getByRole('button', { name: 'Change Refund' })).toBeVisible();
    });

    it('has no axe violations with edit and delete buttons (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example onEdit={vi.fn()} onDelete={vi.fn()} />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });

  describe('mixed deletable and fixed entries', () => {
    const mixed: LedgerEntry[] = [
      { id: 'm3', date: '2026-03-12', title: 'Refund', delta: -2500, balance: 12500 },
      { id: 'm2', date: '2026-03-10', title: 'Payment received', delta: 5000, balance: 15000 },
      {
        id: 'm1',
        date: '2026-03-01',
        title: 'Opening balance',
        delta: 10000,
        isDeletable: false,
      },
    ];

    it('renders no delete button on a non-deletable entry', async () => {
      const screen = await renderWithProvider(<Example entries={mixed} onDelete={vi.fn()} />);
      expect(screen.getByRole('button').elements()).toHaveLength(2);
      const fixed = screen.getByRole('listitem').elements()[2] as HTMLElement;
      expect(fixed.querySelector('button')).toBeNull();
      expect(fixed.querySelector('[tabindex]')).toBeNull();
      expect(fixed.innerText).toContain('Opening balance');
    });

    it('skips non-deletable entries in the tab order', async () => {
      const onDelete = vi.fn();
      const screen = await renderWithProvider(
        <Example
          entries={[
            { id: 'a', date: '2026-03-12', title: 'Fixed', delta: 1, isDeletable: false },
            { id: 'b', date: '2026-03-11', title: 'First', delta: 1 },
            { id: 'c', date: '2026-03-10', title: 'Second', delta: 1, isDeletable: false },
            { id: 'd', date: '2026-03-09', title: 'Third', delta: 1 },
          ]}
          onDelete={onDelete}
        />,
      );
      await userEvent.keyboard('{Tab}');
      await expect
        .element(screen.getByRole('button', { name: 'Delete entry First' }))
        .toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect
        .element(screen.getByRole('button', { name: 'Delete entry Third' }))
        .toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete.mock.calls[0]?.[0]).toMatchObject({ id: 'd' });
    });

    it('treats isDeletable true and omitted the same', async () => {
      const screen = await renderWithProvider(
        <Example
          entries={[
            { id: 'a', date: '2026-03-12', title: 'Explicit', delta: 1, isDeletable: true },
            { id: 'b', date: '2026-03-11', title: 'Default', delta: 1 },
          ]}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.getByRole('button').elements()).toHaveLength(2);
    });

    it('ignores isDeletable without onDelete', async () => {
      const screen = await renderWithProvider(<Example entries={mixed} />);
      expect(screen.getByRole('button').elements()).toHaveLength(0);
    });

    it('keeps amounts aligned between fixed and deletable rows', async () => {
      const screen = await renderWithProvider(<Example entries={mixed} onDelete={vi.fn()} />);
      const rights = (screen.getByRole('listitem').elements() as HTMLElement[]).map(
        (item) => item.querySelector('[data-part="amount"]')?.getBoundingClientRect().right,
      );
      expect(new Set(rights).size).toBe(1);
    });
  });

  describe('entries without a date', () => {
    const undated: LedgerEntry[] = [
      { id: 'u2', title: 'Adjustment', sub: 'Manual', delta: -300, balance: 700 },
      { id: 'u1', title: 'Opening balance', delta: 1000 },
    ];

    it('renders no time element and no empty date text', async () => {
      const screen = await renderWithProvider(<Example entries={undated} />);
      const items = screen.getByRole('listitem').elements() as HTMLElement[];
      expect(items).toHaveLength(2);
      for (const item of items) expect(item.querySelector('time')).toBeNull();
      expect(items[0]?.innerText.replace(/\s+/g, ' ')).toBe(
        'Adjustment Manual − $3.00 Balance $7.00',
      );
    });

    it('reads title, amount and delete button in DOM order', async () => {
      const screen = await renderWithProvider(
        <Example entries={undated.slice(0, 1)} onDelete={vi.fn()} />,
      );
      const item = screen.getByRole('listitem').element() as HTMLElement;
      const order = Array.from(item.children).map((child) =>
        child.querySelector('button') ? 'button' : child.textContent,
      );
      expect(order).toHaveLength(3);
      expect(order[0]).toContain('Adjustment');
      expect(order[1]).toContain('$3.00');
      expect(order[2]).toBe('button');
    });

    it('lets undated rows share a list with dated rows and keeps columns aligned', async () => {
      const screen = await renderWithProvider(
        <Example
          entries={[
            { id: 'a', date: '2026-03-12', title: 'Dated', delta: 100 },
            { id: 'b', title: 'Undated', delta: 100 },
          ]}
          onDelete={vi.fn()}
        />,
      );
      const items = screen.getByRole('listitem').elements() as HTMLElement[];
      expect(items[0]?.querySelectorAll('time')).toHaveLength(1);
      expect(items[1]?.querySelectorAll('time')).toHaveLength(0);
      const rects = items.map((item) => ({
        title: item.querySelector('span')?.getBoundingClientRect().left,
        amount: item.querySelector('[data-part="amount"]')?.getBoundingClientRect().right,
      }));
      expect(rects[0]?.title).toBe(rects[1]?.title);
      expect(rects[0]?.amount).toBe(rects[1]?.amount);
    });

    it('drops the date column when no entry has a date', async () => {
      const screen = await renderWithProvider(
        <>
          <Example
            aria-label="Dated"
            entries={[{ id: 'a', date: '2026-03-12', title: 'Dated', delta: 100 }]}
          />
          <Example aria-label="Plain" entries={undated.slice(0, 1)} />
        </>,
      );
      const itemOf = (name: string) =>
        screen.getByRole('list', { name }).getByRole('listitem').element() as HTMLElement;
      const titleOffset = (item: HTMLElement) =>
        (item.querySelector('span')?.getBoundingClientRect().left ?? 0) -
        item.getBoundingClientRect().left;
      expect(titleOffset(itemOf('Plain'))).toBeLessThan(titleOffset(itemOf('Dated')));
    });
  });

  describe('i18n', () => {
    it('speaks pt-BR: dates, money, balance and delete label', async () => {
      const screen = await renderWithProvider(<Example onDelete={() => undefined} />, {
        locale: 'pt-BR',
      });
      const first = (screen.getByRole('listitem').first().element() as HTMLElement).innerText;
      expect(first).toContain('12 de mar.');
      expect(first).toContain('25,00');
      expect(first).toContain('US$');
      expect(first).toContain('Saldo');
      await expect
        .element(screen.getByRole('button', { name: 'Excluir lançamento Refund' }))
        .toBeVisible();
    });

    it('applies a provider override', async () => {
      const screen = await renderWithProvider(<Example onDelete={() => undefined} />, {
        messages: { LedgerList: { deleteEntry: (title: string) => `Remove ${title}` } },
      });
      await expect.element(screen.getByRole('button', { name: 'Remove Refund' })).toBeVisible();
    });

    it('applies an instance override', async () => {
      const screen = await renderWithProvider(
        <Example messages={{ balance: (amount: string) => `Running ${amount}` }} />,
      );
      expect((screen.getByRole('listitem').first().element() as HTMLElement).innerText).toContain(
        'Running $125.00',
      );
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
          <Example aria-label="Second" negativeTone="success" onDelete={() => undefined} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with fixed and undated rows (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example
            entries={[
              { id: 'a', date: '2026-03-12', title: 'Refund', delta: -2500, balance: 12500 },
              { id: 'b', title: 'Adjustment', sub: 'No date', delta: 500, isDeletable: false },
              {
                id: 'c',
                date: '2026-03-01',
                title: 'Opening balance',
                delta: 10000,
                isDeletable: false,
              },
            ]}
            onDelete={() => undefined}
          />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations in every negative tone with a focused button (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          {(['neutral', 'success', 'warning', 'danger'] as const).map((tone) => (
            <Example key={tone} aria-label={tone} negativeTone={tone} onDelete={() => undefined} />
          ))}
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
