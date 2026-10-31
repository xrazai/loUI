import { describe, expect, it } from 'vitest';
import {
  compareText,
  createTextCollator,
  highlightMatch,
  matchesSearch,
  normalizeSearch,
  sortByText,
} from './text';

describe('compareText / createTextCollator', () => {
  it('ignores case and accents', () => {
    expect(compareText('a', 'A', 'en-US')).toBe(0);
    expect(compareText('é', 'e', 'pt-BR')).toBe(0);
    expect(compareText('Ana', 'ána', 'pt-BR')).toBe(0);
  });

  it('orders alphabetically, accents next to their base letter', () => {
    const words = ['Zebra', 'ágata', 'Árvore', 'banana', 'Abacaxi', 'cebola', 'Éden', 'eco'];
    expect([...words].sort(createTextCollator('pt-BR').compare)).toEqual([
      'Abacaxi',
      'ágata',
      'Árvore',
      'banana',
      'cebola',
      'eco',
      'Éden',
      'Zebra',
    ]);
  });

  it('orders numbers naturally', () => {
    const words = ['Item 10', 'Item 2', 'Item 1', 'Item 20'];
    expect(words.sort((a, b) => compareText(a, b, 'en-US'))).toEqual([
      'Item 1',
      'Item 2',
      'Item 10',
      'Item 20',
    ]);
  });

  it('applies locale rules', () => {
    // Swedish puts "ä" after "z"; German treats it like "a" (at base sensitivity "ä" equals "a" in sv? no: it is a separate letter).
    expect(compareText('z', 'ä', 'sv-SE')).toBeLessThan(0);
    expect(compareText('ä', 'b', 'de-DE')).toBeLessThan(0);
  });

  it('puts empty strings first', () => {
    expect(compareText('', 'a', 'en-US')).toBeLessThan(0);
    expect(compareText('', '', 'en-US')).toBe(0);
  });

  it('reuses collators per locale', () => {
    expect(createTextCollator('en-US')).toBe(createTextCollator('en-US'));
    expect(createTextCollator('en-US')).not.toBe(createTextCollator('pt-BR'));
  });
});

describe('sortByText', () => {
  it('sorts objects by a text getter without mutating the input', () => {
    const items = [{ name: 'Óleo' }, { name: 'abacate' }, { name: 'Cacau' }];
    const sorted = sortByText(items, (item) => item.name, 'pt-BR');
    expect(sorted.map((item) => item.name)).toEqual(['abacate', 'Cacau', 'Óleo']);
    expect(items.map((item) => item.name)).toEqual(['Óleo', 'abacate', 'Cacau']);
  });

  it('is stable for equal keys', () => {
    const items = [
      { name: 'ana', id: 1 },
      { name: 'Ana', id: 2 },
      { name: 'ána', id: 3 },
      { name: 'Bia', id: 4 },
      { name: 'ANA', id: 5 },
    ];
    expect(sortByText(items, (item) => item.name, 'pt-BR').map((item) => item.id)).toEqual([
      1, 2, 3, 5, 4,
    ]);
  });

  it('handles empty input and single items', () => {
    expect(sortByText([], (x: string) => x, 'en-US')).toEqual([]);
    expect(sortByText(['a'], (x) => x, 'en-US')).toEqual(['a']);
  });

  it('calls the getter once per item', () => {
    let calls = 0;
    sortByText(
      ['b', 'a', 'c'],
      (x) => {
        calls += 1;
        return x;
      },
      'en-US',
    );
    expect(calls).toBe(3);
  });
});

describe('normalizeSearch', () => {
  it('strips accents and lowercases', () => {
    expect(normalizeSearch('Café')).toBe('cafe');
    expect(normalizeSearch('CRÈME BRÛLÉE')).toBe('creme brulee');
    expect(normalizeSearch('Ação Coração')).toBe('acao coracao');
    expect(normalizeSearch('Ñandú')).toBe('nandu');
  });

  it('handles decomposed input the same as composed input', () => {
    expect(normalizeSearch('café')).toBe('cafe');
    expect(normalizeSearch('café')).toBe('cafe');
  });

  it('keeps unrelated characters and handles empty input', () => {
    expect(normalizeSearch('')).toBe('');
    expect(normalizeSearch('ORD-1048')).toBe('ord-1048');
    expect(normalizeSearch('日本語')).toBe('日本語');
  });

  it('folds the dotted capital I of Turkish', () => {
    expect(normalizeSearch('İstanbul')).toBe('istanbul');
  });
});

