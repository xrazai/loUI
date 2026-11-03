import type { ManifestEntry } from './types.ts';

/**
 * Small, dependency-free ranked search over manifest entries and recipes. It exists so an
 * agent can describe a UI in plain words ("a table of orders with sorting") and get the
 * right components first. Deterministic: same query and data, same order.
 */

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'for',
  'from',
  'has',
  'have',
  'how',
  'in',
  'into',
  'is',
  'it',
  'its',
  'my',
  'of',
  'on',
  'or',
  'show',
  'that',
  'the',
  'their',
  'then',
  'this',
  'to',
  'under',
  'use',
  'user',
  'users',
  'want',
  'when',
  'with',
  'page',
  'screen',
]);

/** Splits camelCase and punctuation into lowercase words. */
export function words(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Crude stemmer: enough to make "sorting", "sorted" and "sorts" meet at "sort". */
export function stem(word: string): string {
  let w = word;
  for (const suffix of ['ing', 'ed', 'es', 's']) {
    if (w.length > suffix.length + 3 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  return w;
}

/** The stems that carry meaning in a query. */
export function queryTerms(query: string): string[] {
  return [
    ...new Set(
      words(query)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w))
        .map(stem),
    ),
  ];
}

function stemsOf(text: string): Set<string> {
  return new Set(words(text).map(stem));
}

function hits(term: string, bag: Set<string>): boolean {
  if (bag.has(term)) return true;
  if (term.length < 4) return false;
  for (const candidate of bag) {
    if (candidate.length >= 4 && (candidate.startsWith(term) || term.startsWith(candidate))) {
      return true;
    }
  }
  return false;
}

export interface Searchable {
  name: string;
  /** Text fields with a weight, strongest first. */
  fields: { text: string; weight: number }[];
}

/** Builds the weighted fields of a manifest entry. */
export function searchableEntry(entry: ManifestEntry): Searchable {
  const docs = entry.docs;
  return {
    name: entry.name,
    fields: [
      { text: entry.name, weight: 8 },
      { text: docs?.whenToUse?.join(' ') ?? '', weight: 4 },
      { text: docs?.summary ?? entry.description ?? '', weight: 3 },
      { text: entry.description ?? '', weight: 1 },
    ],
  };
}

/**
 * Scores items against a free-text query. Each query term earns the weight of the
 * strongest field it appears in; terms are summed, so an item that covers more of the
 * request wins. The whole query as a substring of the name keeps the old "type a name"
 * behavior on top. Items scoring 0 are dropped. Ties break by name.
 */
export function rank(items: Searchable[], query: string): { name: string; score: number }[] {
  const terms = queryTerms(query);
  const phrase = query.trim().toLowerCase();
  const scored = items.map((item) => {
    const bags = item.fields.map((f) => ({ bag: stemsOf(f.text), weight: f.weight }));
    let score = 0;
    for (const term of terms) {
      score += Math.max(0, ...bags.map((b) => (hits(term, b.bag) ? b.weight : 0)));
    }
    if (phrase && item.name.toLowerCase().includes(phrase)) score += 10;
    return { name: item.name, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/** Section body under a `## heading` in a Markdown file ('' when absent). */
function section(markdown: string, heading: string): string {
  const pattern = String.raw`^## ${heading}\s*$([\s\S]*?)(?=^## |(?![\s\S]))`;
  const match = new RegExp(pattern, 'im').exec(markdown);
  return match?.[1] ?? '';
}

/** Weighted fields of a recipe file: its name, intro and "When to use" section. */
export function searchableRecipe(name: string, markdown: string): Searchable {
  const intro = markdown.split(/^## /m)[0] ?? '';
  return {
    name,
    fields: [
      { text: name, weight: 8 },
      { text: section(markdown, 'When to use'), weight: 4 },
      { text: intro, weight: 3 },
      { text: section(markdown, 'What it does'), weight: 1 },
    ],
  };
}
