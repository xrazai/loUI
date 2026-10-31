import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Rating } from './Rating';

describe('Rating', () => {
  it('is an image named by a pluralized label', async () => {
    const screen = await renderWithProvider(<Rating value={4} />);
    await expect.element(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeVisible();
  });

  it('uses the singular when the scale has one star', async () => {
    const screen = await renderWithProvider(<Rating value={1} max={1} />);
    await expect.element(screen.getByRole('img', { name: '1 out of 1 star' })).toBeVisible();
  });

  it('draws one star per point of the scale and hides the glyphs', async () => {
    const screen = await renderWithProvider(<Rating value={2} max={4} />);
    const root = screen.getByRole('img').element();
    expect(root.querySelectorAll('[data-fill]')).toHaveLength(4);
    expect(root.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('shows half stars and rounds to the nearest half', async () => {
    const screen = await renderWithProvider(<Rating value={3.7} />);
    const root = screen.getByRole('img', { name: '3.5 out of 5 stars' }).element();
    const fills = [...root.querySelectorAll('[data-fill]')].map((n) => n.getAttribute('data-fill'));
    expect(fills).toEqual(['full', 'full', 'full', 'half', 'empty']);
  });

  it('fills half a star visually', async () => {
    const screen = await renderWithProvider(<Rating value={0.5} size="lg" />);
    const root = screen.getByRole('img').element();
    const half = root.querySelector('[data-fill="half"]') as HTMLElement;
    const filled = half.lastElementChild as HTMLElement;
    const ratio = filled.getBoundingClientRect().width / half.getBoundingClientRect().width;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('paints both the filled and the empty star solid, in different colors', async () => {
    const screen = await renderWithProvider(<Rating value={1} />);
    const svgs = screen.getByRole('img').element().querySelectorAll('svg');
    const emptyStar = getComputedStyle(svgs[0] as SVGElement);
    const filledStar = getComputedStyle(svgs[1] as SVGElement);
    expect(filledStar.fill).not.toBe('none');
    expect(emptyStar.fill).not.toBe('none');
    expect(filledStar.color).not.toBe(emptyStar.color);
  });

  it('clamps out-of-range and invalid values', async () => {
    const screen = await renderWithProvider(
      <>
        <Rating value={9} />
        <Rating value={-2} />
        <Rating value={Number.NaN} />
      </>,
    );
    await expect.element(screen.getByRole('img', { name: '5 out of 5 stars' })).toBeVisible();
    expect(screen.getByRole('img', { name: '0 out of 5 stars' }).elements()).toHaveLength(2);
  });

  it('shows the value as text only when asked, hidden from assistive technology', async () => {
    const screen = await renderWithProvider(<Rating value={3.5} showValue />);
    const root = screen.getByRole('img', { name: '3.5 out of 5 stars' }).element();
    expect(root.textContent).toContain('3.5/5');
    expect(root.lastElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('follows the locale in pt-BR', async () => {
    const screen = await renderWithProvider(<Rating value={3.5} showValue />, {
      locale: 'pt-BR',
    });
    await expect.element(screen.getByRole('img', { name: '3,5 de 5 estrelas' })).toBeVisible();
    expect(screen.getByRole('img').element().textContent).toContain('3,5/5');
  });

  it('accepts message overrides per instance and per provider', async () => {
    const instance = await renderWithProvider(
      <Rating value={2} messages={{ label: (v, m) => `Rated ${v} of ${m}` }} />,
    );
    await expect.element(instance.getByRole('img', { name: 'Rated 2 of 5' })).toBeVisible();
    await instance.unmount();
    const provider = await renderWithProvider(<Rating value={2} />, {
      messages: { Rating: { label: (v: string, m: string) => `Score ${v}/${m}` } },
    });
    await expect.element(provider.getByRole('img', { name: 'Score 2/5' })).toBeVisible();
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(<Rating ref={ref} value={1} className="extra" id="r-1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('r-1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Rating value={4} />
        <Rating value={2.5} size="sm" showValue />
        <Rating value={3} size="lg" max={10} />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
