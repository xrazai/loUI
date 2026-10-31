export interface AddTagsInput {
  /** Tags already in the field, in order. */
  current: readonly string[];
  /** Candidate texts, untrimmed. Empty ones are ignored. */
  entries: readonly string[];
  /** Maximum number of tags in the field. */
  maxTags?: number | undefined;
  /** Returns a message when the tag is not allowed. */
  validate?: ((tag: string) => string | null | undefined) | undefined;
  /** Compare tags with case. Default: case-insensitive. */
  caseSensitive?: boolean | undefined;
  /** Locale for case folding. */
  locale: string;
}

export interface AddTagsResult {
  /** The list after the change (the same array content as `current` when nothing was added). */
  tags: string[];
  /** Tags that were added, in order. */
  added: string[];
  /** Candidates ignored because the tag already exists (or repeats in `entries`). */
  duplicates: string[];
  /** The first validation message, if a candidate was rejected by `validate`. */
  invalid: string | null;
  /** True when a candidate was rejected because `maxTags` was reached. */
  hitMax: boolean;
}

function escapeForRegExp(text: string): string {
  return text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Splits typed or pasted text into candidate tags at the delimiters and at line breaks.
 * The result is not trimmed and keeps empty parts, so `"a,b,"` gives `['a', 'b', '']`: the
 * caller decides what the last part means (text still being typed, or the end of a paste).
 */
export function splitEntries(text: string, delimiters: readonly string[]): string[] {
  const alternatives = [...delimiters.filter((d) => d !== ''), '\r\n', '\n', '\r'].map(
    escapeForRegExp,
  );
  return text.split(new RegExp(alternatives.join('|')));
}

/** True when `text` contains a delimiter or a line break. */
export function hasDelimiter(text: string, delimiters: readonly string[]): boolean {
  return splitEntries(text, delimiters).length > 1;
}

/**
 * Adds candidate tags to a list: trims, skips empty and duplicate ones, rejects tags the
 * validator refuses, and stops at the maximum. Pure; does not mutate its input.
 */
export function addTags({
  current,
  entries,
  maxTags,
  validate,
  caseSensitive = false,
  locale,
}: AddTagsInput): AddTagsResult {
  const keyOf = (tag: string) => (caseSensitive ? tag : tag.toLocaleLowerCase(locale));
  const tags = [...current];
  const seen = new Set(tags.map(keyOf));
  const added: string[] = [];
  const duplicates: string[] = [];
  let invalid: string | null = null;
  let hitMax = false;
  for (const entry of entries) {
    const tag = entry.trim();
    if (tag === '') continue;
    if (seen.has(keyOf(tag))) {
      duplicates.push(tag);
      continue;
    }
    if (maxTags !== undefined && tags.length >= maxTags) {
      hitMax = true;
      break;
    }
    const message = validate?.(tag);
    if (message) {
      invalid ??= message;
      continue;
    }
    seen.add(keyOf(tag));
    tags.push(tag);
    added.push(tag);
  }
  return { tags, added, duplicates, invalid, hitMax };
}
