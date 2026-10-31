import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { contrastRatio } from '../../utils/color';
import { Badge } from './Badge';
import type { BadgeTone } from './Badge';

const TONES: BadgeTone[] = ['neutral', 'accent', 'success', 'warning', 'danger'];

/** Paints the colors over each other on a canvas and returns the opaque result as hex. */
function composite(layers: string[]): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is not available');
  for (const layer of layers) {
    context.fillStyle = layer;
    context.fillRect(0, 0, 1, 1);
  }
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

describe('Badge', () => {
  it('renders the text in a span with the neutral tone and a decorative dot by default', async () => {
    const screen = await renderWithProvider(<Badge>Draft</Badge>);
    const badge = screen.getByText('Draft').element();
    expect(badge.tagName).toBe('SPAN');
    expect(badge.getAttribute('data-tone')).toBe('neutral');
    expect(badge.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('can hide the dot', async () => {
    const screen = await renderWithProvider(<Badge dot={false}>Draft</Badge>);
    expect(screen.getByText('Draft').element().querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('spreads rest props, merges className and takes the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(
      <Badge ref={ref} className="extra" data-testid="b" title="Order status">
        Shipped
      </Badge>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.getAttribute('data-testid')).toBe('b');
    expect(ref.current?.getAttribute('title')).toBe('Order status');
  });

  it.each(TONES)(
    'keeps text contrast at 4.5:1 or more on its soft background (%s)',
    async (tone) => {
      const screen = await renderWithProvider(<Badge tone={tone}>Status</Badge>);
      const style = getComputedStyle(screen.getByText('Status').element());
      const surface = getComputedStyle(document.body).backgroundColor;
      const background = composite([surface, style.backgroundColor]);
      const foreground = composite([background, style.color]);
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('has no axe violations in any tone', async () => {
    const screen = await renderWithProvider(
      <main>
        {TONES.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
        <Badge dot={false}>No dot</Badge>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
