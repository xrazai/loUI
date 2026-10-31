import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders an h2 by default', async () => {
    const screen = await renderWithProvider(<Heading>Orders</Heading>);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Orders' })).toBeVisible();
  });

  it.each([1, 2, 3, 4, 5, 6] as const)('level %i renders the matching element', async (level) => {
    const screen = await renderWithProvider(<Heading level={level}>Orders</Heading>);
    await expect.element(screen.getByRole('heading', { level })).toBeInTheDocument();
  });

  it('keeps the level and the visual size independent', async () => {
    const screen = await renderWithProvider(
      <>
        <Heading level={1} size="heading" data-testid="small-h1">
          Small h1
        </Heading>
        <Heading level={4} size="display" data-testid="big-h4">
          Big h4
        </Heading>
      </>,
    );
    const small = screen.getByTestId('small-h1').element();
    const big = screen.getByTestId('big-h4').element();
    expect(small.tagName).toBe('H1');
    expect(big.tagName).toBe('H4');
    expect(getComputedStyle(small).fontSize).toBe('17px');
    expect(getComputedStyle(big).fontSize).toBe('34px');
  });

  it.each([
    ['display', '34px', '40px'],
    ['title', '22px', '30px'],
    ['heading', '17px', '24px'],
  ] as const)('size %s is %s over %s', async (size, fontSize, lineHeight) => {
    const screen = await renderWithProvider(
      <Heading size={size} data-testid="heading">
        Orders
      </Heading>,
    );
    const style = getComputedStyle(screen.getByTestId('heading').element());
    expect(style.fontSize).toBe(fontSize);
    expect(style.lineHeight).toBe(lineHeight);
    expect(style.fontWeight).toBe('600');
  });

  it('defaults the size from the level: title for h1, heading otherwise', async () => {
    const screen = await renderWithProvider(
      <>
        <Heading level={1} data-testid="h1">
          One
        </Heading>
        <Heading level={3} data-testid="h3">
          Three
        </Heading>
      </>,
    );
    expect(screen.getByTestId('h1').element().getAttribute('data-size')).toBe('title');
    expect(screen.getByTestId('h3').element().getAttribute('data-size')).toBe('heading');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLHeadingElement>();
    await renderWithProvider(
      <Heading ref={ref} className="extra" id="h">
        Orders
      </Heading>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('h');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Heading level={1} size="display">
          Orders
        </Heading>
        <Heading level={2}>Recent</Heading>
        <Heading level={3} size="title">
          Details
        </Heading>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
