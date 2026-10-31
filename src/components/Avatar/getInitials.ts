const graphemeSegmenters = new Map<string, Intl.Segmenter>();
const wordSegmenters = new Map<string, Intl.Segmenter>();

function segmenter(
  cache: Map<string, Intl.Segmenter>,
  locale: string,
  granularity: 'grapheme' | 'word',
): Intl.Segmenter {
  const key = `${locale}|${granularity}`;
  let found = cache.get(key);
  if (!found) {
    found = new Intl.Segmenter(locale, { granularity });
    cache.set(key, found);
  }
  return found;
}

function firstLetter(word: string, locale: string): string {
  for (const part of segmenter(graphemeSegmenters, locale, 'grapheme').segment(word)) {
    return part.segment;
  }
  return '';
}

/**
 * Initials of a person's name: the first letter of the first and of the last word
 * (`Ana Maria da Silva` gives `AS`), or one letter for a single word. Uses `Intl.Segmenter`,
 * so combined characters stay whole, and upper-cases with the locale rules (`i` in `tr`).
 */
export function getInitials(name: string, locale: string): string {
  const words: string[] = [];
  for (const part of segmenter(wordSegmenters, locale, 'word').segment(name.trim())) {
    if (part.isWordLike) words.push(part.segment);
  }
  const first = words[0];
  if (first === undefined) return '';
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  const letters =
    firstLetter(first, locale) + (last === undefined ? '' : firstLetter(last, locale));
  return letters.toLocaleUpperCase(locale);
}
