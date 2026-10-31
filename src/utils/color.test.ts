import { describe, expect, it } from 'vitest';
import { contrastRatio, readableTextOn, relativeLuminance } from './color';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
  });

  it('matches known WCAG values', () => {
    expect(relativeLuminance('#ff0000')).toBeCloseTo(0.2126, 4);
    expect(relativeLuminance('#00ff00')).toBeCloseTo(0.7152, 4);
    expect(relativeLuminance('#0000ff')).toBeCloseTo(0.0722, 4);
    expect(relativeLuminance('#808080')).toBeCloseTo(0.2159, 3);
  });

  it('accepts shorthand, missing # and any case', () => {
    expect(relativeLuminance('#fff')).toBeCloseTo(1, 10);
    expect(relativeLuminance('FFF')).toBeCloseTo(1, 10);
    expect(relativeLuminance('#8AB4FF')).toBeCloseTo(relativeLuminance('8ab4ff'), 10);
    expect(relativeLuminance('#abc')).toBeCloseTo(relativeLuminance('#aabbcc'), 10);
  });

  it('rejects malformed colors in development', () => {
    for (const bad of [
      '',
      '#',
      '#ff',
      '#ffff',
      '#fffffff',
      'red',
      '#ggg',
      'rgb(0,0,0)',
      '#ffffff80',
    ]) {
      expect(() => relativeLuminance(bad)).toThrow(RangeError);
    }
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for identical colors', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 10);
    expect(contrastRatio('#123456', '#123456')).toBe(1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#8ab4ff', '#0b0b0c')).toBeCloseTo(
      contrastRatio('#0b0b0c', '#8ab4ff'),
      10,
    );
  });

  it('matches known WCAG examples', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });

  it('reports the handoff text on canvas as AA-compliant', () => {
    expect(contrastRatio('#EDEDEA', '#050506')).toBeGreaterThan(4.5);
  });
});

describe('readableTextOn', () => {
  it('chooses light text on dark backgrounds and dark text on light ones', () => {
    expect(readableTextOn('#000000')).toBe('light');
    expect(readableTextOn('#0b0b0c')).toBe('light');
    expect(readableTextOn('#ffffff')).toBe('dark');
    expect(readableTextOn('#f5f5f5')).toBe('dark');
  });

  it('uses WCAG contrast, not the 0.299/0.587/0.114 shortcut', () => {
    // The luma shortcut calls pure red "dark enough for white text" (luma 76).
    // WCAG: contrast with white is 4.0, with black is 5.25, so dark text wins.
    expect(readableTextOn('#ff0000')).toBe('dark');
    // Pure blue: contrast with white 8.6, with black 2.4.
    expect(readableTextOn('#0000ff')).toBe('light');
    // Pure green is bright.
    expect(readableTextOn('#00ff00')).toBe('dark');
  });

  it('flips around the 0.179 luminance crossover', () => {
    expect(readableTextOn('#777777')).toBe('dark'); // 4.69 with black vs 4.48 with white
    expect(readableTextOn('#757575')).toBe('light'); // 4.60 with white vs 4.56 with black
    expect(readableTextOn('#595959')).toBe('light');
  });

  it('works with shorthand', () => {
    expect(readableTextOn('#000')).toBe('light');
    expect(readableTextOn('#fff')).toBe('dark');
  });

  it('picks the higher-contrast option for every grey level', () => {
    for (let level = 0; level <= 255; level += 5) {
      const hex = `#${level.toString(16).padStart(2, '0').repeat(3)}`;
      const white = contrastRatio(hex, '#ffffff');
      const black = contrastRatio(hex, '#000000');
      expect(readableTextOn(hex)).toBe(white > black ? 'light' : 'dark');
    }
  });
});
