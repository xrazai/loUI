import { describe, expect, it } from 'vitest';
import { getItemRange, getPageCount, getPageItems } from './pageItems';
import type { PageItem } from './pageItems';

/** Compact form for assertions: numbers for pages, "…" for ellipses. */
function show(items: PageItem[]): (number | string)[] {
  return items.map((item) => (item.type === 'page' ? item.page : '…'));
}

describe('getPageItems', () => {
  it('lists every page up to 7', () => {
    expect(show(getPageItems(1, 1))).toEqual([1]);
    expect(show(getPageItems(3, 5))).toEqual([1, 2, 3, 4, 5]);
    expect(show(getPageItems(4, 7))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the end of a long list when near the start', () => {
    expect(show(getPageItems(1, 10))).toEqual([1, 2, '…', 10]);
    expect(show(getPageItems(2, 10))).toEqual([1, 2, 3, '…', 10]);
  });

  it('collapses the start of a long list when near the end', () => {
    expect(show(getPageItems(10, 10))).toEqual([1, '…', 9, 10]);
    expect(show(getPageItems(9, 10))).toEqual([1, '…', 8, 9, 10]);
  });

  it('collapses both sides in the middle', () => {
    expect(show(getPageItems(5, 10))).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(show(getPageItems(50, 100))).toEqual([1, '…', 49, 50, 51, '…', 100]);
  });

  it('shows the page instead of an ellipsis that would hide exactly one page', () => {
    expect(show(getPageItems(4, 10))).toEqual([1, 2, 3, 4, 5, '…', 10]);
    expect(show(getPageItems(7, 10))).toEqual([1, '…', 6, 7, 8, 9, 10]);
  });

  it('never repeats a page and keeps the order ascending', () => {
    for (let total = 1; total <= 40; total += 1) {
      for (let current = 1; current <= total; current += 1) {
        const pages = getPageItems(current, total).flatMap((item) =>
          item.type === 'page' ? [item.page] : [],
        );
        expect(new Set(pages).size).toBe(pages.length);
        expect([...pages].sort((a, b) => a - b)).toEqual(pages);
        expect(pages).toContain(1);
        expect(pages).toContain(total);
        expect(pages).toContain(current);
      }
    }
  });

  it('never needs more than 7 slots', () => {
    for (let total = 1; total <= 60; total += 1) {
      for (let current = 1; current <= total; current += 1) {
        expect(getPageItems(current, total).length).toBeLessThanOrEqual(7);
      }
    }
  });

  it('records which page each ellipsis follows', () => {
    expect(getPageItems(5, 10)).toContainEqual({ type: 'ellipsis', after: 1 });
    expect(getPageItems(5, 10)).toContainEqual({ type: 'ellipsis', after: 6 });
  });

  it('clamps the current page and treats a missing page count as 1', () => {
    expect(show(getPageItems(0, 10))).toEqual(show(getPageItems(1, 10)));
    expect(show(getPageItems(99, 10))).toEqual(show(getPageItems(10, 10)));
    expect(show(getPageItems(3, 0))).toEqual([1]);
    expect(show(getPageItems(3, -4))).toEqual([1]);
  });
});

describe('getPageCount', () => {
  it('rounds up and is at least 1', () => {
    expect(getPageCount(42, 10)).toBe(5);
    expect(getPageCount(40, 10)).toBe(4);
    expect(getPageCount(0, 10)).toBe(1);
    expect(getPageCount(5, 0)).toBe(1);
  });
});

describe('getItemRange', () => {
  it('returns the 1-based range of the page', () => {
    expect(getItemRange(1, 10, 42)).toEqual({ from: 1, to: 10 });
    expect(getItemRange(5, 10, 42)).toEqual({ from: 41, to: 42 });
  });

  it('returns null when there are no items', () => {
    expect(getItemRange(1, 10, 0)).toBeNull();
    expect(getItemRange(1, 0, 42)).toBeNull();
  });
});