describe('matchesSearch', () => {
  it('matches ignoring case and accents, both directions', () => {
    expect(matchesSearch('Café da manhã', 'cafe')).toBe(true);
    expect(matchesSearch('Cafe da manha', 'CAFÉ')).toBe(true);
    expect(matchesSearch('Café', 'manhã')).toBe(false);
  });

  it('matches substrings anywhere', () => {
    expect(matchesSearch('Northwind Web', 'wind')).toBe(true);
  });

  it('matches everything for an empty or blank query', () => {
    expect(matchesSearch('anything', '')).toBe(true);
    expect(matchesSearch('anything', '   ')).toBe(true);
    expect(matchesSearch('', '')).toBe(true);
  });

  it('does not match a non-empty query against empty text', () => {
    expect(matchesSearch('', 'a')).toBe(false);
  });

  it('trims the query', () => {
    expect(matchesSearch('Café', ' cafe ')).toBe(true);
  });
});

describe('highlightMatch', () => {
  const join = (segments: { text: string }[]) => segments.map((s) => s.text).join('');

  it('highlights accent-insensitively and preserves the original text', () => {
    expect(highlightMatch('Crème brûlée', 'creme')).toEqual([
      { text: 'Crème', match: true },
      { text: ' brûlée', match: false },
    ]);
  });

  it('highlights the query when it has accents and the text does not', () => {
    expect(highlightMatch('Cafe bar', 'CAFÉ')).toEqual([
      { text: 'Cafe', match: true },
      { text: ' bar', match: false },
    ]);
  });

  it('highlights every occurrence', () => {
    expect(highlightMatch('banana', 'an')).toEqual([
      { text: 'b', match: false },
      { text: 'an', match: true },
      { text: 'an', match: true },
      { text: 'a', match: false },
    ]);
  });

  it('does not overlap matches', () => {
    expect(highlightMatch('aaaa', 'aa')).toEqual([
      { text: 'aa', match: true },
      { text: 'aa', match: true },
    ]);
  });

  it('returns a single unmatched segment when nothing matches or the query is empty', () => {
    expect(highlightMatch('hello', 'xyz')).toEqual([{ text: 'hello', match: false }]);
    expect(highlightMatch('hello', '')).toEqual([{ text: 'hello', match: false }]);
    expect(highlightMatch('hello', '  ')).toEqual([{ text: 'hello', match: false }]);
  });

  it('returns no segments for empty text', () => {
    expect(highlightMatch('', 'a')).toEqual([]);
  });

  it('highlights the whole text when it fully matches', () => {
    expect(highlightMatch('Ação', 'acao')).toEqual([{ text: 'Ação', match: true }]);
  });

  it('keeps combining marks of decomposed text attached to the matched letter', () => {
    const text = 'café bar';
    const segments = highlightMatch(text, 'cafe');
    expect(segments[0]).toEqual({ text: 'café', match: true });
    expect(join(segments)).toBe(text);
  });

  it('matches in the middle and at the end', () => {
    expect(highlightMatch('Northwind', 'WIND')).toEqual([
      { text: 'North', match: false },
      { text: 'wind', match: true },
    ]);
  });

  it('handles astral characters', () => {
    const text = 'a𝒳b';
    expect(join(highlightMatch(text, '𝒳'))).toBe(text);
    expect(highlightMatch(text, '𝒳')).toEqual([
      { text: 'a', match: false },
      { text: '𝒳', match: true },
      { text: 'b', match: false },
    ]);
  });

  it('always reassembles to the original text', () => {
    const samples = [
      'Crème brûlée',
      'İstanbul İstanbul',
      'ÀÉÎÕÜ aeiou',
      'Σίσυφος',
      'ñandú ÑANDÚ',
      '  spaced  out  ',
    ];
    for (const sample of samples) {
      for (const query of ['e', 'i', 'a', 'n', 's', 'ou', 'sp', 'ndu']) {
        expect(join(highlightMatch(sample, query))).toBe(sample);
      }
    }
  });

  it('agrees with matchesSearch', () => {
    const samples = ['Crème brûlée', 'Northwind', 'Ação', 'plain'];
    for (const sample of samples) {
      for (const query of ['creme', 'WIND', 'acao', 'zzz', 'a', '']) {
        const hasMatch = highlightMatch(sample, query).some((s) => s.match);
        expect(hasMatch).toBe(query.trim() !== '' && matchesSearch(sample, query));
      }
    }
  });
});
