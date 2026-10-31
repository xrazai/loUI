// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import tokens from './generated/tokens.json';
import { tokenValues } from './generated/tokens';

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');
const num = (name: string) => {
  const value = tokens.find((t) => t.name === name)?.value;
  return typeof value === 'object' ? Number.NaN : value;
};
const px = (name: string) => Number.parseFloat(String(num(name)));

describe('generated token list (TEST-006)', () => {
  it('matches the snapshot', () => {
    expect(tokens).toMatchSnapshot();
  });

  it('has a description on every token', () => {
    for (const t of tokens) {
      expect(t.description.length, `${t.name} needs a $description`).toBeGreaterThan(20);
    }
  });

  it('prefixes every CSS variable with --ds- and never repeats one', () => {
    const vars = tokens.flatMap((t) => (t.cssVar === null ? [] : [t.cssVar]));
    expect(new Set(vars).size).toBe(vars.length);
    for (const v of vars) expect(v).toMatch(/^--ds-[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('declares every CSS variable in tokens.css inside @layer tokens', () => {
    expect(css).toContain('@layer tokens {');
    for (const t of tokens) {
      if (t.cssVar !== null) expect(css, t.cssVar).toContain(`${t.cssVar}:`);
    }
  });

  it('exposes the same names in the typed map', () => {
    expect(Object.keys(tokenValues)).toEqual(tokens.map((t) => t.name));
  });
});

describe('scale rules', () => {
  it('never goes below the 11.5px caption floor (TOK-005)', () => {
    const sizes = tokens.filter((t) => t.name.startsWith('fs.')).map((t) => px(t.name));
    expect(Math.min(...sizes)).toBe(11.5);
  });

  it('keeps z-index layers strictly increasing', () => {
    const order = ['sheet', 'dialog', 'dropdown', 'popover', 'toast', 'tooltip'].map((n) =>
      Number(num(`z.${n}`)),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(new Set(order).size).toBe(order.length);
  });

  it('keeps the minimum target size at 24px (WCAG 2.5.8)', () => {
    expect(px('size.target-min')).toBe(24);
    for (const n of [
      'size.control-h-sm',
      'size.control-h-md',
      'size.control-h-lg',
      'size.item-h',
    ]) {
      expect(px(n)).toBeGreaterThanOrEqual(24);
    }
  });

  it('keeps soft tokens as color-mix over transparent', () => {
    for (const n of ['accent-soft', 'success-soft', 'warning-soft', 'danger-soft']) {
      expect(css).toMatch(
        new RegExp(`--ds-${n}: color-mix\\(in oklab, var\\(--ds-[a-z]+\\) \\d+%, transparent\\);`),
      );
    }
  });
});
