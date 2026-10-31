import { createCache } from './formatCache';

const collators = createCache<Intl.Collator>();

/**
 * Collator for alphabetical order as the product requires (AGENTS.md section 5, rule 5b):
 * accent- and case-insensitive (`sensitivity: 'base'`) with natural number order
 * (`numeric: true`, so `Item 2` sorts before `Item 10`). The instance is shared
 * and cached per locale; do not mutate it.
 */
export function createTextCollator(locale: string): Intl.Collator {
  return collators.get(
    locale,
    () => new Intl.Collator(locale, { sensitivity: 'base', numeric: true }),
  );
}

/** Compares two strings alphabetically for `locale`; usable as an `Array.prototype.sort` comparator. */
export function compareText(a: string, b: string, locale: string): number {
  return createTextCollator(locale).compare(a, b);
}

/**
 * Returns a new array sorted alphabetically by `getText(item)`. Stable: items whose
 * text compares equal (for example `Ana` and `ana`, or `é` and `e`) keep their input order.
 */
export function sortByText<T>(
  items: readonly T[],
  getText: (item: T) => string,
  locale: string,
): T[] {
  const collator = createTextCollator(locale);
  return items
    .map((item, index) => ({ item, index, text: getText(item) }))
    .sort((a, b) => collator.compare(a.text, b.text) || a.index - b.index)
    .map((entry) => entry.item);
}

const ASCII_ONLY = /^\p{ASCII}*$/u;
const COMBINING_MARKS = /\p{M}/gu;

/** Folds one code point: decomposes, drops combining marks, lowercases. */
function foldCodePoint(char: string): string {
  return char.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

/**
 * Normalizes text for accent- and case-insensitive search: `Café` and `cafe` both
 * become `cafe`. Works per code point so it stays index-aligned with `highlightMatch`.
 */
export function normalizeSearch(text: string): string {
  if (ASCII_ONLY.test(text)) return text.toLowerCase();
  let folded = '';
  for (const char of text) folded += foldCodePoint(char);
  return folded;
}

/** True when `text` contains `query`, ignoring case and accents. An empty query matches everything. */
export function matchesSearch(text: string, query: string): boolean {
  const needle = normalizeSearch(query).trim();
  return needle === '' || normalizeSearch(text).includes(needle);
}

export interface HighlightSegment {
  text: string;
  /** True for the parts of `text` that matched the query. */
  match: boolean;
}

/**
 * Splits `text` into matched and unmatched segments for highlighting, ignoring case
 * and accents. The segments always concatenate back to `text` exactly, and a match
 * keeps any combining marks attached to its last letter. All occurrences are returned.
 *
 * `highlightMatch('Crème brûlée', 'creme')` gives `[{ text: 'Crème', match: true }, { text: ' brûlée', match: false }]`.
 */
export function highlightMatch(text: string, query: string): HighlightSegment[] {
  if (text === '') return [];
  const needle = normalizeSearch(query).trim();
  if (needle === '') return [{ text, match: false }];

  // Fold per code point, remembering where each folded unit came from in `text`.
  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let previousFirst = 0;
  let position = 0;
  for (const char of text) {
    const end = position + char.length;
    const piece = foldCodePoint(char);
    if (piece === '') {
      // A standalone combining mark stays attached to the previous letter.
      for (let index = previousFirst; index < ends.length; index += 1) ends[index] = end;
    } else {
      previousFirst = starts.length;
      for (let unit = 0; unit < piece.length; unit += 1) {
        starts.push(position);
        ends.push(end);
      }
      folded += piece;
    }
    position = end;
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  let searchFrom = 0;
  for (;;) {
    const found = folded.indexOf(needle, searchFrom);
    if (found === -1) break;
    const matchStart = starts[found];
    const matchEnd = ends[found + needle.length - 1];
    searchFrom = found + needle.length;
    if (matchStart === undefined || matchEnd === undefined || matchStart < cursor) continue;
    if (matchStart > cursor) segments.push({ text: text.slice(cursor, matchStart), match: false });
    segments.push({ text: text.slice(matchStart, matchEnd), match: true });
    cursor = matchEnd;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}
