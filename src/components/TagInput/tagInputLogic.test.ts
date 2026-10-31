import { describe, expect, it } from 'vitest';
import { addTags, hasDelimiter, splitEntries } from './tagInputLogic';

const base = { current: [] as string[], locale: 'en-US' };

describe('splitEntries', () => {
  it('splits at delimiters and keeps empty parts', () => {
    expect(splitEntries('a,b,', [','])).toEqual(['a', 'b', '']);
  });

  it('splits at every configured delimiter and at line breaks', () => {
    expect(splitEntries('a;b,c\nd\r\ne', [',', ';'])).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('supports delimiters with regular expression characters and several characters', () => {
    expect(splitEntries('a.b|c||d', ['.', '|'])).toEqual(['a', 'b', 'c', '', 'd']);
    expect(splitEntries('a and b', [' and '])).toEqual(['a', 'b']);
  });

  it('splits only at line breaks when there are no delimiters', () => {
    expect(splitEntries('a,b\nc', [])).toEqual(['a,b', 'c']);
  });

  it('ignores empty delimiters', () => {
    expect(splitEntries('ab', [''])).toEqual(['ab']);
  });
});

describe('hasDelimiter', () => {
  it('detects delimiters and line breaks', () => {
    expect(hasDelimiter('a,b', [','])).toBe(true);
    expect(hasDelimiter('a\nb', [])).toBe(true);
    expect(hasDelimiter('ab', [','])).toBe(false);
  });
});

describe('addTags', () => {
  it('trims and appends in order', () => {
    const result = addTags({ ...base, entries: [' notebook ', 'backpack'] });
    expect(result.tags).toEqual(['notebook', 'backpack']);
    expect(result.added).toEqual(['notebook', 'backpack']);
  });

  it('skips empty entries', () => {
    const result = addTags({ ...base, entries: ['', '   ', 'headphones'] });
    expect(result.tags).toEqual(['headphones']);
    expect(result.duplicates).toEqual([]);
  });

  it('ignores duplicates of existing tags, ignoring case by default', () => {
    const result = addTags({ ...base, current: ['Notebook'], entries: ['notebook', 'headphones'] });
    expect(result.tags).toEqual(['Notebook', 'headphones']);
    expect(result.duplicates).toEqual(['notebook']);
  });

  it('ignores repeats inside the same batch', () => {
    const result = addTags({ ...base, entries: ['a', 'A', 'a'] });
    expect(result.tags).toEqual(['a']);
    expect(result.duplicates).toEqual(['A', 'a']);
  });

  it('treats different case as different when caseSensitive', () => {
    const result = addTags({
      ...base,
      current: ['Notebook'],
      entries: ['notebook'],
      caseSensitive: true,
    });
    expect(result.tags).toEqual(['Notebook', 'notebook']);
  });

  it('uses the locale for case folding', () => {
    const turkish = addTags({ ...base, locale: 'tr-TR', current: ['I'], entries: ['ı'] });
    expect(turkish.duplicates).toEqual(['ı']);
  });

  it('stops at maxTags and reports it', () => {
    const result = addTags({ ...base, current: ['a'], entries: ['b', 'c', 'd'], maxTags: 2 });
    expect(result.tags).toEqual(['a', 'b']);
    expect(result.hitMax).toBe(true);
  });

  it('does not report the maximum for a duplicate at the limit', () => {
    const result = addTags({ ...base, current: ['a', 'b'], entries: ['a'], maxTags: 2 });
    expect(result.hitMax).toBe(false);
    expect(result.duplicates).toEqual(['a']);
  });

  it('rejects tags the validator refuses, keeps the first message and continues', () => {
    const result = addTags({
      ...base,
      entries: ['ok', 'bad one', 'worse two', 'fine'],
      validate: (tag) => (tag.includes(' ') ? `No spaces in "${tag}".` : undefined),
    });
    expect(result.tags).toEqual(['ok', 'fine']);
    expect(result.invalid).toBe('No spaces in "bad one".');
  });

  it('does not mutate its input', () => {
    const current = ['a'];
    addTags({ ...base, current, entries: ['b'] });
    expect(current).toEqual(['a']);
  });
});
