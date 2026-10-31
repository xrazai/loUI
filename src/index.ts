import './styles/index.css';
export { VisuallyHidden } from './components/VisuallyHidden';
export type { VisuallyHiddenProps } from './components/VisuallyHidden';

// Provider and i18n (ADR-0005)
export { DSProvider } from './providers';
export type { DSProviderProps } from './providers';
export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  defineMessages,
  plural,
  useDSLocale,
  useMessages,
} from './i18n';
export type {
  DSMessages,
  Message,
  MessageCatalog,
  MessageOverrides,
  MessageSet,
  PluralForms,
  SupportedLocale,
} from './i18n';
// Locale and direction as seen by react-aria-components (set by DSProvider).
export { isRTL, useLocale } from 'react-aria-components';

// Locale-aware utilities (ADR-0006: money is integer minor units)
export * from './utils';

// Hooks that react-aria / react-stately do not cover
export * from './hooks';
