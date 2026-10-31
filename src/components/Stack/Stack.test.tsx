import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Stack } from './Stack';

describe('Stack', () => {
  it('lays children out in a column with the default 16px gap', async () => {
    const screen = await renderWithProvider(
      <Stack data-testid="stack">
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
    const style = getComputedStyle(screen.getByTestId('stack').element());
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('column');
    expect(style.rowGap).toBe('16px');
  });

  it.each([
    [1, '4px'],
    [2, '8px'],
    [3, '12px'],
    [5, '20px'],
    [6, '24px'],
    [8, '32px'],
    [12, '48px'],
    [16, '64px'],
  ] as const)('maps gap %i to the space token (%s)', async (gap, expected) => {
    const screen = await renderWithProvider(
      <Stack data-testid="stack" gap={gap}>
        <span>One</span>
        <span>Two</span>
      </Stack>,
    );
    expect(getComputedStyle(screen.getByTestId('stack').element()).rowGap).toBe(expected);
  });

  it('aligns children on the cross axis', async () => {
    const screen = await renderWithProvider(
      <>
        <Stack data-testid="stretch">
          <span>One</span>
        </Stack>
        <Stack data-testid="start" align="start">
          <span>One</span>
        </Stack>
        <Stack data-testid="center" align="center">
          <span>One</span>
        </Stack>
        <Stack data-testid="end" align="end">
          <span>One</span>
        </Stack>
      </>,
    );
    const items = (id: string) => getComputedStyle(screen.getByTestId(id).element()).alignItems;
    expect(items('stretch')).toBe('stretch');
    expect(items('start')).toBe('flex-start');
    expect(items('center')).toBe('center');
    expect(items('end')).toBe('flex-end');
  });

  it('renders the element given by as, with the list reset and role for lists', async () => {
    const screen = await renderWithProvider(
      <Stack as="ul" data-testid="list">
        <li>One</li>
        <li>Two</li>
      </Stack>,
    );
    const list = screen.getByTestId('list').element();
    expect(list.tagName).toBe('UL');
    expect(list.getAttribute('role')).toBe('list');
    expect(getComputedStyle(list).listStyleType).toBe('none');
    await expect.element(screen.getByRole('listitem').first()).toBeInTheDocument();
  });

  it('keeps consumer style entries and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(
      <Stack ref={ref} className="extra" style={{ opacity: 0.5 }} id="s1">
        <span>One</span>
      </Stack>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('s1');
    expect(ref.current?.style.opacity).toBe('0.5');
    expect(ref.current?.style.getPropertyValue('--ds-stack-gap')).toBe('var(--ds-space-4)');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Stack gap={3}>
          <h1>Page</h1>
          <Stack as="ul" gap={1}>
            <li>One</li>
          </Stack>
        </Stack>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
