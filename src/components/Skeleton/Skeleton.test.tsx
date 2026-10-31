import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Skeleton } from './Skeleton';

/** Text of every reduced-motion media rule, however deeply it is nested in layers. */
function reducedMotionRules(rules: CSSRule[]): string[] {
  return rules.flatMap((rule) => {
    if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion')) {
      return [rule.cssText];
    }
    return 'cssRules' in rule ? reducedMotionRules(Array.from(rule.cssRules as CSSRuleList)) : [];
  });
}

describe('Skeleton', () => {
  it('is hidden from assistive technology', async () => {
    const screen = await renderWithProvider(<Skeleton data-testid="s" />);
    expect(screen.getByTestId('s').element().getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('generic', { includeHidden: false }).elements()).not.toContain(
      screen.getByTestId('s').element(),
    );
  });

  it('is a full-width block with the default height from the token', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 200 }}>
        <Skeleton data-testid="s" />
      </div>,
    );
    const rect = screen.getByTestId('s').element().getBoundingClientRect();
    expect(rect.width).toBe(200);
    expect(rect.height).toBe(12);
  });

  it('accepts numeric and CSS lengths for width and height', async () => {
    const screen = await renderWithProvider(
      <>
        <Skeleton data-testid="a" width={120} height={22} />
        <Skeleton data-testid="b" width="10rem" height="2rem" />
      </>,
    );
    const a = screen.getByTestId('a').element().getBoundingClientRect();
    expect([a.width, a.height]).toEqual([120, 22]);
    const b = screen.getByTestId('b').element().getBoundingClientRect();
    expect([b.width, b.height]).toEqual([160, 32]);
  });

  it('renders a circle as wide as it is tall', async () => {
    const screen = await renderWithProvider(<Skeleton circle height={28} data-testid="s" />);
    const element = screen.getByTestId('s').element();
    const rect = element.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([28, 28]);
    expect(element.getAttribute('data-shape')).toBe('circle');
  });

  it('renders text lines with a shorter last line', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 200 }}>
        <Skeleton lines={3} data-testid="s" />
      </div>,
    );
    const lines = screen.getByTestId('s').element().children;
    expect(lines).toHaveLength(3);
    const widths = Array.from(lines, (line) => line.getBoundingClientRect().width);
    expect(widths).toEqual([200, 200, 120]);
  });

  it('does not shorten a single line', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 200 }}>
        <Skeleton lines={1} data-testid="s" />
      </div>,
    );
    expect(screen.getByTestId('s').element().children[0]?.getBoundingClientRect().width).toBe(200);
  });

  it('pulses, and stops pulsing when reduced motion is requested', async () => {
    const screen = await renderWithProvider(<Skeleton data-testid="s" />);
    const style = getComputedStyle(screen.getByTestId('s').element());
    expect(style.animationName).toContain('pulse');
    const media = reducedMotionRules(
      Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules)),
    );
    // Chrome serializes `animation: none` as the full shorthand with `none` as the name.
    expect(media.join(' ')).toMatch(/block[^{]*\{ animation: [^;]*normal none running none;/);
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(<Skeleton ref={ref} className="extra" id="s1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('s1');
  });

  it('has no axe violations inside a busy region', async () => {
    const screen = await renderWithProvider(
      <main>
        <section aria-busy="true" aria-label="Orders">
          <Skeleton circle height={28} />
          <Skeleton lines={3} />
          <Skeleton width={120} height={22} />
        </section>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
