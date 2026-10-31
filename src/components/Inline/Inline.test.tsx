import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Inline } from './Inline';

describe('Inline', () => {
  it('lays children out in a wrapping row with an 8px gap by default', async () => {
    const screen = await renderWithProvider(
      <Inline data-testid="inline">
        <span>One</span>
        <span>Two</span>
      </Inline>,
    );
    const style = getComputedStyle(screen.getByTestId('inline').element());
    expect(style.display).toBe('flex');
    expect(style.flexDirection).toBe('row');
    expect(style.flexWrap).toBe('wrap');
    expect(style.columnGap).toBe('8px');
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('flex-start');
  });

  it('maps gap, align, justify and wrap', async () => {
    const screen = await renderWithProvider(
      <Inline data-testid="inline" gap={6} align="baseline" justify="between" wrap={false}>
        <span>One</span>
        <span>Two</span>
      </Inline>,
    );
    const style = getComputedStyle(screen.getByTestId('inline').element());
    expect(style.columnGap).toBe('24px');
    expect(style.alignItems).toBe('baseline');
    expect(style.justifyContent).toBe('space-between');
    expect(style.flexWrap).toBe('nowrap');
  });

  it('wraps children onto a new line in a narrow container', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 150 }}>
        <Inline gap={2}>
          <span data-testid="a" style={{ inlineSize: 100 }}>
            A
          </span>
          <span data-testid="b" style={{ inlineSize: 100 }}>
            B
          </span>
        </Inline>
      </div>,
    );
    const a = screen.getByTestId('a').element().getBoundingClientRect();
    const b = screen.getByTestId('b').element().getBoundingClientRect();
    expect(b.top).toBeGreaterThan(a.top);
  });

  it('renders a list element with list semantics', async () => {
    const screen = await renderWithProvider(
      <Inline as="ol" data-testid="list">
        <li>One</li>
      </Inline>,
    );
    const list = screen.getByTestId('list').element();
    expect(list.tagName).toBe('OL');
    expect(list.getAttribute('role')).toBe('list');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(
      <Inline ref={ref} className="extra" id="i1">
        <span>One</span>
      </Inline>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('i1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <Inline justify="end">
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </Inline>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
