import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Swatch } from './Swatch';
import { isHexColor } from './hex';

describe('Swatch', () => {
  describe('rendering and ARIA', () => {
    it('is a named image when it has a label', async () => {
      const screen = await renderWithProvider(<Swatch color="#1f3a93" label="Navy" />);
      await expect.element(screen.getByRole('img', { name: 'Navy' })).toBeVisible();
    });

    it('is hidden from assistive technology when decorative', async () => {
      const screen = await renderWithProvider(
        <span data-testid="host">
          <Swatch color="#1f3a93" decorative />
        </span>,
      );
      expect(screen.getByRole('img').elements()).toHaveLength(0);
      const swatch = screen.getByTestId('host').element().firstElementChild;
      expect(swatch?.getAttribute('aria-hidden')).toBe('true');
    });

    it('paints the color through the --ds-swatch-color custom property only', async () => {
      const screen = await renderWithProvider(<Swatch color="#ff0000" label="Red" />);
      const element = screen.getByRole('img').element();
      expect(element.style.getPropertyValue('--ds-swatch-color')).toBe('#ff0000');
      expect(element.style.backgroundColor).toBe('');
      expect(getComputedStyle(element).backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('uses the size tokens', async () => {
      const screen = await renderWithProvider(
        <>
          <Swatch color="#fff" label="Small" size="sm" />
          <Swatch color="#fff" label="Medium" />
          <Swatch color="#fff" label="Large" size="lg" />
        </>,
      );
      const width = (name: string) =>
        screen.getByRole('img', { name }).element().getBoundingClientRect().width;
      expect(width('Small')).toBe(16);
      expect(width('Medium')).toBe(20);
      expect(width('Large')).toBe(32);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLSpanElement>();
      await renderWithProvider(
        <Swatch ref={ref} color="#fff" label="White" className="extra" data-testid="s" />,
      );
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('s');
    });

    it('draws the inset ring from the swatch-ring token', async () => {
      const screen = await renderWithProvider(<Swatch color="#000000" label="Black" />);
      const style = getComputedStyle(screen.getByRole('img').element());
      expect(style.borderTopWidth).toBe('1px');
      expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  describe('hex validation', () => {
    it('recognizes #rgb and #rrggbb only', () => {
      expect(isHexColor('#fff')).toBe(true);
      expect(isHexColor('#1F3A93')).toBe(true);
      expect(isHexColor('1f3a93')).toBe(false);
      expect(isHexColor('#12345')).toBe(false);
      expect(isHexColor('red')).toBe(false);
    });

    it('is false for transparent, an empty string, null and undefined', () => {
      expect(isHexColor('transparent')).toBe(false);
      expect(isHexColor('')).toBe(false);
      expect(isHexColor(null)).toBe(false);
      expect(isHexColor(undefined)).toBe(false);
    });

    it('is exported from the package entry point', async () => {
      const entry = await import('../../index');
      expect(entry.isHexColor).toBe(isHexColor);
    });

    it.each([
      ['undefined', undefined],
      ['null', null],
      ['an empty string', ''],
    ])('renders an empty decorative circle for %s without throwing', async (_name, color) => {
      const screen = await renderWithProvider(
        <span data-testid="host">
          <Swatch color={color} decorative />
        </span>,
      );
      const swatch = screen.getByTestId('host').element().firstElementChild as HTMLElement;
      expect(swatch.getAttribute('aria-hidden')).toBe('true');
      expect(swatch.hasAttribute('data-empty')).toBe(true);
      expect(swatch.style.getPropertyValue('--ds-swatch-color')).toBe('');
      expect(getComputedStyle(swatch).borderTopStyle).toBe('dashed');
    });

    it('omits the color prop entirely', async () => {
      const screen = await renderWithProvider(<Swatch label="No color" />);
      await expect.element(screen.getByRole('img', { name: 'No color' })).toBeVisible();
    });

    it('still throws for non-empty invalid values such as transparent', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(renderWithProvider(<Swatch color="transparent" label="Bad" />)).rejects.toThrow(
        /Swatch expects a hex color/,
      );
      error.mockRestore();
    });

    it('throws for an invalid color in development', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await expect(renderWithProvider(<Swatch color="not-a-color" label="Bad" />)).rejects.toThrow(
        /Swatch expects a hex color/,
      );
      error.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Swatch color="#1f3a93" label="Navy" />
          <p>
            <Swatch color="#c0392b" decorative /> Brick
          </p>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
