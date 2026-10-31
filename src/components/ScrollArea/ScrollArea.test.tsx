import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ScrollArea } from './ScrollArea';

function Rows({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => <p key={index}>Row {index}</p>);
}

describe('ScrollArea', () => {
  it('becomes a focusable, labelled region while its content overflows', async () => {
    const screen = await renderWithProvider(
      <ScrollArea aria-label="Order history" style={{ blockSize: 100 }}>
        <Rows count={20} />
      </ScrollArea>,
    );
    const region = screen.getByRole('region', { name: 'Order history' });
    await expect.element(region).toBeInTheDocument();
    await expect.element(region).toHaveAttribute('tabindex', '0');
  });

  it('is a plain container when nothing overflows', async () => {
    const screen = await renderWithProvider(
      <ScrollArea aria-label="Order history" data-testid="area" style={{ blockSize: 400 }}>
        <Rows count={2} />
      </ScrollArea>,
    );
    const area = screen.getByTestId('area').element();
    await expect.poll(() => area.getAttribute('data-scrollable')).toBeNull();
    expect(area.hasAttribute('tabindex')).toBe(false);
    expect(area.hasAttribute('role')).toBe(false);
    expect(area.hasAttribute('aria-label')).toBe(false);
  });

  it('becomes focusable when content grows past the box', async () => {
    function Growing() {
      return (
        <ScrollArea aria-label="Log" data-testid="area" style={{ blockSize: 100 }}>
          <p>Short</p>
          <button
            type="button"
            onClick={(event) => {
              const rows = document.createElement('div');
              rows.style.blockSize = '400px';
              event.currentTarget.after(rows);
            }}
          >
            Grow
          </button>
        </ScrollArea>
      );
    }
    const screen = await renderWithProvider(<Growing />);
    const area = screen.getByTestId('area').element();
    expect(area.hasAttribute('tabindex')).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Grow' }));
    await expect.poll(() => area.getAttribute('tabindex')).toBe('0');
  });

  it('scrolls with the keyboard once focused', async () => {
    const screen = await renderWithProvider(
      <ScrollArea aria-label="Order history" data-testid="area" style={{ blockSize: 100 }}>
        <Rows count={30} />
      </ScrollArea>,
    );
    const area = screen.getByTestId('area').element();
    await userEvent.tab();
    expect(document.activeElement).toBe(area);
    await userEvent.keyboard('{PageDown}');
    await expect.poll(() => area.scrollTop).toBeGreaterThan(0);
  });

  it('scrolls only on the axes it is told to', async () => {
    const screen = await renderWithProvider(
      <>
        <ScrollArea aria-label="Vertical" data-testid="v" />
        <ScrollArea aria-label="Horizontal" data-testid="h" orientation="horizontal" />
        <ScrollArea aria-label="Both" data-testid="b" orientation="both" />
      </>,
    );
    const overflow = (id: string) => {
      const style = getComputedStyle(screen.getByTestId(id).element());
      return [style.overflowX, style.overflowY];
    };
    expect(overflow('v')).toEqual(['hidden', 'auto']);
    expect(overflow('h')).toEqual(['auto', 'hidden']);
    expect(overflow('b')).toEqual(['auto', 'auto']);
  });

  it('has thin scrollbars', async () => {
    const screen = await renderWithProvider(<ScrollArea aria-label="Thin" data-testid="area" />);
    expect(getComputedStyle(screen.getByTestId('area').element()).scrollbarWidth).toBe('thin');
  });

  it('accepts aria-labelledby as the name', async () => {
    const screen = await renderWithProvider(
      <>
        <h2 id="title">Activity</h2>
        <ScrollArea aria-labelledby="title" style={{ blockSize: 60 }}>
          <Rows count={20} />
        </ScrollArea>
      </>,
    );
    await expect.element(screen.getByRole('region', { name: 'Activity' })).toBeInTheDocument();
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(
      <ScrollArea ref={ref} aria-label="Area" className="extra" id="s1">
        <Rows count={1} />
      </ScrollArea>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('s1');
  });

  it('has no axe violations while scrolling and while not', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <ScrollArea aria-label="Long list" style={{ blockSize: 80 }}>
          <Rows count={20} />
        </ScrollArea>
        <ScrollArea aria-label="Short list">
          <Rows count={1} />
        </ScrollArea>
      </main>,
    );
    await expect.element(screen.getByRole('region', { name: 'Long list' })).toBeInTheDocument();
    await expectNoA11yViolations(screen.container);
  });
});
