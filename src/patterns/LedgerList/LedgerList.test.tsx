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
