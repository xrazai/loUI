import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { formatCurrency } from '../../utils/currency';
import { ProportionBar } from './ProportionBar';
import type { ProportionSegment } from './ProportionBar';

const payments: ProportionSegment[] = [
  { label: 'Pix', value: 1693000 },
  { label: 'Cash', value: 573400 },
  { label: 'Debit', value: 538800 },
  { label: 'Credit', value: 359600 },
];

describe('ProportionBar', () => {
  describe('structure', () => {
    it('is an image whose name summarizes every part with its percentage', async () => {
      const screen = await renderWithProvider(<ProportionBar segments={payments} />);
      await expect
        .element(screen.getByRole('img', { name: 'Pix 53%, Cash 18%, Debit 17%, and Credit 11%' }))
        .toBeVisible();
    });

    it('starts the summary with the label of the whole', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          label="Payment methods"
          segments={[
            { label: 'Cash', value: 1 },
            { label: 'Card', value: 3 },
          ]}
        />,
      );
      await expect
        .element(screen.getByRole('img', { name: 'Payment methods: Cash 25% and Card 75%' }))
        .toBeVisible();
    });

    it('draws one segment per non-zero part, in proportion, separated by a gap', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          segments={[
            { label: 'A', value: 3 },
            { label: 'B', value: 0 },
            { label: 'C', value: 1 },
          ]}
        />,
      );
      const segments = [...screen.container.querySelectorAll('[role="img"] > div')];
      expect(segments).toHaveLength(2);
      const widths = segments.map((segment) => segment.getBoundingClientRect().width);
      const [first = 0, second = 1] = widths;
      expect(first / second).toBeGreaterThan(2.6);
      expect(first / second).toBeLessThan(3.1);
      const track = screen.container.querySelector('[role="img"]') as Element;
      const gap = getComputedStyle(track).columnGap;
      expect(gap).toBe('2px');
      const total = widths.reduce((sum, width) => sum + width, 0);
      expect(total + 2).toBeCloseTo(track.getBoundingClientRect().width, 0);
    });

    it('fills the track when the values are fractions of 1', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          segments={[
            { label: 'A', value: 0.2 },
            { label: 'B', value: 0.3 },
          ]}
        />,
      );
      const track = screen.container.querySelector('[role="img"]') as Element;
      const total = [...track.children].reduce(
        (sum, child) => sum + child.getBoundingClientRect().width,
        0,
      );
      expect(total + 2).toBeCloseTo(track.getBoundingClientRect().width, 0);
    });

    it('uses the height token and a pill radius', async () => {
      const screen = await renderWithProvider(<ProportionBar segments={payments} />);
      const track = screen.container.querySelector('[role="img"]') as Element;
      expect(track.getBoundingClientRect().height).toBe(10);
    });

    it('survives empty, all-zero, negative and non-finite input', async () => {
      const empty = await renderWithProvider(<ProportionBar segments={[]} />);
      expect(empty.container.innerHTML).not.toMatch(/NaN|Infinity/);
      await empty.unmount();
      const zeros = await renderWithProvider(
        <ProportionBar
          segments={[
            { label: 'A', value: 0 },
            { label: 'B', value: -5 },
            { label: 'C', value: Number.NaN },
          ]}
          legend
        />,
      );
      expect(zeros.container.innerHTML).not.toMatch(/NaN%|Infinity/);
      await expect.element(zeros.getByRole('img', { name: /A 0%, B 0%, and C 0%/ })).toBeVisible();
      expect(zeros.container.querySelector('[data-empty]')).not.toBeNull();
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <ProportionBar ref={ref} segments={payments} className="extra" data-testid="p" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('p');
    });
  });

  describe('distinguishable segments', () => {
    it('uses four ramp steps and then repeats them with a hatch', async () => {
      const many = Array.from({ length: 8 }, (_, index) => ({
        label: `Part ${String(index + 1)}`,
        value: 1,
      }));
      const screen = await renderWithProvider(<ProportionBar segments={many} />);
      const segments = [...screen.container.querySelectorAll('[role="img"] > div')];
      expect(segments.map((s) => s.getAttribute('data-ramp'))).toEqual([
        '0',
        '1',
        '2',
        '3',
        '0',
        '1',
        '2',
        '3',
      ]);
      expect(segments.map((s) => s.hasAttribute('data-hatched'))).toEqual([
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
      ]);
      expect(getComputedStyle(segments[4] as Element).backgroundImage).toContain('gradient');
      expect(getComputedStyle(segments[0] as Element).backgroundImage).toBe('none');
      // The four solid steps are four different colors.
      const colors = new Set(segments.slice(0, 4).map((s) => getComputedStyle(s).backgroundColor));
      expect(colors.size).toBe(4);
    });

    it('applies an explicit color without hatching', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          segments={[
            { label: 'Done', value: 1, color: 'var(--ds-success)' },
            { label: 'Open', value: 1 },
          ]}
        />,
      );
      const [done, open] = [...screen.container.querySelectorAll('[role="img"] > div')];
      expect(getComputedStyle(done as Element).backgroundColor).not.toBe(
        getComputedStyle(open as Element).backgroundColor,
      );
    });

    it('warns in development when more parts than can look different have no color', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const many = Array.from({ length: 9 }, (_, index) => ({
        label: `P${String(index)}`,
        value: 1,
      }));
      await renderWithProvider(<ProportionBar segments={many} />);
      expect(warn).toHaveBeenCalled();
      expect(String(warn.mock.calls[0]?.[0])).toContain('ProportionBar');
      warn.mockRestore();
    });
  });

  describe('legend', () => {
    it('lists each part with its percentage and formatted value', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          legend
          segments={payments}
          format={(value) => formatCurrency(value, 'USD', 'en-US')}
        />,
      );
      const items = screen.getByRole('listitem').elements();
      expect(items).toHaveLength(4);
      expect(items[0]?.textContent).toBe('Pix53%$16,930.00');
      expect(items[3]?.textContent).toBe('Credit11%$3,596.00');
    });

    it('defaults to localized numbers and supports percent digits', async () => {
      const screen = await renderWithProvider(
        <ProportionBar legend percentDigits={1} segments={payments} />,
        { locale: 'pt-BR' },
      );
      const first = screen.getByRole('listitem').first().element();
      expect(first.textContent).toBe('Pix53,5%1.693.000');
    });

    it('lists parts with a zero value too, and hides the swatches from assistive technology', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          legend
          segments={[
            { label: 'A', value: 5 },
            { label: 'B', value: 0 },
          ]}
        />,
      );
      expect(screen.getByRole('listitem').elements()).toHaveLength(2);
      expect(screen.container.querySelector('li span[aria-hidden="true"]')).not.toBeNull();
    });

    it('is not rendered by default', async () => {
      const screen = await renderWithProvider(<ProportionBar segments={payments} />);
      expect(screen.getByRole('list').elements()).toHaveLength(0);
    });
  });

  describe('messages and locale', () => {
    it('joins the summary with the locale list format in pt-BR', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          label="Formas de pagamento"
          segments={[
            { label: 'Pix', value: 1 },
            { label: 'Dinheiro', value: 1 },
          ]}
        />,
        { locale: 'pt-BR' },
      );
      await expect
        .element(screen.getByRole('img', { name: 'Formas de pagamento: Pix 50% e Dinheiro 50%' }))
        .toBeVisible();
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(<ProportionBar segments={payments.slice(0, 1)} />, {
        messages: {
          ProportionBar: { segment: (label: string, percent: string) => `${percent} ${label}` },
        },
      });
      await expect.element(provider.getByRole('img', { name: '100% Pix' })).toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <ProportionBar
          segments={payments.slice(0, 1)}
          messages={{ segment: (label: string, percent: string) => `${label} is ${percent}` }}
        />,
        {
          messages: {
            ProportionBar: { segment: (label: string, percent: string) => `${percent} ${label}` },
          },
        },
      );
      await expect.element(instance.getByRole('img', { name: 'Pix is 100%' })).toBeVisible();
    });
  });

  describe('legend columns and links', () => {
    const rows: ProportionSegment[] = [
      { id: 'pix', label: 'Pix', value: 75, count: 12 },
      { id: 'cash', label: 'Cash', value: 25, count: 3 },
    ];

    it('prints share and value by default, in that order', async () => {
      const screen = await renderWithProvider(<ProportionBar legend segments={rows} />);
      expect(screen.getByRole('listitem').elements()[0]?.textContent).toBe('Pix75%75');
    });

    it('prints the chosen columns in the chosen order, count included', async () => {
      const screen = await renderWithProvider(
        <ProportionBar legend legendColumns={['value', 'share', 'count']} segments={rows} />,
      );
      expect(screen.getByRole('listitem').elements()[0]?.textContent).toBe('Pix7575%12');
      const list = screen.container.querySelector('ul') as HTMLElement;
      expect(list.style.getPropertyValue('--ds-proportion-bar-columns')).toBe('3');
    });

    it('links each bar segment to its legend item by the segment id', async () => {
      const screen = await renderWithProvider(<ProportionBar legend segments={rows} />);
      const bar = screen.container.querySelectorAll('[role="img"] > [data-segment]');
      const items = screen.container.querySelectorAll('li[data-segment]');
      expect([...bar].map((n) => n.getAttribute('data-segment'))).toEqual(['pix', 'cash']);
      expect([...items].map((n) => n.getAttribute('data-segment'))).toEqual(['pix', 'cash']);
      expect(items[0]?.id.endsWith('-pix')).toBe(true);
    });

    it('draws the remainder of a total as an unlabelled track and names it', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          legend
          label="Invoice"
          total={2000}
          segments={[{ id: 'paid', label: 'Paid', value: 1240 }]}
        />,
      );
      await expect
        .element(screen.getByRole('img', { name: 'Invoice: Paid 62% and Remaining 38%' }))
        .toBeVisible();
      const rows = screen.getByRole('listitem').elements();
      expect(rows.map((row) => row.textContent)).toEqual(['Paid62%1,240', 'Remaining38%760']);
      expect(screen.container.querySelectorAll('[role="img"] > div')).toHaveLength(2);
    });

    it('ignores a total smaller than the sum', async () => {
      const screen = await renderWithProvider(
        <ProportionBar total={10} segments={rows} label="X" />,
      );
      await expect
        .element(screen.getByRole('img', { name: 'X: Pix 75% and Cash 25%' }))
        .toBeVisible();
    });

    it('translates the remaining part to pt-BR and takes overrides', async () => {
      const screen = await renderWithProvider(
        <ProportionBar total={200} segments={[{ label: 'Pago', value: 100 }]} />,
        { locale: 'pt-BR' },
      );
      await expect
        .element(screen.getByRole('img', { name: 'Pago 50% e Restante 50%' }))
        .toBeVisible();
      await screen.rerender(
        <ProportionBar
          total={200}
          segments={[{ label: 'Paid', value: 100 }]}
          messages={{ remaining: 'Left' }}
        />,
      );
      await expect.element(screen.getByRole('img', { name: 'Paid 50% e Left 50%' })).toBeVisible();
    });

    it('has no axe violations with columns, count and a remainder', async () => {
      const screen = await renderWithProvider(
        <ProportionBar
          legend
          total={200}
          legendColumns={['value', 'share', 'count']}
          segments={rows}
        />,
      );
      await expectNoA11yViolations(screen.container);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with and without legend, explicit colors and many parts', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const screen = await renderWithProvider(
        <div>
          <ProportionBar segments={payments} />
          <ProportionBar legend segments={payments} label="Payments" />
          <ProportionBar
            legend
            segments={[
              { label: 'Done', value: 3, color: 'var(--ds-success)' },
              { label: 'Late', value: 1, color: 'var(--ds-danger)' },
            ]}
          />
          <ProportionBar
            legend
            segments={Array.from({ length: 8 }, (_, index) => ({
              label: `Part ${String(index + 1)}`,
              value: index + 1,
            }))}
          />
        </div>,
      );
      await expectNoA11yViolations(screen.container);
      warn.mockRestore();
    });
  });
});
