import { useMemo } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { I18nProvider, RouterProvider } from 'react-aria-components';
import { DSContext } from '../i18n/context';
import { DEFAULT_LOCALE, normalizeLocale } from '../i18n/locales';
import type { DSMessages } from '../i18n/messages';

type RouterProviderProps = ComponentProps<typeof RouterProvider>;

export interface DSProviderProps {
  /** BCP 47 locale for messages, formatting, sorting and RAC components. Default `en-US`. */
  locale?: string | undefined;
  /** Message overrides keyed by component, applied over the built-in catalogs. */
  messages?: DSMessages | undefined;
  /** Client-side navigation for link components (passed to RAC `RouterProvider`). */
  navigate?: RouterProviderProps['navigate'] | undefined;
  /** Maps a router path to a real `href` (passed to RAC `RouterProvider`). */
  useHref?: RouterProviderProps['useHref'] | undefined;
  children: ReactNode;
}

/**
 * Root provider of Loui DS. Supplies the locale (also to RAC through its
 * `I18nProvider`), message overrides and optional client-side routing.
 */
export function DSProvider({
  locale = DEFAULT_LOCALE,
  messages,
  navigate,
  useHref,
  children,
}: DSProviderProps) {
  const tag = normalizeLocale(locale);
  const value = useMemo(() => ({ locale: tag, messages }), [tag, messages]);
  const content = navigate ? (
    <RouterProvider navigate={navigate} {...(useHref ? { useHref } : {})}>
      {children}
    </RouterProvider>
  ) : (
    children
  );
  return (
    <DSContext value={value}>
      <I18nProvider locale={tag}>{content}</I18nProvider>
    </DSContext>
  );
}
