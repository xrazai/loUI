const rulesCache = new Map<string, Intl.PluralRules>();

function getRules(locale: string): Intl.PluralRules {
  let rules = rulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    rulesCache.set(locale, rules);
  }
  return rules;
}

export interface PluralForms {
  /** Used only when `count` is exactly 0 (ICU `=0`), before the category lookup. */
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  /** Required fallback. */
  other: string;
}

/**
 * Picks a plural form for `count` using `Intl.PluralRules`.
 * Call it from catalog functions, passing that catalog's own locale:
 * `selected: (n: number) => plural('en', n, { one: '1 selected', other: `${n} selected` })`.
 */
export function plural(locale: string, count: number, forms: PluralForms): string {
  if (count === 0 && forms.zero !== undefined) return forms.zero;
  const category = getRules(locale).select(count);
  return forms[category] ?? forms.other;
}
