import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Grid } from './Grid';

function Cells({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} data-testid={`cell-${String(index)}`}>
      Cell {index}
    </div>
  ));
}

describe('Grid', () => {
  it('renders a fixed number of equal columns', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 600 }}>
        <Grid data-testid="grid" columns={3} gap={4}>
          <Cells count={6} />
        </Grid>
      </div>,
    );
    const grid = screen.getByTestId('grid').element();
    expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(3);
    expect(getComputedStyle(grid).columnGap).toBe('16px');
    const a = screen.getByTestId('cell-0').element().getBoundingClientRect();
    const b = screen.getByTestId('cell-3').element().getBoundingClientRect();
    expect(b.left).toBeCloseTo(a.left, 0);
    expect(b.top).toBeGreaterThan(a.top);
  });

  it('auto-fills columns of at least minItemWidth', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 1000 }}>
        <Grid data-testid="grid" minItemWidth="md" gap={4}>
          <Cells count={8} />
        </Grid>
      </div>,
    );
    // 240px minimum and a 16px gap in 1000px: 3 columns fit (3 * 240 + 2 * 16 = 752; 4 need 1008).
    expect(
      getComputedStyle(screen.getByTestId('grid').element()).gridTemplateColumns.split(' '),
    ).toHaveLength(3);
  });

  it('collapses to one column, without overflow, in a container narrower than the minimum', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 200 }}>
        <Grid data-testid="grid" minItemWidth="lg">
          <Cells count={3} />
        </Grid>
      </div>,
    );
    const grid = screen.getByTestId('grid').element();
    expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(1);
    expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);
  });

  it.each([
    ['sm', 160],
    ['md', 240],
    ['lg', 320],
  ] as const)('minItemWidth %s resolves to %ipx', async (size, px) => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: px * 2 + 16 }}>
        <Grid data-testid="grid" minItemWidth={size} gap={4}>
          <Cells count={4} />
        </Grid>
      </div>,
    );
    expect(
      getComputedStyle(screen.getByTestId('grid').element()).gridTemplateColumns.split(' '),
    ).toHaveLength(2);
  });

  it('renders a list element with list semantics', async () => {
    const screen = await renderWithProvider(
      <Grid as="ul" columns={2} data-testid="list">
        <li>One</li>
      </Grid>,
    );
    const list = screen.getByTestId('list').element();
    expect(list.tagName).toBe('UL');
    expect(list.getAttribute('role')).toBe('list');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(
      <Grid ref={ref} columns={2} className="extra" id="g1">
        <Cells count={2} />
      </Grid>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('g1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <Grid minItemWidth="sm">
          <Cells count={4} />
        </Grid>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
