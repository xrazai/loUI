import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is an unnamed-value progressbar called "Loading" by default', async () => {
    const screen = await renderWithProvider(<Spinner />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    await expect.element(bar).toBeInTheDocument();
    expect(bar.element().getAttribute('aria-valuenow')).toBeNull();
  });

  it('is not a live region (spinners are not announced on mount)', async () => {
    const screen = await renderWithProvider(<Spinner />);
    const el = screen.getByRole('progressbar').element();
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.closest('[aria-live], [role="status"], [role="alert"]')).toBeNull();
  });

  it('uses `label` as the accessible name', async () => {
    const screen = await renderWithProvider(<Spinner label="Loading orders" />);
    await expect
      .element(screen.getByRole('progressbar', { name: 'Loading orders' }))
      .toBeInTheDocument();
  });

  it('is hidden from assistive technology when decorative', async () => {
    const screen = await renderWithProvider(<Spinner decorative />);
    expect(screen.container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.container.querySelector('[role]')).toBeNull();
  });

  it('translates the default label to pt-BR', async () => {
    const screen = await renderWithProvider(<Spinner />, { locale: 'pt-BR' });
    await expect.element(screen.getByRole('progressbar', { name: 'Carregando' })).toBeVisible();
  });

  it('accepts a provider override', async () => {
    const screen = await renderWithProvider(<Spinner />, {
      messages: { Spinner: { loading: 'Please wait' } },
    });
    await expect.element(screen.getByRole('progressbar', { name: 'Please wait' })).toBeVisible();
  });

  it('accepts an instance override over the provider', async () => {
    const screen = await renderWithProvider(<Spinner messages={{ loading: 'Fetching' }} />, {
      messages: { Spinner: { loading: 'Please wait' } },
    });
    await expect.element(screen.getByRole('progressbar', { name: 'Fetching' })).toBeVisible();
  });

  it.each([
    ['sm', 14],
    ['md', 18],
    ['lg', 20],
  ] as const)('draws size %s at %i px', async (size, px) => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(<Spinner ref={ref} size={size} />);
    const rect = ref.current?.getBoundingClientRect();
    expect(rect?.width).toBe(px);
    expect(rect?.height).toBe(px);
  });

  it('rotates with a token duration and inherits the text color', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(
      <span style={{ color: 'rgb(10, 20, 30)' }}>
        <Spinner ref={ref} />
      </span>,
    );
    const style = getComputedStyle(ref.current as HTMLSpanElement);
    expect(style.animationDuration).toBe('0.7s');
    expect(style.animationName).not.toBe('none');
    expect(style.borderInlineEndColor).toBe('rgb(10, 20, 30)');
    expect(style.borderBlockStartColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('stops rotating under prefers-reduced-motion', () => {
    const found: string[] = [];
    const walk = (rules: CSSRuleList, inReduce: boolean) => {
      for (const rule of Array.from(rules)) {
        const reduce =
          inReduce ||
          (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion'));
        if (reduce && rule instanceof CSSStyleRule && rule.style.animationName === 'none') {
          found.push(rule.selectorText);
        }
        if ('cssRules' in rule) walk(rule.cssRules as CSSRuleList, reduce);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules, false);
      } catch {
        // Cross-origin sheets are not readable and not ours.
      }
    }
    expect(found.some((selector) => selector.includes('root'))).toBe(true);
  });

  it('merges className, forwards the ref and passes other props through', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(<Spinner ref={ref} className="extra" data-testid="s" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.getAttribute('data-testid')).toBe('s');
  });

  it('has no axe violations (named and decorative)', async () => {
    const screen = await renderWithProvider(
      <main>
        <Spinner />
        <p>
          <Spinner decorative /> Saving
        </p>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
