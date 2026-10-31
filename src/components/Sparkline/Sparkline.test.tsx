import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Sparkline } from './Sparkline';

const data = [3, 5, 4, 8, 6, 9, 7];

describe('Sparkline', () => {
  describe('rendering and ARIA', () => {
    it('is an image named by its summary', async () => {
      const screen = await renderWithProvider(
        <Sparkline data={data} aria-label="Orders, last 7 days: up 133%" />,
      );
      await expect
        .element(screen.getByRole('img', { name: 'Orders, last 7 days: up 133%' }))
        .toBeVisible();
    });

    it('can be named by another element', async () => {
      const screen = await renderWithProvider(
        <>
          <span id="s">Revenue trend</span>
          <Sparkline data={data} aria-labelledby="s" />
        </>,
      );
      await expect.element(screen.getByRole('img', { name: 'Revenue trend' })).toBeVisible();
    });

    it('is hidden from assistive technology when decorative', async () => {
      const screen = await renderWithProvider(<Sparkline data={data} decorative />);
      expect(screen.getByRole('img').elements()).toHaveLength(0);
      const svg = screen.container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('role')).toBeNull();
    });

    it('is not focusable', async () => {
      await renderWithProvider(<Sparkline data={data} aria-label="Trend" />);
      expect(document.querySelector('svg')?.getAttribute('focusable')).toBe('false');
    });

    it('draws one line path for continuous data, and one per run when there are gaps', async () => {
      const continuous = await renderWithProvider(<Sparkline data={data} aria-label="Trend" />);
      expect(continuous.container.querySelectorAll('path')).toHaveLength(1);
      await continuous.unmount();
      const gaps = await renderWithProvider(
        <Sparkline data={[1, 2, null, 4, 5]} aria-label="Trend" />,
      );
      expect(gaps.container.querySelectorAll('path')).toHaveLength(2);
    });

    it('draws an area under the line only for variant="area"', async () => {
      const line = await renderWithProvider(<Sparkline data={data} aria-label="Trend" />);
      expect(line.container.querySelectorAll('path')).toHaveLength(1);
      await line.unmount();
      const area = await renderWithProvider(
        <Sparkline data={data} variant="area" aria-label="Trend" />,
      );
      expect(area.container.querySelectorAll('path')).toHaveLength(2);
      expect(area.container.querySelector('svg')?.getAttribute('data-variant')).toBe('area');
    });

    it('shows the last-value dot and the min/max markers on request', async () => {
      const bare = await renderWithProvider(<Sparkline data={data} aria-label="Trend" />);
      expect(bare.container.querySelectorAll('circle')).toHaveLength(0);
      await bare.unmount();
      const full = await renderWithProvider(
        <Sparkline data={data} aria-label="Trend" showLast showMinMax />,
      );
      expect(full.container.querySelectorAll('circle')).toHaveLength(3);
      expect(full.container.querySelector('circle[data-kind="min"]')).not.toBeNull();
      expect(full.container.querySelector('circle[data-kind="max"]')).not.toBeNull();
    });

    it('omits min and max markers when every value is equal', async () => {
      const screen = await renderWithProvider(
        <Sparkline data={[4, 4, 4]} aria-label="Flat" showMinMax />,
      );
      expect(screen.container.querySelectorAll('circle')).toHaveLength(0);
    });

    it('renders nothing but the svg for empty data', async () => {
      const screen = await renderWithProvider(<Sparkline data={[]} aria-label="No data" />);
      expect(screen.container.querySelectorAll('path, circle')).toHaveLength(0);
      await expect.element(screen.getByRole('img', { name: 'No data' })).toBeInTheDocument();
    });

    it('uses the default size and accepts width and height', async () => {
      const screen = await renderWithProvider(
        <>
          <Sparkline data={data} aria-label="Default" />
          <Sparkline data={data} aria-label="Custom" width={160} height={40} />
        </>,
      );
      const box = (name: string) =>
        screen.getByRole('img', { name }).element().getBoundingClientRect();
      expect([box('Default').width, box('Default').height]).toEqual([96, 24]);
      expect([box('Custom').width, box('Custom').height]).toEqual([160, 40]);
    });

    it('shrinks to a narrow container and keeps its aspect ratio', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 48 }}>
          <Sparkline data={data} aria-label="Narrow" />
        </div>,
      );
      const rect = screen.getByRole('img', { name: 'Narrow' }).element().getBoundingClientRect();
      expect(rect.width).toBe(48);
      expect(rect.height).toBe(12);
    });

    it('takes the line color from the tone and the stroke width from the token', async () => {
      const screen = await renderWithProvider(
        <>
          <Sparkline data={data} aria-label="Neutral" />
          <Sparkline data={data} aria-label="Danger" tone="danger" />
        </>,
      );
      const stroke = (name: string) => {
        const path = screen.getByRole('img', { name }).element().querySelector('path');
        return path ? getComputedStyle(path) : undefined;
      };
      expect(stroke('Neutral')?.strokeWidth).toBe('1.5px');
      expect(stroke('Neutral')?.stroke).not.toBe(stroke('Danger')?.stroke);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<SVGSVGElement>();
      await renderWithProvider(
        <Sparkline ref={ref} data={data} aria-label="Trend" className="extra" data-testid="sp" />,
      );
      expect(ref.current).toBeInstanceOf(SVGSVGElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('sp');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in every variant and tone (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          {(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map((tone) => (
            <Sparkline
              key={tone}
              data={data}
              tone={tone}
              aria-label={`Trend, ${tone}`}
              showLast
              showMinMax
            />
          ))}
          <Sparkline data={data} variant="area" aria-label="Area trend" />
          <Sparkline data={[1, null, 3]} aria-label="With a gap" />
          <Sparkline data={[]} aria-label="Empty trend" />
          <Sparkline data={data} decorative />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
