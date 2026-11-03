// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { deprecationOf } from './components';

describe('deprecationOf (AI-016)', () => {
  it('returns undefined for props that are not deprecated', () => {
    expect(deprecationOf('Visual style of the button.')).toBeUndefined();
    expect(deprecationOf('')).toBeUndefined();
    expect(deprecationOf('Mentions @deprecated mid-sentence only.')).toBeUndefined();
  });

  it('extracts the migration hint after the tag', () => {
    expect(deprecationOf('Old name.\n@deprecated Use variant instead.')).toBe(
      'Use variant instead.',
    );
    expect(deprecationOf('@deprecated Use `heading`.')).toBe('Use `heading`.');
  });

  it('returns an empty string when the tag has no text', () => {
    expect(deprecationOf('Old name.\n@deprecated')).toBe('');
  });

  it('joins a wrapped hint and stops at the next tag', () => {
    expect(deprecationOf('@deprecated Use variant\ninstead of tone.\n@default "a"')).toBe(
      'Use variant instead of tone.',
    );
  });
});
