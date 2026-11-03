import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { contrastRatio, readableTextOn, relativeLuminance } from './color';

const channel = fc.integer({ min: 0, max: 255 });
const hexArb = fc
  .tuple(channel, channel, channel)
  .map(([r, g, b]) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`);

describe('color (properties)', () => {
  it('relative luminance is within [0, 1]', () => {
    fc.assert(
      fc.property(hexArb, (hex) => {
        const l = relativeLuminance(hex);
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThanOrEqual(1);
      }),
    );
  });

  it('accepts #rgb shorthand and a missing # identically to the long form', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[0-9a-fA-F]{3}$/), (short) => {
        const long = short.replace(/./g, '$&$&');
        expect(relativeLuminance(`#${short}`)).toBe(relativeLuminance(`#${long.toLowerCase()}`));
        expect(relativeLuminance(short)).toBe(relativeLuminance(`#${short}`));
      }),
    );
  });

  it('contrast ratio is symmetric and within [1, 21]', () => {
    fc.assert(
      fc.property(hexArb, hexArb, (a, b) => {
        const ratio = contrastRatio(a, b);
        expect(ratio).toBe(contrastRatio(b, a));
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(21 + 1e-9);
      }),
    );
  });

  it('a color has contrast 1 with itself, and black on white is 21', () => {
    fc.assert(fc.property(hexArb, (hex) => contrastRatio(hex, hex) === 1));
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 10);
  });

  it('black or white always reaches 4.5:1 against any color', () => {
    // Worst case is the luminance where both tie: sqrt(21) - 0.05 is about 4.58.
    fc.assert(
      fc.property(hexArb, (hex) => {
        const best = Math.max(contrastRatio(hex, '#000000'), contrastRatio(hex, '#ffffff'));
        expect(best).toBeGreaterThanOrEqual(4.5);
      }),
    );
  });

  it('readableTextOn picks the side with the higher contrast', () => {
    fc.assert(
      fc.property(hexArb, (hex) => {
        const light = contrastRatio(hex, '#ffffff');
        const dark = contrastRatio(hex, '#000000');
        const pick = readableTextOn(hex);
        if (light > dark) expect(pick).toBe('light');
        if (dark > light) expect(pick).toBe('dark');
      }),
    );
  });
});
