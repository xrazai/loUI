import { describe, expect, it } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('joins truthy names and skips falsy values', () => {
    expect(classNames('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('returns an empty string when nothing is given', () => {
    expect(classNames()).toBe('');
  });
});
