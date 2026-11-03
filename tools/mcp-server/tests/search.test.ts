import { describe, expect, it } from 'vitest';
import { queryTerms, rank, stem, words } from '../src/search.ts';

describe('search helpers', () => {
  it('splits camelCase and punctuation', () => {
    expect(words('ConfirmDialog, use-it')).toEqual(['confirm', 'dialog', 'use', 'it']);
  });

  it('stems plurals and verb endings to one form', () => {
    expect(stem('sorting')).toBe(stem('sorted'));
    expect(stem('sorts')).toBe('sort');
    expect(stem('tab')).toBe('tab');
  });

  it('drops stop words and duplicates from a query', () => {
    expect(queryTerms('a table of the orders, orders')).toEqual(['table', 'order']);
  });

  it('ranks by covered terms and breaks ties by name', () => {
    const items = [
      { name: 'Zeta', fields: [{ text: 'sorting tables', weight: 3 }] },
      { name: 'Alpha', fields: [{ text: 'sorting', weight: 3 }] },
      { name: 'Beta', fields: [{ text: 'sorting', weight: 3 }] },
      { name: 'None', fields: [{ text: 'unrelated', weight: 3 }] },
    ];
    expect(rank(items, 'sort the table').map((r) => r.name)).toEqual(['Zeta', 'Alpha', 'Beta']);
  });

  it('boosts an exact name typed as the query', () => {
    const items = [
      { name: 'Button', fields: [{ text: 'Button', weight: 8 }] },
      { name: 'IconButton', fields: [{ text: 'Icon Button', weight: 8 }] },
    ];
    expect(rank(items, 'button')[0]?.name).toBe('Button');
  });
});
