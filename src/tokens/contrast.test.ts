// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { pairRatio, parseColor, ratio, type ContrastPair } from './contrast';
import pairsFile from './contrast-pairs.json';
import tokens from './generated/tokens.json';

const values = new Map(
  tokens.flatMap((t) => (typeof t.value === 'string' ? [[t.name, t.value] as const] : [])),
);
const pairs = pairsFile.pairs as ContrastPair[];

describe('contrast helpers', () => {
  it('matches the WCAG reference ratios', () => {
    const black = parseColor('#000000');
    const white = parseColor('#FFFFFF');
    expect(ratio(black, white)).toBeCloseTo(21, 5);
    expect(ratio(white, white)).toBeCloseTo(1, 5);
    // #767676 on white is the canonical 4.54:1 AA boundary.
    expect(ratio(parseColor('#767676'), white)).toBeCloseTo(4.54, 2);
  });
});

describe('token contrast pairs (WCAG 2.2 AA)', () => {
  it('lists pairs that only reference existing tokens', () => {
    for (const pair of pairs) {
      for (const name of [pair.foreground, ...pair.background]) {
        expect(values.has(name), `${pair.id}: unknown token ${name}`).toBe(true);
      }
    }
  });

  it.each(pairs.map((p) => [p.id, p] as const))('%s', (_id, pair) => {
    const actual = pairRatio(pair.foreground, pair.background, values);
    expect(
      actual,
      `${pair.usage}: ${actual.toFixed(2)}:1, needs ${String(pair.min)}:1`,
    ).toBeGreaterThanOrEqual(pair.min);
  });
});

describe('TOK-004 decisions', () => {
  it('keeps text-3 readable on the lightest surface it is allowed on', () => {
    const r = pairRatio('color.text-3', ['color.surface-hover'], values);
    expect(r).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps line-control at 3:1 on the surfaces controls sit on', () => {
    for (const bg of ['color.bg', 'color.surface', 'color.surface-raised']) {
      expect(pairRatio('color.line-control', [bg], values)).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps paper-accent at 4.5:1 on paper', () => {
    expect(pairRatio('color.paper-accent', ['color.paper'], values)).toBeGreaterThanOrEqual(4.5);
  });
});
