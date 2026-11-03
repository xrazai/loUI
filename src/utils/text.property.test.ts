import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { compareText, highlightMatch, matchesSearch, normalizeSearch, sortByText } from './text';

const localeArb = fc.constantFrom('en-US', 'pt-BR');
/** Letters with and without accents, digits and spaces: the realistic domain of names. */
const ALPHABET = Array.from('abcdeiouçñ AÉÍÓÚ0123456789áàâãéêíóôõúü');
const wordArb = fc.string({ unit: fc.constantFrom(...ALPHABET), maxLength: 12 });
const anyStringArb = fc.string({ unit: 'binary', maxLength: 20 });

/** Removes accents the way a user would type them (NFD without combining marks). */
function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

describe('compareText (properties)', () => {
  it('is reflexive and antisymmetric', () => {
    fc.assert(
      fc.property(anyStringArb, anyStringArb, localeArb, (a, b, locale) => {
        expect(compareText(a, a, locale)).toBe(0);
        expect(Math.sign(compareText(a, b, locale)) + Math.sign(compareText(b, a, locale))).toBe(0);
      }),
    );
  });

  it('is transitive on names', () => {
    fc.assert(
      fc.property(wordArb, wordArb, wordArb, localeArb, (a, b, c, locale) => {
        if (compareText(a, b, locale) <= 0 && compareText(b, c, locale) <= 0) {
          expect(compareText(a, c, locale)).toBeLessThanOrEqual(0);
        }
      }),
    );
  });

  it('ignores accents and case', () => {
    fc.assert(
      fc.property(wordArb, localeArb, (word, locale) => {
        expect(compareText(word, stripAccents(word), locale)).toBe(0);
        expect(compareText(word, word.toUpperCase(), locale)).toBe(0);
      }),
    );
  });

  it('orders numbers naturally', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100_000 }),
        fc.integer({ min: 0, max: 100_000 }),
        localeArb,
        (a, b, locale) => {
          expect(Math.sign(compareText(`Item ${a}`, `Item ${b}`, locale))).toBe(Math.sign(a - b));
        },
      ),
    );
  });
});

describe('sortByText (properties)', () => {
  const itemsArb = fc.array(fc.record({ id: fc.nat(), name: wordArb }), { maxLength: 30 });

  it('returns a permutation of the input and does not mutate it', () => {
    fc.assert(
      fc.property(itemsArb, localeArb, (items, locale) => {
        const before = structuredClone(items);
        const sorted = sortByText(items, (item) => item.name, locale);
        expect(items).toEqual(before);
        const key = (item: { id: number; name: string }) => `${item.id}|${item.name}`;
        expect(sorted.map(key).sort()).toEqual(items.map(key).sort());
      }),
    );
  });

  it('is ordered, stable and idempotent', () => {
    fc.assert(
      fc.property(itemsArb, localeArb, (items, locale) => {
        const indexed = items.map((item, index) => ({ ...item, index }));
        const sorted = sortByText(indexed, (item) => item.name, locale);
        for (let i = 1; i < sorted.length; i += 1) {
          const prev = sorted[i - 1];
          const next = sorted[i];
          if (!prev || !next) throw new Error('unreachable');
          const order = compareText(prev.name, next.name, locale);
          expect(order).toBeLessThanOrEqual(0);
          // Stability: items with equal text keep their input order.
          if (order === 0) expect(prev.index).toBeLessThan(next.index);
        }
        expect(sortByText(sorted, (item) => item.name, locale)).toEqual(sorted);
      }),
    );
  });
});

describe('normalizeSearch / matchesSearch (properties)', () => {
  it('is idempotent', () => {
    fc.assert(
      fc.property(anyStringArb, (text) => {
        expect(normalizeSearch(normalizeSearch(text))).toBe(normalizeSearch(text));
      }),
    );
  });

  it('is accent- and case-insensitive', () => {
    fc.assert(
      fc.property(wordArb, (word) => {
        expect(normalizeSearch(word)).toBe(normalizeSearch(stripAccents(word)));
        expect(normalizeSearch(word.toUpperCase())).toBe(normalizeSearch(word));
      }),
    );
  });

  it('matches any substring of the text, with or without accents', () => {
    fc.assert(
      fc.property(wordArb, fc.nat(12), fc.nat(12), (text, a, b) => {
        const part = text.slice(Math.min(a, b), Math.max(a, b));
        expect(matchesSearch(text, part)).toBe(true);
        expect(matchesSearch(text, stripAccents(part).toUpperCase())).toBe(true);
      }),
    );
  });

  it('matches everything for an empty query', () => {
    fc.assert(
      fc.property(anyStringArb, (text) => matchesSearch(text, '') && matchesSearch(text, '  ')),
    );
  });
});

describe('highlightMatch (properties)', () => {
  it('segments concatenate back to the original text and are never empty', () => {
    fc.assert(
      fc.property(wordArb, wordArb, (text, query) => {
        const segments = highlightMatch(text, query);
        expect(segments.map((s) => s.text).join('')).toBe(text);
        for (const s of segments) expect(s.text).not.toBe('');
      }),
    );
  });

  it('every matched segment matches the query', () => {
    fc.assert(
      fc.property(wordArb, wordArb, (text, query) => {
        for (const s of highlightMatch(text, query)) {
          if (s.match) expect(matchesSearch(s.text, query)).toBe(true);
        }
      }),
    );
  });

  it('highlights something exactly when matchesSearch finds a match', () => {
    fc.assert(
      fc.property(wordArb, wordArb, (text, query) => {
        if (query.trim() === '') return;
        expect(highlightMatch(text, query).some((s) => s.match)).toBe(matchesSearch(text, query));
      }),
    );
  });
});
