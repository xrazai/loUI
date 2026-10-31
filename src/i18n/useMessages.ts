import { useContext, useMemo } from 'react';
import { DSContext } from './context';
import { mergeMessages, resolveMessages } from './messages';
import type { MessageCatalog, MessageOverrides, MessageSet } from './messages';

/**
 * Returns a component's messages for the active locale.
 *
 * @param componentKey Key used by `DSProvider` overrides (the component name, e.g. `'Pagination'`).
 * @param catalog The component's `defineMessages` catalog (module-level constant).
 * @param overrides Per-instance overrides (typically a `messages` prop); highest priority.
 */
export function useMessages<M extends MessageSet>(
  componentKey: string,
  catalog: MessageCatalog<M>,
  overrides?: MessageOverrides,
): M {
  const { locale, messages } = useContext(DSContext);
  const providerOverrides = messages?.[componentKey];
  const base = useMemo(
    () => resolveMessages(catalog, locale, providerOverrides),
    [catalog, locale, providerOverrides],
  );
  // Instance overrides are usually a fresh object per render, so merge outside the memo.
  return overrides ? (mergeMessages([base, overrides]) as M) : base;
}

/** Returns the active locale (BCP 47 tag) set by `DSProvider`; `en-US` without a provider. */
export function useDSLocale(): string {
  return useContext(DSContext).locale;
}
