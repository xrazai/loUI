import { createRef } from 'react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { StatCard } from './StatCard';
import type { StatCardTone } from './StatCard';

describe('StatCard', () => {
  describe('dev warning', () => {
    it('warns once when a colored value has no text to back it', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      // @ts-expect-error -- the types forbid a tone without a note or a trend.
      await renderWithProvider(<StatCard label="Overdue" value="$96.40" tone="danger" />);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('StatCard');
      warn.mockRestore();
    });
  });

  describe('structure', () => {
    it('is a description list: the label is the term of the value and the note', async () => {
      const screen = await renderWithProvider(
        <StatCard label="Sold" value="$37,655.30" note="3 sales" />,
      );
      const root = screen.container.querySelector('dl');
      expect(root).not.toBeNull();
      expect(root?.querySelector('dt')?.textContent).toBe('Sold');
      const descriptions = [...(root?.querySelectorAll('dd') ?? [])].map((dd) => dd.textContent);
      expect(descriptions).toEqual(['$37,655.30', '3 sales']);
    });

    it('renders the aside and the children between value and note', async () => {
      const screen = await renderWithProvider(
        <StatCard label="Paid" value="$10" aside="42%" note="of total">
          <div data-testid="bar">bar</div>
        </StatCard>,
      );
      await expect.element(screen.getByText('42%')).toBeVisible();
      await expect.element(screen.getByTestId('bar')).toBeVisible();
      const order = [...screen.container.querySelectorAll('dd')].map((dd) => dd.textContent);
      expect(order).toEqual(['$10', '42%', 'bar', 'of total']);
    });

    it('uses the number tokens for each size', async () => {
      const md = await renderWithProvider(<StatCard label="A" value="1" />);
      const mdValue = md.container.querySelector('dd');
      expect(getComputedStyle(mdValue as Element).fontSize).toBe('24px');
      await md.unmount();
      const lg = await renderWithProvider(<StatCard label="A" value="1" size="lg" />);
      expect(getComputedStyle(lg.container.querySelector('dd') as Element).fontSize).toBe('30px');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDListElement>();
      await renderWithProvider(
        <StatCard ref={ref} label="A" value="1" className="extra" data-testid="s" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDListElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('s');
    });

    it('has no note element when there is no note and no trend', async () => {
      const screen = await renderWithProvider(<StatCard label="A" value="1" />);
      expect(screen.container.querySelectorAll('dd')).toHaveLength(1);
    });
  });

  describe('tone', () => {
    it('colors the value and keeps the explanation as text', async () => {
      const screen = await renderWithProvider(
        <StatCard label="Overdue" value="$96.40" tone="danger" note="Water since Oct 28" />,
      );
      const value = screen.container.querySelector('dd') as Element;
      expect(screen.container.querySelector('dl')?.getAttribute('data-tone')).toBe('danger');
      expect(getComputedStyle(value).color).not.toBe(
        getComputedStyle(screen.container.querySelector('dt') as Element).color,
      );
      await expect.element(screen.getByText('Water since Oct 28')).toBeVisible();
    });

    it('accepts a trend as the text for a colored value', async () => {
      const screen = await renderWithProvider(
        <StatCard
          label="Sold"
          value="$1"
          tone="success"
          trend={{ direction: 'up', value: 0.12 }}
        />,
      );
      await expect.element(screen.getByText('Up 12%')).toBeVisible();
    });
  });

  describe('trend', () => {
    it('writes the direction and the size of the change as text', async () => {
      const up = await renderWithProvider(
        <StatCard label="A" value="1" trend={{ direction: 'up', value: 0.125 }} />,
      );
      await expect.element(up.getByText('Up 12.5%')).toBeVisible();
      await up.unmount();
      const down = await renderWithProvider(
        <StatCard label="A" value="1" trend={{ direction: 'down', value: -0.04 }} />,
      );
      await expect.element(down.getByText('Down 4%')).toBeVisible();
      await down.unmount();
      const flat = await renderWithProvider(
        <StatCard label="A" value="1" trend={{ direction: 'flat' }} />,
      );
      await expect.element(flat.getByText('No change')).toBeVisible();
    });

    it('adds the comparison text and a decorative arrow', async () => {
      const screen = await renderWithProvider(
        <StatCard
          label="A"
          value="1"
          trend={{ direction: 'up', value: 0.12, comparedTo: 'vs previous 30 days' }}
          note="3 sales"
        />,
      );
      const note = screen.container.querySelectorAll('dd')[1];
      expect(note?.textContent).toBe('Up 12% vs previous 30 days3 sales');
      expect(note?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('defaults the trend tone from the direction and lets you flip it', async () => {
      const up = await renderWithProvider(
        <StatCard label="A" value="1" trend={{ direction: 'up', value: 0.1 }} />,
      );
      expect(up.container.querySelector('dd [data-tone="success"]')).not.toBeNull();
      await up.unmount();
      const cost = await renderWithProvider(
        <StatCard label="A" value="1" trend={{ direction: 'up', value: 0.1, tone: 'danger' }} />,
      );
      expect(cost.container.querySelector('dd [data-tone="danger"]')).not.toBeNull();
    });
  });

  describe('messages and locale', () => {
    it('translates the trend and formats the percent for pt-BR', async () => {
      const screen = await renderWithProvider(
        <StatCard label="Vendido" value="R$ 1,00" trend={{ direction: 'up', value: 0.125 }} />,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByText('Subiu 12,5%')).toBeVisible();
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(
        <StatCard label="A" value="1" trend={{ direction: 'flat' }} />,
        { messages: { StatCard: { trendFlat: 'Unchanged' } } },
      );
      await expect.element(provider.getByText('Unchanged')).toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <StatCard
          label="A"
          value="1"
          trend={{ direction: 'flat' }}
          messages={{ trendFlat: 'Same' }}
        />,
        { messages: { StatCard: { trendFlat: 'Unchanged' } } },
      );
      await expect.element(instance.getByText('Same')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for every tone and size', async () => {
      const screen = await renderWithProvider(
        <div>
          <StatCard label="Neutral" value="$1" />
          <StatCard label="Sold" value="$2" size="lg" note="3 sales" noteTone="success" />
          <StatCard label="Due" value="$3" tone="warning" note="Due in 3 days" />
          <StatCard label="Overdue" value="$4" tone="danger" note="Since Oct 28" aside="12%" />
          <StatCard
            label="Paid"
            value="$5"
            tone="success"
            trend={{ direction: 'down', value: 0.1, tone: 'danger' }}
          />
        </div>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});

/** Type-level checks: the element is built, never rendered. */
const use = (element: ReactElement): ReactElement => element;

describe('StatCard types', () => {
  const flag = Math.random() > 2;
  const tone: StatCardTone = flag ? 'warning' : 'neutral';

  it('accepts a computed tone backed by a note or a trend', () => {
    use(<StatCard label="A" value="1" tone={flag ? 'warning' : 'neutral'} note="text" />);
    use(<StatCard label="A" value="1" tone={tone} note="text" />);
    use(<StatCard label="A" value="1" tone={tone} trend={{ direction: 'up', value: 0.1 }} />);
    use(<StatCard label="A" value="1" tone={tone} note="text" trend={{ direction: 'flat' }} />);
  });

  it('still rejects a non-neutral tone with no words, and accepts neutral alone', () => {
    // @ts-expect-error -- a literal non-neutral tone needs a note or a trend.
    use(<StatCard label="A" value="1" tone="warning" />);
    // @ts-expect-error -- a computed tone needs a note or a trend too.
    use(<StatCard label="A" value="1" tone={tone} />);
    use(<StatCard label="A" value="1" tone="neutral" />);
    use(<StatCard label="A" value="1" />);
  });
});
