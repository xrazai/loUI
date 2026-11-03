import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { SplitLayout } from './SplitLayout';
import type { SplitLayoutProps } from './SplitLayout';

function renderLayout(width: number, props: Partial<SplitLayoutProps> = {}, dir?: 'rtl' | 'ltr') {
  return renderWithProvider(
    <div style={{ inlineSize: width }} dir={dir}>
      <SplitLayout
        data-testid="layout"
        aside={<p data-testid="side">Side panel</p>}
        asideLabel="Chat"
        {...props}
      >
        <p data-testid="main">Main content</p>
      </SplitLayout>
    </div>,
  );
}

const box = (element: Element) => element.getBoundingClientRect();

describe('SplitLayout', () => {
  it('puts a 360px aside at the inline end by default, main first in the DOM', async () => {
    const screen = await renderLayout(1000);
    const aside = screen.getByRole('complementary', { name: 'Chat' }).element();
    const main = screen.getByTestId('main').element();
    expect(box(aside).width).toBe(360);
    expect(box(aside).left).toBeGreaterThanOrEqual(box(main).right);
    expect(main.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('draws the aside at the start without changing the DOM order', async () => {
    const screen = await renderLayout(1000, { asidePosition: 'start' });
    const aside = screen.getByRole('complementary', { name: 'Chat' }).element();
    const main = screen.getByTestId('main').element();
    expect(box(aside).right).toBeLessThanOrEqual(box(main).left);
    expect(main.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('flips in right-to-left text', async () => {
    const screen = await renderLayout(1000, {}, 'rtl');
    const aside = screen.getByRole('complementary', { name: 'Chat' }).element();
    const main = screen.getByTestId('main').element();
    expect(box(aside).right).toBeLessThanOrEqual(box(main).left);
  });

  it.each([
    ['sm', 280],
    ['md', 360],
    ['lg', 480],
  ] as const)('sizes the aside at asideWidth %s', async (asideWidth, width) => {
    const screen = await renderLayout(1100, { asideWidth });
    expect(box(screen.getByRole('complementary').element()).width).toBe(width);
  });

  it('uses the same md width as the AppShell detail token', async () => {
    const screen = await renderLayout(1000);
    const style = getComputedStyle(screen.getByTestId('layout').element());
    expect(style.getPropertyValue('--ds-split-layout-aside-w-md').trim()).toBe(
      style.getPropertyValue('--ds-app-shell-detail-w').trim(),
    );
  });

  it('applies the gap as a space token key', async () => {
    const screen = await renderLayout(1000, { gap: 8 });
    const layout = screen.getByTestId('main').element().parentElement?.parentElement as HTMLElement;
    expect(getComputedStyle(layout).columnGap).toBe('32px');
  });

  it('stacks the aside under the main content below the collapse width', async () => {
    const screen = await renderLayout(700);
    const aside = screen.getByRole('complementary', { name: 'Chat' }).element();
    const main = screen.getByTestId('main').element();
    expect(box(aside).top).toBeGreaterThanOrEqual(box(main).bottom);
    expect(box(aside).left).toBe(box(main).left);
  });

  it('stacks at the start position too, main first', async () => {
    const screen = await renderLayout(700, { asidePosition: 'start' });
    const aside = screen.getByRole('complementary', { name: 'Chat' }).element();
    const main = screen.getByTestId('main').element();
    expect(box(aside).top).toBeGreaterThanOrEqual(box(main).bottom);
  });

  it('collapses at the chosen breakpoint and never when asked', async () => {
    const lg = await renderLayout(900, { collapseBelow: 'lg' });
    expect(box(lg.getByRole('complementary').element()).top).toBeGreaterThan(
      box(lg.getByTestId('main').element()).top,
    );
    await lg.unmount();
    const never = await renderLayout(400, { collapseBelow: 'never', asideWidth: 'sm' });
    expect(box(never.getByRole('complementary').element()).top).toBe(
      box(never.getByTestId('main').element()).top,
    );
  });

  it('repeats the --ds-breakpoint-* tokens in its container queries', async () => {
    const screen = await renderLayout(1000);
    const style = getComputedStyle(screen.getByTestId('layout').element());
    expect(style.getPropertyValue('--ds-breakpoint-sm').trim()).toBe('480px');
    expect(style.getPropertyValue('--ds-breakpoint-md').trim()).toBe('768px');
    expect(style.getPropertyValue('--ds-breakpoint-lg').trim()).toBe('1024px');
    // md switches exactly at the token: 768 is beside, 767 is stacked.
    await screen.unmount();
    const at = await renderLayout(768);
    expect(box(at.getByRole('complementary').element()).top).toBe(
      box(at.getByTestId('main').element()).top,
    );
    await at.unmount();
    const below = await renderLayout(767);
    expect(box(below.getByRole('complementary').element()).top).toBeGreaterThan(
      box(below.getByTestId('main').element()).top,
    );
  });

  it('renders a plain div, not a landmark, without asideLabel', async () => {
    const screen = await renderLayout(1000, { asideLabel: undefined });
    expect(screen.container.querySelector('aside')).toBeNull();
    await expect.element(screen.getByTestId('side')).toBeVisible();
  });

  it('renders no aside column when aside is empty', async () => {
    const screen = await renderLayout(1000, { aside: null });
    expect(screen.container.querySelector('aside')).toBeNull();
    expect(box(screen.getByTestId('main').element()).width).toBe(1000);
  });

  it('keeps a sticky aside in view while the page scrolls, within the viewport height', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 1000, blockSize: 300, overflow: 'auto' }} data-testid="scroller">
        <SplitLayout sticky aside={<p>Side panel</p>} asideLabel="Chat">
          <div style={{ blockSize: 2000 }}>Long main content</div>
        </SplitLayout>
      </div>,
    );
    const scroller = screen.getByTestId('scroller').element();
    const aside = screen.getByRole('complementary', { name: 'Chat' }).element();
    expect(getComputedStyle(aside).position).toBe('sticky');
    expect(getComputedStyle(aside).overflowY).toBe('auto');
    const before = box(aside).top - box(scroller).top;
    scroller.scrollTop = 800;
    await expect.poll(() => scroller.scrollTop).toBe(800);
    expect(box(aside).top - box(scroller).top).toBeCloseTo(16, 0);
    expect(before).toBeLessThanOrEqual(16 + 1);
  });

  it('makes a sticky aside that scrolls a keyboard stop, and only then', async () => {
    const tall = await renderWithProvider(
      <div style={{ blockSize: 300, inlineSize: 1000 }}>
        <SplitLayout
          sticky
          asideLabel="Chat"
          aside={<div style={{ blockSize: 2000 }}>Tall side panel</div>}
        >
          <p>Main</p>
        </SplitLayout>
      </div>,
    );
    await expect
      .poll(() => tall.getByRole('complementary').element().getAttribute('tabindex'))
      .toBe('0');
    await tall.unmount();
    const short = await renderLayout(1000, { sticky: true });
    await expect
      .poll(() => short.getByRole('complementary').element().getAttribute('tabindex'))
      .toBeNull();
  });

  it('does not stick or scroll while collapsed', async () => {
    const screen = await renderLayout(600, { sticky: true });
    const style = getComputedStyle(screen.getByRole('complementary').element());
    expect(style.position).toBe('static');
    expect(style.overflowY).toBe('visible');
  });

  it('forwards rest props and the ref to the root, and merges style and className', async () => {
    const ref = createRef<HTMLDivElement>();
    const screen = await renderWithProvider(
      <SplitLayout ref={ref} data-testid="root" className="extra" style={{ color: 'red' }}>
        <p>Main</p>
      </SplitLayout>,
    );
    const root = screen.getByTestId('root').element();
    expect(ref.current).toBe(root);
    expect(root.classList.contains('extra')).toBe(true);
    expect(root.style.color).toBe('red');
    expect(root.style.getPropertyValue('--ds-split-layout-gap')).toBe('var(--ds-space-6)');
  });

  it('has no axe violations beside, stacked, sticky and without a landmark', async () => {
    const beside = await renderLayout(1000);
    await expectNoA11yViolations(beside.container);
    await beside.unmount();
    const stacked = await renderLayout(500, { sticky: true });
    await expectNoA11yViolations(stacked.container);
    await stacked.unmount();
    const plain = await renderLayout(1000, { asideLabel: undefined, asidePosition: 'start' });
    await expectNoA11yViolations(plain.container);
  });
});
