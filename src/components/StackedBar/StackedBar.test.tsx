import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { StackedBar } from './StackedBar';
import type { StackedBarDatum, StackedBarSeries } from './StackedBar';

const series: StackedBarSeries[] = [
  { id: 'online', label: 'Online' },
  { id: 'store', label: 'Store' },
  { id: 'phone', label: 'Phone' },
];

const quarters: StackedBarDatum[] = [
  { label: 'Q1', values: { online: 40, store: 30, phone: 10 } },
  { label: 'Q2', values: { online: 50, store: 20, phone: 30 } },
  { label: 'Q3', values: { online: 20, store: 20, phone: 0 } },
];

function bars(container: Element): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="img"]')];
}

describe('StackedBar', () => {
  describe('structure', () => {
    it('is a named group with one image per bar, each summarizing its parts and total', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders per quarter" />,
      );
      await expect.element(screen.getByRole('group', { name: 'Orders per quarter' })).toBeVisible();
      const names = bars(screen.container).map((bar) => bar.getAttribute('aria-label'));
      expect(names).toEqual([
        'Q1: Online 40, Store 30, and Phone 10. Total 80.',
        'Q2: Online 50, Store 20, and Phone 30. Total 100.',
        'Q3: Online 20, Store 20, and Phone 0. Total 40.',
      ]);
    });

    it('can be named by a visible heading', async () => {
      const screen = await renderWithProvider(
        <>
          <h2 id="heading">Orders</h2>
          <StackedBar data={quarters} series={series} aria-labelledby="heading" />
        </>,
      );
      await expect.element(screen.getByRole('group', { name: 'Orders' })).toBeVisible();
    });

    it('draws one segment per non-zero part, in proportion', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const first = bars(screen.container)[0] as HTMLElement;
      expect(first.children).toHaveLength(3);
      const widths = [...first.children].map((child) => child.getBoundingClientRect().width);
      const [online = 0, store = 0] = widths;
      expect(online / store).toBeGreaterThan(1.25);
      expect(online / store).toBeLessThan(1.4);
      const third = bars(screen.container)[2] as HTMLElement;
      expect(third.children).toHaveLength(2);
    });

    it('scales bars to the largest total, or to full length when normalized', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const [q1, q2, q3] = bars(screen.container).map((bar) => bar.getBoundingClientRect().width);
      expect(q2).toBeGreaterThan(q1 ?? 0);
      expect((q3 ?? 0) / (q2 ?? 1)).toBeCloseTo(0.4, 1);
      await screen.rerender(
        <StackedBar data={quarters} series={series} aria-label="Orders" normalize />,
      );
      const widths = bars(screen.container).map((bar) =>
        Math.round(bar.getBoundingClientRect().width),
      );
      expect(new Set(widths).size).toBe(1);
    });

    it('separates neighbouring parts with a gap', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const bar = bars(screen.container)[0] as HTMLElement;
      expect(getComputedStyle(bar).columnGap).toBe('2px');
    });

    it('stacks columns bottom to top when vertical and honors height', async () => {
      const screen = await renderWithProvider(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders"
          orientation="vertical"
          height={240}
        />,
      );
      const bar = bars(screen.container)[0] as HTMLElement;
      expect(getComputedStyle(bar).flexDirection).toBe('column-reverse');
      const list = screen.container.querySelector('ul') as HTMLElement;
      expect(list.getBoundingClientRect().height).toBeCloseTo(240, 0);
      const first = bars(screen.container)[0] as HTMLElement;
      const second = bars(screen.container)[1] as HTMLElement;
      expect(second.getBoundingClientRect().height).toBeGreaterThan(
        first.getBoundingClientRect().height,
      );
    });

    it('hatches series beyond the fourth and keeps explicit colors solid', async () => {
      const many: StackedBarSeries[] = Array.from({ length: 5 }, (_, index) => ({
        id: `s${String(index)}`,
        label: `Series ${String(index + 1)}`,
      }));
      const values = Object.fromEntries(many.map((s) => [s.id, 1]));
      const screen = await renderWithProvider(
        <StackedBar data={[{ label: 'All', values }]} series={many} aria-label="Many" />,
      );
      const segments = [...(bars(screen.container)[0] as HTMLElement).children];
      expect(segments.map((segment) => segment.hasAttribute('data-hatched'))).toEqual([
        false,
        false,
        false,
        false,
        true,
      ]);
      await screen.rerender(
        <StackedBar
          data={[{ label: 'All', values }]}
          series={many.map((s, index) => (index === 4 ? { ...s, color: 'var(--ds-success)' } : s))}
          aria-label="Many"
        />,
      );
      const last = [...(bars(screen.container)[0] as HTMLElement).children][4] as HTMLElement;
      expect(last.hasAttribute('data-hatched')).toBe(false);
      expect(last.style.getPropertyValue('--ds-stacked-bar-color')).toBe('var(--ds-success)');
    });

    it('shows a visible track for a bar with no value', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={[{ label: 'Q4', values: {} }]} series={series} aria-label="Orders" />,
      );
      const bar = bars(screen.container)[0] as HTMLElement;
      expect(bar.hasAttribute('data-empty')).toBe(true);
      expect(bar.getAttribute('aria-label')).toBe('Q4: Online 0, Store 0, and Phone 0. Total 0.');
    });

    it('says so when there is no data', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={[]} series={series} aria-label="Orders" />,
      );
      await expect.element(screen.getByText('No data to show')).toBeVisible();
    });

    it('spreads rest props and forwards the ref', async () => {
      const ref = createRef<HTMLDivElement>();
      const screen = await renderWithProvider(
        <StackedBar
          ref={ref}
          data={quarters}
          series={series}
          aria-label="Orders"
          data-testid="stacked"
          className="extra"
        />,
      );
      expect(ref.current).toBe(screen.getByTestId('stacked').element());
      expect(ref.current?.classList.contains('extra')).toBe(true);
    });
  });

  describe('data table and legend', () => {
    it('carries every number in a hidden table with a caption and a total column', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders per quarter" />,
      );
      const table = screen.container.querySelector('table') as HTMLTableElement;
      expect(table.caption?.textContent).toBe('Data for Orders per quarter');
      const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent);
      expect(headers).toEqual(['Category', 'Online', 'Store', 'Phone', 'Total']);
      const row = [...(table.querySelectorAll('tbody tr')[1] as Element).children].map(
        (cell) => cell.textContent,
      );
      expect(row).toEqual(['Q2', '50', '20', '30', '100']);
    });

    it('formats values with the consumer function everywhere', async () => {
      const screen = await renderWithProvider(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders"
          format={(value) => `$${String(value)}`}
        />,
      );
      expect(bars(screen.container)[0]?.getAttribute('aria-label')).toContain('Total $80.');
      expect(screen.container.querySelector('tbody td')?.textContent).toBe('$40');
      expect(screen.getByRole('list', { name: 'Legend' }).element().textContent).toContain('$110');
    });

    it('shows the legend with the total of each series, and can omit it', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const items = screen.getByRole('listitem').elements();
      expect(items.map((item) => item.textContent)).toEqual(
        expect.arrayContaining(['Online110', 'Store70', 'Phone40']),
      );
      await screen.rerender(
        <StackedBar data={quarters} series={series} aria-label="Orders" legend={false} />,
      );
      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
      expect(screen.getByRole('list', { name: 'Legend' }).elements()).toHaveLength(0);
    });

    it('hides a series through the interactive legend and drops it from bars, totals and table', async () => {
      const onHiddenSeriesChange = vi.fn();
      const screen = await renderWithProvider(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders"
          interactiveLegend
          onHiddenSeriesChange={onHiddenSeriesChange}
        />,
      );
      await screen.getByRole('button', { name: /Store/ }).click();
      expect(onHiddenSeriesChange).toHaveBeenLastCalledWith(['store']);
      expect(bars(screen.container)[0]?.getAttribute('aria-label')).toBe(
        'Q1: Online 40 and Phone 10. Total 50.',
      );
      const headers = [...screen.container.querySelectorAll('thead th')].map(
        (th) => th.textContent,
      );
      expect(headers).toEqual(['Category', 'Online', 'Phone', 'Total']);
      // Colors of the remaining series do not shift.
      const segments = [...(bars(screen.container)[0] as HTMLElement).children];
      expect(segments.map((segment) => segment.getAttribute('data-ramp'))).toEqual(['0', '2']);
    });

    it('supports hidden series as a controlled prop', async () => {
      const screen = await renderWithProvider(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders"
          interactiveLegend
          hiddenSeries={['online']}
        />,
      );
      expect(bars(screen.container)[0]?.getAttribute('aria-label')).toBe(
        'Q1: Store 30 and Phone 10. Total 40.',
      );
      await screen.getByRole('button', { name: /Phone/ }).click();
      // Controlled: nothing changes until the parent updates the prop.
      expect(bars(screen.container)[0]?.getAttribute('aria-label')).toBe(
        'Q1: Store 30 and Phone 10. Total 40.',
      );
    });

    it('explains when every series is hidden', async () => {
      const screen = await renderWithProvider(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders"
          hiddenSeries={['online', 'store', 'phone']}
        />,
      );
      await expect
        .element(screen.getByText('All series are hidden. Show one in the legend.'))
        .toBeVisible();
      expect(bars(screen.container)).toHaveLength(0);
    });
  });

  describe('legend share', () => {
    it('adds the share of each series next to its total', async () => {
      const screen = await renderWithProvider(
        <StackedBar
          aria-label="Sales"
          data={[
            { label: 'Q1', values: { a: 30, b: 10 } },
            { label: 'Q2', values: { a: 30, b: 30 } },
          ]}
          series={[
            { id: 'a', label: 'Online' },
            { id: 'b', label: 'Store' },
          ]}
          legendShare
        />,
      );
      const legend = screen.getByRole('list', { name: 'Legend' }).element();
      const rows = [...legend.querySelectorAll('li')].map((li) => li.textContent);
      expect(rows).toEqual(['Online6060%', 'Store4040%']);
    });
  });

  describe('keyboard', () => {
    it('has one tab stop and moves between bars with the arrow keys, Home and End', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const [q1, q2, q3] = bars(screen.container);
      expect(bars(screen.container).filter((bar) => bar.tabIndex === 0)).toHaveLength(1);
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(q1);
      await userEvent.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(q2);
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(q3);
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(q3);
      await userEvent.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(q2);
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(q1);
      await userEvent.keyboard('{End}');
      expect(document.activeElement).toBe(q3);
    });

    it('returns to the last bar when tabbing back in', async () => {
      const screen = await renderWithProvider(
        <>
          <button type="button">Before</button>
          <StackedBar data={quarters} series={series} aria-label="Orders" />
        </>,
      );
      await userEvent.keyboard('{Tab}{Tab}{ArrowRight}');
      expect(document.activeElement).toBe(bars(screen.container)[1]);
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}');
      expect(document.activeElement).toBe(bars(screen.container)[1]);
    });

    it('prints the summary of the focused bar in a readout, and Escape dismisses it', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const readout = screen.container.querySelector('p[aria-hidden="true"]') as HTMLElement;
      expect(readout.textContent).toBe('');
      await userEvent.keyboard('{Tab}');
      expect(readout.textContent).toBe('Q1: Online 40, Store 30, and Phone 10. Total 80.');
      await userEvent.keyboard('{ArrowRight}');
      expect(readout.textContent).toContain('Q2:');
      await userEvent.keyboard('{Escape}');
      expect(readout.textContent).toBe('');
    });

    it('shows the readout on hover too', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
      );
      const readout = screen.container.querySelector('p[aria-hidden="true"]') as HTMLElement;
      await userEvent.hover(bars(screen.container)[2] as HTMLElement);
      expect(readout.textContent).toContain('Q3:');
      await userEvent.unhover(bars(screen.container)[2] as HTMLElement);
      expect(readout.textContent).toBe('');
    });
  });

  describe('messages', () => {
    it('translates summaries, table and legend to pt-BR', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Pedidos" />,
        { locale: 'pt-BR' },
      );
      expect(bars(screen.container)[0]?.getAttribute('aria-label')).toBe(
        'Q1: Online 40, Store 30 e Phone 10. Total 80.',
      );
      expect(screen.container.querySelector('caption')?.textContent).toBe('Dados de Pedidos');
      await expect.element(screen.getByRole('list', { name: 'Legenda' })).toBeVisible();
    });

    it('takes provider and instance overrides', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders" />,
        { messages: { StackedBar: { total: 'Sum' } } },
      );
      const headers = [...screen.container.querySelectorAll('thead th')].map(
        (th) => th.textContent,
      );
      expect(headers.at(-1)).toBe('Sum');
      await screen.rerender(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders"
          messages={{ empty: 'Nothing' }}
          categoryLabel="Quarter"
        />,
      );
      expect(screen.container.querySelector('thead th')?.textContent).toBe('Quarter');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations horizontally', async () => {
      const screen = await renderWithProvider(
        <StackedBar data={quarters} series={series} aria-label="Orders per quarter" />,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations vertically with an interactive legend and a hidden series', async () => {
      const screen = await renderWithProvider(
        <StackedBar
          data={quarters}
          series={series}
          aria-label="Orders per quarter"
          orientation="vertical"
          interactiveLegend
          defaultHiddenSeries={['store']}
        />,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when empty or fully hidden', async () => {
      const screen = await renderWithProvider(
        <>
          <StackedBar data={[]} series={series} aria-label="Empty" />
          <StackedBar
            data={quarters}
            series={series}
            aria-label="Hidden"
            hiddenSeries={['online', 'store', 'phone']}
          />
        </>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
