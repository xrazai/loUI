import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { resetMissingNameWarnings } from '../Field/labeling';
import { DonutMeter } from './DonutMeter';

describe('DonutMeter', () => {
  describe('rendering and ARIA', () => {
    it('is a meter with value, range and a formatted percentage', async () => {
      const screen = await renderWithProvider(<DonutMeter label="Storage used" value={62} />);
      const meter = screen.getByRole('meter', { name: 'Storage used' });
      await expect.element(meter).toBeVisible();
      const element = meter.element();
      expect(element.getAttribute('aria-valuenow')).toBe('62');
      expect(element.getAttribute('aria-valuemin')).toBe('0');
      expect(element.getAttribute('aria-valuemax')).toBe('100');
      expect(element.getAttribute('aria-valuetext')).toBe('62%');
    });

    it('prints the percentage in the center and the label under the ring', async () => {
      const screen = await renderWithProvider(<DonutMeter label="Storage used" value={62} />);
      await expect.element(screen.getByText('62%')).toBeVisible();
      const ring = screen.getByText('62%').element().getBoundingClientRect();
      const label = screen.getByText('Storage used').element().getBoundingClientRect();
      expect(label.top).toBeGreaterThanOrEqual(ring.bottom);
    });

    it('can be named by aria-label or aria-labelledby', async () => {
      const screen = await renderWithProvider(
        <>
          <DonutMeter aria-label="Goal" value={10} />
          <span id="x">Capacity</span>
          <DonutMeter aria-labelledby="x" value={20} />
        </>,
      );
      await expect.element(screen.getByRole('meter', { name: 'Goal' })).toBeVisible();
      await expect.element(screen.getByRole('meter', { name: 'Capacity' })).toBeVisible();
    });

    it('computes the percentage from minValue and maxValue', async () => {
      const screen = await renderWithProvider(
        <DonutMeter aria-label="Budget" value={6.2} minValue={0} maxValue={10} />,
      );
      await expect.element(screen.getByText('62%')).toBeVisible();
      expect(screen.getByRole('meter').element().getAttribute('aria-valuenow')).toBe('6.2');
    });

    it('clamps values outside the range', async () => {
      const screen = await renderWithProvider(
        <>
          <DonutMeter aria-label="Over" value={150} />
          <DonutMeter aria-label="Under" value={-20} />
        </>,
      );
      await expect.element(screen.getByText('100%')).toBeVisible();
      await expect.element(screen.getByText('0%')).toBeVisible();
    });

    it('survives an empty range', async () => {
      const screen = await renderWithProvider(
        <DonutMeter aria-label="Empty range" value={5} minValue={5} maxValue={5} />,
      );
      await expect.element(screen.getByRole('meter')).toBeVisible();
      expect(screen.container.textContent).not.toContain('NaN');
    });

    it('tells screen readers what the value means with valueLabel', async () => {
      const screen = await renderWithProvider(
        <DonutMeter label="Storage" value={62} valueLabel="6.2 of 10 GB" />,
      );
      expect(screen.getByRole('meter').element().getAttribute('aria-valuetext')).toBe(
        '6.2 of 10 GB',
      );
      await expect.element(screen.getByText('62%')).toBeVisible();
    });

    it('replaces the center with centerLabel and hides it with showValue={false}', async () => {
      const custom = await renderWithProvider(
        <DonutMeter aria-label="Days left" value={40} centerLabel="12 d" />,
      );
      await expect.element(custom.getByText('12 d')).toBeVisible();
      expect(custom.container.textContent).not.toContain('40%');
      await custom.unmount();
      const hidden = await renderWithProvider(
        <DonutMeter aria-label="Quiet" value={40} showValue={false} />,
      );
      expect(hidden.container.textContent).toBe('');
    });

    it('formats the percentage for the active locale', async () => {
      const screen = await renderWithProvider(<DonutMeter aria-label="Meta" value={26} />, {
        locale: 'de-DE',
      });
      expect(screen.container.textContent).toMatch(/26\s%/);
    });

    it('uses pt-BR formatting', async () => {
      const screen = await renderWithProvider(<DonutMeter aria-label="Meta" value={26} />, {
        locale: 'pt-BR',
      });
      expect(screen.container.textContent).toMatch(/26\s?%/);
    });

    it('draws the ring from the value: dash length equals the percentage', async () => {
      const screen = await renderWithProvider(<DonutMeter aria-label="Ring" value={25} />);
      const fill = screen.container.querySelectorAll('circle')[1];
      expect(fill).toBeDefined();
      expect(fill ? getComputedStyle(fill).strokeDasharray.replaceAll(' ', '') : '').toMatch(
        /^25(px)?,100(px)?$/,
      );
    });

    it('uses the diameters from the size tokens', async () => {
      const screen = await renderWithProvider(
        <>
          <DonutMeter aria-label="Small" size="sm" value={50} />
          <DonutMeter aria-label="Medium" value={50} />
          <DonutMeter aria-label="Large" size="lg" value={50} />
        </>,
      );
      const svgSize = (name: string) => {
        const svg = screen.getByRole('meter', { name }).element().querySelector('svg');
        return svg ? svg.getBoundingClientRect().width : 0;
      };
      expect([svgSize('Small'), svgSize('Medium'), svgSize('Large')]).toEqual([48, 72, 96]);
    });

    it('exposes tone and size as data attributes and colors the ring by tone', async () => {
      const screen = await renderWithProvider(
        <>
          <DonutMeter aria-label="Calm" value={50} />
          <DonutMeter aria-label="Risky" value={90} tone="danger" size="sm" />
        </>,
      );
      const risky = screen.getByRole('meter', { name: 'Risky' }).element();
      expect(risky.getAttribute('data-tone')).toBe('danger');
      expect(risky.getAttribute('data-size')).toBe('sm');
      const stroke = (name: string) => {
        const fill = screen.getByRole('meter', { name }).element().querySelectorAll('circle')[1];
        return fill ? getComputedStyle(fill).stroke : '';
      };
      expect(stroke('Calm')).not.toBe(stroke('Risky'));
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <DonutMeter ref={ref} aria-label="Ring" value={5} className="extra" data-testid="d" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('d');
    });

    it('warns in development when it has no accessible name', async () => {
      resetMissingNameWarnings();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      // @ts-expect-error -- a name is required by the types; this simulates a consumer who bypasses them.
      await renderWithProvider(<DonutMeter value={5} />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('DonutMeter needs an accessible name'),
      );
      warn.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in every tone and size (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          {(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map((tone) => (
            <DonutMeter key={tone} label={`Tone ${tone}`} tone={tone} value={64} />
          ))}
          <DonutMeter aria-label="Small" size="sm" value={100} />
          <DonutMeter label="Large" size="lg" value={0} />
          <DonutMeter aria-label="No value" showValue={false} value={30} />
          <DonutMeter label="Custom" centerLabel="12 d" value={30} valueLabel="12 days left" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
