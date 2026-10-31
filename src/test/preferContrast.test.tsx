/**
 * TOK-008: `prefers-contrast: more` strengthens lines and tertiary text, in the dark theme and in
 * the paper scope. The media feature is emulated through the DevTools protocol (the same call
 * Playwright's `page.emulateMedia({ contrast })` makes), and the colors are read back from
 * computed styles, so the test covers the cascade (layers, the paper scope) and not just the
 * token values.
 */
import { afterAll, describe, expect, it } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { parseColor, ratio } from '../tokens/contrast';

async function setContrast(value: 'more' | 'no-preference'): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-contrast', value }],
  });
  if (matchMedia('(prefers-contrast: more)').matches !== (value === 'more')) {
    throw new Error(`prefers-contrast emulation did not switch to ${value}.`);
  }
}

afterAll(async () => {
  await setContrast('no-preference');
});

/** Resolved color of a custom property inside `scope` (the cascade decides, not the token file). */
function colorOf(scope: Element, property: string): ReturnType<typeof parseColor> {
  const probe = document.createElement('span');
  probe.style.color = `var(${property})`;
  scope.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return parseColor(value);
}

interface Measure {
  lines: number[];
  text3: number;
}

function measure(scope: Element, surface: string): Measure {
  const bg = colorOf(scope, surface);
  return {
    lines: ['--ds-line-subtle', '--ds-line', '--ds-line-strong', '--ds-line-control'].map(
      (property) => ratio(colorOf(scope, property), bg),
    ),
    text3: ratio(colorOf(scope, '--ds-text-3'), bg),
  };
}

async function measureBoth(scopeAttribute: string | null, surface: string) {
  const screen = await render(
    <div data-theme={scopeAttribute ?? undefined} data-testid="scope">
      <p>Scope</p>
    </div>,
  );
  const scope = screen.container.querySelector('[data-testid="scope"]');
  if (!scope) throw new Error('scope did not render');
  await setContrast('no-preference');
  const normal = measure(scope, surface);
  await setContrast('more');
  const more = measure(scope, surface);
  await setContrast('no-preference');
  await screen.unmount();
  return { normal, more };
}

describe('prefers-contrast: more', () => {
  it('dark theme: every line reaches 3:1 on the surfaces and text-3 gets stronger', async () => {
    for (const surface of ['--ds-bg', '--ds-surface', '--ds-surface-raised']) {
      const { normal, more } = await measureBoth(null, surface);
      expect(Math.min(...more.lines), `lines on ${surface}`).toBeGreaterThanOrEqual(3);
      expect(more.lines.every((line, index) => line >= (normal.lines[index] ?? 0))).toBe(true);
      expect(more.text3, `text-3 on ${surface}`).toBeGreaterThan(normal.text3);
      expect(more.text3, `text-3 on ${surface}`).toBeGreaterThanOrEqual(7);
    }
  });

  it('paper scope: lines reach 3:1 and text-3 gets stronger on the paper', async () => {
    const { normal, more } = await measureBoth('paper', '--ds-paper');
    expect(Math.min(...more.lines)).toBeGreaterThanOrEqual(3);
    expect(Math.min(...more.lines)).toBeGreaterThan(Math.min(...normal.lines));
    expect(more.text3).toBeGreaterThan(normal.text3);
    expect(more.text3).toBeGreaterThanOrEqual(7);
  });

  it('leaves everything unchanged without the preference', async () => {
    const { normal } = await measureBoth(null, '--ds-bg');
    // line-subtle is decorative and intentionally low.
    expect(normal.lines[0]).toBeLessThan(1.5);
  });
});
