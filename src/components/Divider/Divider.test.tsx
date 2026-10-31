import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a horizontal separator by default', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 300 }}>
        <Divider data-testid="divider" />
      </div>,
    );
    const element = screen.getByTestId('divider').element();
    expect(element.tagName).toBe('HR');
    expect(element.getAttribute('data-orientation')).toBe('horizontal');
    const box = element.getBoundingClientRect();
    expect(box.height).toBe(1);
    expect(box.width).toBe(300);
  });

  it('renders a vertical separator with aria-orientation that stretches in a row', async () => {
    const screen = await renderWithProvider(
      <div style={{ display: 'flex', blockSize: 40 }}>
        <span>A</span>
        <Divider orientation="vertical" data-testid="divider" />
        <span>B</span>
      </div>,
    );
    await expect
      .element(screen.getByRole('separator'))
      .toHaveAttribute('aria-orientation', 'vertical');
    const box = screen.getByTestId('divider').element().getBoundingClientRect();
    expect(box.width).toBe(1);
    expect(box.height).toBe(40);
  });

  it.each([
    ['subtle', 'rgb(30, 30, 34)'],
    ['default', null],
    ['strong', null],
  ] as const)('variant %s uses its own line token', async (variant, expected) => {
    const screen = await renderWithProvider(<Divider data-testid="divider" variant={variant} />);
    const color = getComputedStyle(screen.getByTestId('divider').element()).backgroundColor;
    if (expected) expect(color).toBe(expected);
    else expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('uses three different colors for the three variants', async () => {
    const screen = await renderWithProvider(
      <>
        <Divider data-testid="subtle" variant="subtle" />
        <Divider data-testid="default" />
        <Divider data-testid="strong" variant="strong" />
      </>,
    );
    const colors = ['subtle', 'default', 'strong'].map(
      (id) => getComputedStyle(screen.getByTestId(id).element()).backgroundColor,
    );
    expect(new Set(colors).size).toBe(3);
  });

  it('merges className and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(<Divider ref={ref} className="extra" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <p>Above</p>
        <Divider />
        <p>Below</p>
        <div style={{ display: 'flex', blockSize: 24 }}>
          <span>A</span>
          <Divider orientation="vertical" />
          <span>B</span>
        </div>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
