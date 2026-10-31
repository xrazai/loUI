import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Meter, Progress } from './Progress';
import type { ProgressTone } from './Progress';

/** Text of every reduced-motion media rule, however deeply it is nested in layers. */
function reducedMotionRules(rules: CSSRule[]): string[] {
  return rules.flatMap((rule) => {
    if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-reduced-motion')) {
      return [rule.cssText];
    }
    return 'cssRules' in rule ? reducedMotionRules(Array.from(rule.cssRules as CSSRuleList)) : [];
  });
}

describe('Progress', () => {
  it('is a progressbar named by its label, with value, range and text', async () => {
    const screen = await renderWithProvider(<Progress value={62} label="Storage" />);
    const bar = screen.getByRole('progressbar', { name: 'Storage' });
    await expect.element(bar).toBeVisible();
    const element = bar.element();
    expect(element.getAttribute('aria-valuenow')).toBe('62');
    expect(element.getAttribute('aria-valuemin')).toBe('0');
    expect(element.getAttribute('aria-valuemax')).toBe('100');
    expect(element.getAttribute('aria-valuetext')).toBe('62%');
  });

  it('can be named with aria-label when there is no visible label', async () => {
    const screen = await renderWithProvider(<Progress value={10} aria-label="Upload" />);
    await expect.element(screen.getByRole('progressbar', { name: 'Upload' })).toBeVisible();
  });

  it('clamps the value to the range and supports a custom range', async () => {
    const screen = await renderWithProvider(
      <>
        <Progress value={140} aria-label="Over" />
        <Progress value={5} minValue={0} maxValue={20} aria-label="Of twenty" />
      </>,
    );
    expect(
      screen.getByRole('progressbar', { name: 'Over' }).element().getAttribute('aria-valuenow'),
    ).toBe('100');
    const custom = screen.getByRole('progressbar', { name: 'Of twenty' }).element();
    expect(custom.getAttribute('aria-valuemax')).toBe('20');
    expect(custom.getAttribute('aria-valuetext')).toBe('25%');
  });

  it('fills the track in proportion to the value', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 400 }}>
        <Progress value={25} aria-label="Quarter" />
      </div>,
    );
    const fill = screen.container.querySelector('[class*="fill"]');
    const track = fill?.parentElement;
    expect(fill).not.toBeNull();
    const ratio =
      (fill?.getBoundingClientRect().width ?? 0) / (track?.getBoundingClientRect().width ?? 1);
    expect(ratio).toBeCloseTo(0.25, 1);
    expect(track?.getBoundingClientRect().height).toBe(4);
  });

  it('shows the meta text and the formatted value', async () => {
    const screen = await renderWithProvider(
      <>
        <Progress value={62} label="Storage" meta="6.2 / 10 GB" />
        <Progress value={40} label="Upload" showValue />
      </>,
    );
    await expect.element(screen.getByText('6.2 / 10 GB')).toBeVisible();
    await expect.element(screen.getByText('40%')).toBeVisible();
  });

  it('uses valueLabel as the spoken value', async () => {
    const screen = await renderWithProvider(
      <Progress value={62} label="Storage" meta="6.2 / 10 GB" valueLabel="6.2 of 10 GB" />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Storage' }).element();
    expect(bar.getAttribute('aria-valuetext')).toBe('6.2 of 10 GB');
  });

  it('formats the value with the locale of the provider', async () => {
    const options = { style: 'percent' as const, minimumFractionDigits: 1 };
    const en = await renderWithProvider(
      <Progress value={62.5} label="Storage" formatOptions={options} />,
    );
    expect(en.getByRole('progressbar').element().getAttribute('aria-valuetext')).toBe('62.5%');
    await en.unmount();
    const pt = await renderWithProvider(
      <Progress value={62.5} label="Armazenamento" formatOptions={options} />,
      { locale: 'pt-BR' },
    );
    expect(pt.getByRole('progressbar').element().getAttribute('aria-valuetext')).toBe('62,5%');
  });

  it('is indeterminate without a value: no aria-valuenow and a moving segment', async () => {
    const screen = await renderWithProvider(
      <Progress isIndeterminate label="Importing" showValue />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Importing' }).element();
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
    const fill = bar.querySelector('[data-indeterminate]');
    expect(fill).not.toBeNull();
    expect(getComputedStyle(fill as Element).animationName).toContain('sweep');
    // The percentage is meaningless when the amount is unknown, so it is not shown.
    expect(bar.textContent).toBe('Importing');
  });

  it('stops the sweep when reduced motion is requested', async () => {
    await renderWithProvider(<Progress isIndeterminate aria-label="Importing" />);
    const rules = reducedMotionRules(
      Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules)),
    ).join(' ');
    expect(rules).toMatch(
      /data-indeterminate[^{]*\{[^}]*animation: [^;]*normal none running none;/,
    );
  });

  it.each<ProgressTone>(['accent', 'success', 'warning', 'danger'])(
    'colors the fill by tone (%s)',
    async (tone) => {
      const screen = await renderWithProvider(
        <Progress value={50} tone={tone} aria-label="Task" />,
      );
      const bar = screen.getByRole('progressbar').element();
      expect(bar.getAttribute('data-tone')).toBe(tone);
      const fill = bar.querySelector('[class*="fill"]') as Element;
      const expected = getComputedStyle(document.documentElement)
        .getPropertyValue(`--ds-${tone}`)
        .trim();
      const probe = document.createElement('span');
      probe.style.color = expected;
      document.body.append(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      expect(getComputedStyle(fill).backgroundColor).toBe(resolved);
    },
  );

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(
      <Progress ref={ref} value={1} aria-label="Task" className="extra" id="p1" data-testid="p" />,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('p1');
    expect(ref.current?.getAttribute('data-testid')).toBe('p');
  });

  it('has no axe violations in any state', async () => {
    const screen = await renderWithProvider(
      <main>
        <Progress value={62} label="Storage" meta="6.2 / 10 GB" />
        <Progress value={0} label="Not started" showValue />
        <Progress value={100} tone="success" label="Done" showValue />
        <Progress value={80} tone="warning" aria-label="Quota" />
        <Progress value={95} tone="danger" label="Errors" showValue />
        <Progress isIndeterminate label="Importing" />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('Meter', () => {
  it('is a meter named by its label with value and range', async () => {
    const screen = await renderWithProvider(
      <Meter value={62} label="Disk used" meta="6.2 / 10 GB" tone="warning" />,
    );
    const meter = screen.getByRole('meter', { name: 'Disk used' });
    await expect.element(meter).toBeVisible();
    expect(meter.element().getAttribute('aria-valuenow')).toBe('62');
    expect(meter.element().getAttribute('data-tone')).toBe('warning');
    await expect.element(screen.getByText('6.2 / 10 GB')).toBeVisible();
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Meter value={30} label="Disk used" showValue />
        <Meter value={90} tone="danger" aria-label="Quota" />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
