import './styles/index.css';
export { VisuallyHidden } from './components/VisuallyHidden';
export type { VisuallyHiddenProps } from './components/VisuallyHidden';

// Actions and icons
export { Button } from './components/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button';
export { Icon } from './components/Icon';
export * from './components/Icon/icons';
export type { IconProps, IconSize } from './components/Icon';
export { IconButton } from './components/IconButton';
export type { IconButtonProps, IconButtonSize, IconButtonVariant } from './components/IconButton';
export { Link } from './components/Link';
export type { LinkProps, LinkVariant } from './components/Link';
export { Spinner } from './components/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner';

// Display
export { Alert } from './components/Alert';
export type { AlertProps, AlertTone } from './components/Alert';
export { Avatar, getInitials } from './components/Avatar';
export type { AvatarProps, AvatarSize } from './components/Avatar';
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeTone } from './components/Badge';
export { Card } from './components/Card';
export type { CardHeadingLevel, CardProps, CardVariant } from './components/Card';
export { EmptyState } from './components/EmptyState';
export type { EmptyStateHeadingLevel, EmptyStateProps } from './components/EmptyState';
export { Kbd } from './components/Kbd';
export type { KbdPlatform, KbdProps } from './components/Kbd';
export { Meter, Progress } from './components/Progress';
export type { MeterProps, ProgressProps, ProgressTone } from './components/Progress';
export { Skeleton } from './components/Skeleton';
export type { SkeletonProps } from './components/Skeleton';
export { Tag, TagGroup } from './components/Tag';
export type { TagGroupProps, TagProps } from './components/Tag';

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
