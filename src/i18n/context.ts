import { createContext } from 'react';
import { DEFAULT_LOCALE } from './locales';
import type { DSMessages } from './messages';

export interface DSContextValue {
  locale: string;
  messages: DSMessages | undefined;
}

/** Internal: set by `DSProvider`. Without a provider: English and no overrides. */
export const DSContext = createContext<DSContextValue>({
  locale: DEFAULT_LOCALE,
  messages: undefined,
});
