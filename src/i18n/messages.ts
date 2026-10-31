import { FALLBACK_LANGUAGE, getLanguage, normalizeLocale } from './locales';

/**
 * A message is a plain string, or a function for interpolation and plurals.
 * Functions receive the values to insert and return the final string, e.g.
 * `selected: (n: number) => plural('en', n, { one: '1 selected', other: `${n} selected` })`.
 */
export type Message = string | ((...args: never[]) => string);

/** All messages of one component for one locale. */
export type MessageSet = Readonly<Record<string, Message>>;

/** Partial overrides of one component's messages. */
export type MessageOverrides = Readonly<Partial<Record<string, Message>>>;

/**
 * Catalog of a component: English is mandatory, `pt-BR` ships with the library,
 * and any other locale may be added (also by consumers) as an extra key.
 */
export type MessageCatalog<M extends MessageSet> = {
  readonly en: M;
  readonly 'pt-BR': M;
  readonly [locale: string]: M | undefined;
};

/**
 * Per-component message overrides, as accepted by `DSProvider`.
 * Keyed by component key; each entry may override any subset of its messages.
 */
export type DSMessages = Readonly<Record<string, MessageOverrides | undefined>>;

/**
 * Declares a component's catalog. Identity function that type-checks that
 * `pt-BR` has exactly the same keys and signatures as `en`.
 */
export function defineMessages<M extends MessageSet>(catalog: {
  readonly en: M;
  readonly 'pt-BR': NoInfer<M>;
  readonly [locale: string]: NoInfer<M> | undefined;
}): MessageCatalog<M> {
  return catalog;
}

/**
 * Resolves a component's messages. Per key, the first defined value wins:
 * instance override > provider override > `catalog[locale]` > `catalog[language]` > `catalog.en`.
 * Pure function; the `useMessages` hook is a thin memoized wrapper around it.
 */
export function resolveMessages<M extends MessageSet>(
  catalog: MessageCatalog<M>,
  locale: string,
  providerOverrides?: MessageOverrides,
  instanceOverrides?: MessageOverrides,
): M {
  const tag = normalizeLocale(locale);
  const language = getLanguage(tag);
  const layers: (MessageOverrides | undefined)[] = [
    catalog[FALLBACK_LANGUAGE],
    language === tag ? undefined : catalog[language],
    catalog[tag],
    providerOverrides,
    instanceOverrides,
  ];
  return mergeMessages(layers) as M;
}

/** Merges layers left to right; later layers win and `undefined` values are skipped. */
export function mergeMessages(layers: readonly (MessageOverrides | undefined)[]): MessageSet {
  const merged: Record<string, Message> = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined) merged[key] = value;
    }
  }
  return merged;
}
