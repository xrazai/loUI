/** One slot of the page list: a page button or the gap between two non-adjacent pages. */
export type PageItem =
  | { readonly type: 'page'; readonly page: number }
  | { readonly type: 'ellipsis'; readonly after: number };

/** Up to this many pages every page is shown; beyond it the list collapses with ellipses. */
export const MAX_PAGES_WITHOUT_ELLIPSIS = 7;

/**
 * Which page buttons to show, with ellipses for the pages that are left out.
 *
 * Up to 7 pages all of them are listed. Beyond that the first page, the last page, the current
 * page and its two neighbours are listed, and a gap between two of them becomes an ellipsis.
 * A gap that hides exactly one page shows that page instead (an ellipsis for a single page
 * would be wider than the page it hides). `current` is clamped into `1..pageCount`; a
 * `pageCount` below 1 is treated as 1.
 *
 * ```
 * getPageItems(1, 10)  // 1 2 3 4 5 6 7 8 9 10 collapses to: 1 2 … 10
 * getPageItems(5, 10)  // 1 … 4 5 6 … 10
 * ```
 */
export function getPageItems(current: number, pageCount: number): PageItem[] {
  const total = Math.max(1, Math.floor(pageCount));
  const page = Math.min(Math.max(1, Math.floor(current)), total);

  if (total <= MAX_PAGES_WITHOUT_ELLIPSIS) {
    return Array.from({ length: total }, (_, index) => ({ type: 'page', page: index + 1 }));
  }

  const wanted = [...new Set([1, total, page, page - 1, page + 1])]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  wanted.forEach((value, index) => {
    const previous = wanted[index - 1];
    if (previous !== undefined) {
      const hidden = value - previous - 1;
      if (hidden === 1) items.push({ type: 'page', page: previous + 1 });
      else if (hidden > 1) items.push({ type: 'ellipsis', after: previous });
    }
    items.push({ type: 'page', page: value });
  });
  return items;
}

/** Number of pages for `total` items shown `pageSize` at a time (at least 1). */
export function getPageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/** The 1-based range of items on `page`, or `null` when there are no items. */
export function getItemRange(
  page: number,
  pageSize: number,
  total: number,
): { from: number; to: number } | null {
  if (total <= 0 || pageSize <= 0) return null;
  const from = (page - 1) * pageSize + 1;
  return { from, to: Math.min(total, page * pageSize) };
}
