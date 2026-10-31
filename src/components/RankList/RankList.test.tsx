import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { formatCurrency } from '../../utils/currency';
import { RankList } from './RankList';
import type { RankItem } from './RankList';

const products: RankItem[] = [
  { id: 'notebook', label: 'Notebook', value: 4200, meta: '12 units · 18%' },
  { id: 'backpack', label: 'Backpack', value: 9800, meta: '30 units · 42%', swatch: '#8ab4ff' },
  { id: 'headphones', label: 'Headphones', value: 1500 },
  { id: 'lamp', label: 'Lamp', value: 9800 },
];

function labels(container: Element): string[] {
  return [...container.querySelectorAll('li')].map(
    (li) => li.querySelector('span[class*="text"]')?.textContent ?? '',
  );
}

describe('RankList', () => {
  describe('structure', () => {
    it('is an ordered list with one item per row, in the order given', async () => {
      const screen = await renderWithProvider(<RankList items={products} />);
      await expect.element(screen.getByRole('list')).toBeVisible();
      expect(screen.container.querySelector('ol')).not.toBeNull();
      expect(screen.getByRole('listitem').elements()).toHaveLength(4);
      expect(labels(screen.container)).toEqual(['Notebook', 'Backpack', 'Headphones', 'Lamp']);
    });

    it('shows the position, the formatted value and the meta of each row', async () => {
      const screen = await renderWithProvider(<RankList items={products} />);
      const first = screen.getByRole('listitem').first().element();
      expect(first.textContent).toBe('1Notebook4,20012 units · 18%');
    });

    it('can hide the positions', async () => {
      const screen = await renderWithProvider(<RankList items={products} showPosition={false} />);
      expect(screen.getByRole('listitem').first().element().textContent).toBe(
        'Notebook4,20012 units · 18%',
      );
      expect(screen.container.querySelector('[data-positions]')).toBeNull();
    });

    it('draws bars relative to the largest value and keeps them out of the accessibility tree', async () => {
      const screen = await renderWithProvider(<RankList items={products} />);
      const fills = [...screen.container.querySelectorAll('li span[class*="fill"]')];
      const widths = fills.map((fill) => fill.getBoundingClientRect().width);
      const track = fills[1]?.parentElement as Element;
      expect(track.getAttribute('aria-hidden')).toBe('true');
      const full = track.getBoundingClientRect().width;
      expect(widths[1]).toBeCloseTo(full, 0);
      expect(widths[0]).toBeCloseTo(full * (4200 / 9800), 0);
      expect(widths[2]).toBeCloseTo(full * (1500 / 9800), 0);
    });

    it('renders a decorative swatch only when given', async () => {
      const screen = await renderWithProvider(<RankList items={products} />);
      const swatches = screen.container.querySelectorAll('li [data-size]');
      expect(swatches).toHaveLength(1);
      expect(swatches[0]?.getAttribute('aria-hidden')).toBe('true');
      expect(getComputedStyle(swatches[0] as Element).backgroundColor).toBe('rgb(138, 180, 255)');
    });

    it('formats values with the format prop', async () => {
      const screen = await renderWithProvider(
        <RankList items={products} format={(value) => formatCurrency(value, 'USD', 'en-US')} />,
      );
      expect(screen.getByRole('listitem').first().element().textContent).toContain('$42.00');
    });

    it('formats numbers with the provider locale', async () => {
      const screen = await renderWithProvider(<RankList items={products} />, { locale: 'pt-BR' });
      expect(screen.getByRole('listitem').first().element().textContent).toContain('4.200');
    });

    it('is named by aria-label when given', async () => {
      const screen = await renderWithProvider(
        <RankList items={products} aria-label="Top products" />,
      );
      await expect.element(screen.getByRole('list', { name: 'Top products' })).toBeVisible();
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <RankList ref={ref} items={products} className="extra" data-testid="r" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('r');
    });

    it('does not break with zero, negative or non-finite values', async () => {
      const screen = await renderWithProvider(
        <RankList
          items={[
            { label: 'A', value: 0 },
            { label: 'B', value: -3 },
            { label: 'C', value: Number.NaN },
          ]}
        />,
      );
      expect(screen.container.innerHTML).not.toMatch(/NaN%|Infinity/);
    });
  });

  describe('sort and limit are opt-in', () => {
    it('renders everything as given by default (no silent re-sort or truncation)', async () => {
      const many = Array.from({ length: 10 }, (_, index) => ({
        label: `Item ${String(index)}`,
        value: index,
      }));
      const screen = await renderWithProvider(<RankList items={many} />);
      expect(screen.getByRole('listitem').elements()).toHaveLength(10);
      expect(labels(screen.container)[0]).toBe('Item 0');
    });

    it('sorts descending by value with a stable order for ties', async () => {
      const screen = await renderWithProvider(<RankList items={products} sort="desc" />);
      expect(labels(screen.container)).toEqual(['Backpack', 'Lamp', 'Notebook', 'Headphones']);
    });

    it('sorts ascending', async () => {
      const screen = await renderWithProvider(<RankList items={products} sort="asc" />);
      expect(labels(screen.container)).toEqual(['Headphones', 'Notebook', 'Backpack', 'Lamp']);
    });

    it('limits after sorting and numbers the positions of what is shown', async () => {
      const screen = await renderWithProvider(<RankList items={products} sort="desc" limit={2} />);
      expect(labels(screen.container)).toEqual(['Backpack', 'Lamp']);
      expect(screen.getByRole('listitem').elements()).toHaveLength(2);
      expect(screen.getByRole('listitem').first().element().textContent).toMatch(/^1Backpack/);
    });

    it('limits without sorting', async () => {
      const screen = await renderWithProvider(<RankList items={products} limit={1} />);
      expect(labels(screen.container)).toEqual(['Notebook']);
    });

    it('does not mutate the input', async () => {
      const copy = [...products];
      await renderWithProvider(<RankList items={copy} sort="desc" />);
      expect(copy.map((item) => item.label)).toEqual([
        'Notebook',
        'Backpack',
        'Headphones',
        'Lamp',
      ]);
    });
  });

  describe('actionable rows', () => {
    it('renders rows with onAction as buttons and the others as plain rows', async () => {
      const onAction = vi.fn();
      const screen = await renderWithProvider(
        <RankList
          items={[
            { id: 'a', label: 'Ana Lima', value: 10, onAction },
            { id: 'b', label: 'Bruno Costa', value: 5 },
          ]}
        />,
      );
      expect(screen.getByRole('button').elements()).toHaveLength(1);
      await userEvent.click(screen.getByRole('button', { name: /Ana Lima/ }));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('is operated from the keyboard', async () => {
      const onAction = vi.fn();
      const screen = await renderWithProvider(
        <RankList items={[{ label: 'Ana Lima', value: 10, onAction }]} />,
      );
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: /Ana Lima/ })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onAction).toHaveBeenCalledTimes(2);
    });

    it('names the button with the label and the value', async () => {
      const screen = await renderWithProvider(
        <RankList items={[{ label: 'Ana Lima', value: 1500, onAction: vi.fn() }]} />,
      );
      await expect
        .element(screen.getByRole('button', { name: /^Ana Lima\s?1,500$/ }))
        .toBeVisible();
    });
  });

  describe('empty state', () => {
    it('shows the default text', async () => {
      const screen = await renderWithProvider(<RankList items={[]} />);
      await expect.element(screen.getByText('No data for this period')).toBeVisible();
      expect(screen.getByRole('list').elements()).toHaveLength(0);
    });

    it('shows a custom empty state', async () => {
      const screen = await renderWithProvider(
        <RankList items={[]} emptyState={<p>No sales yet</p>} />,
      );
      await expect.element(screen.getByText('No sales yet')).toBeVisible();
    });

    it('is empty when the limit is 0', async () => {
      const screen = await renderWithProvider(<RankList items={products} limit={0} />);
      await expect.element(screen.getByText('No data for this period')).toBeVisible();
    });
  });

  describe('messages and locale', () => {
    it('translates the empty text to pt-BR', async () => {
      const screen = await renderWithProvider(<RankList items={[]} />, { locale: 'pt-BR' });
      await expect.element(screen.getByText('Sem dados no período')).toBeVisible();
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(<RankList items={[]} />, {
        messages: { RankList: { empty: 'Nothing ranked' } },
      });
      await expect.element(provider.getByText('Nothing ranked')).toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <RankList items={[]} messages={{ empty: 'No ranking' }} />,
        { messages: { RankList: { empty: 'Nothing ranked' } } },
      );
      await expect.element(instance.getByText('No ranking')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for plain, actionable, sorted and empty lists', async () => {
      const screen = await renderWithProvider(
        <div>
          <RankList items={products} aria-label="Top products" />
          <RankList
            sort="desc"
            limit={3}
            showPosition={false}
            items={products.map((item) => ({ ...item, onAction: vi.fn() }))}
            aria-label="Top customers"
          />
          <RankList items={[]} />
        </div>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
