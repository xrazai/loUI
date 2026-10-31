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

// Overlays and feedback
export { ConfirmDialog, Dialog } from './components/Dialog';
export type {
  ConfirmDialogProps,
  DialogProps,
  DialogRenderOptions,
  DialogSize,
} from './components/Dialog';
export { InlineConfirm } from './components/InlineConfirm';
export type { InlineConfirmProps } from './components/InlineConfirm';
export {
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MoreActionsMenu,
  SubMenu,
} from './components/Menu';
export type {
  MenuItemProps,
  MenuItemTone,
  MenuPlacement,
  MenuProps,
  MenuSectionProps,
  MoreActionsMenuProps,
  SubMenuProps,
} from './components/Menu';
export { Popover } from './components/Popover';
export type { PopoverPlacement, PopoverProps } from './components/Popover';
export { Sheet } from './components/Sheet';
export type { SheetProps, SheetRenderOptions, SheetSize } from './components/Sheet';
export {
  DEFAULT_TOAST_TIMEOUT,
  ToastRegion,
  createToastApi,
  createToastQueue,
  toast,
  useToast,
} from './components/Toast';
export type {
  ToastAction,
  ToastApi,
  ToastOptions,
  ToastQueue,
  ToastRegionProps,
  ToastTone,
} from './components/Toast';
export { TOOLTIP_DELAY, Tooltip } from './components/Tooltip';
export type { TooltipPlacement, TooltipProps } from './components/Tooltip';
export type { IconButtonTooltipOptions } from './components/IconButton';

// Form fields
export { Checkbox, CheckboxGroup } from './components/Checkbox';
export type { CheckboxGroupProps, CheckboxProps } from './components/Checkbox';
export { Description, FieldError, FieldMessages, Label, RequiredMark } from './components/Field';
export type {
  DescriptionProps,
  FieldErrorMessage,
  FieldErrorProps,
  FieldLabelingProps,
  FieldMessagesProps,
  FieldValidation,
  LabelProps,
  RequiredMarkProps,
  WithLabel,
} from './components/Field';
export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';
export { Radio, RadioGroup } from './components/RadioGroup';
export type { RadioGroupProps, RadioProps } from './components/RadioGroup';
export { Select } from './components/Select';
export type {
  SelectGroup,
  SelectMessages,
  SelectOption,
  SelectProps,
  SelectSize,
} from './components/Select';
export { Switch } from './components/Switch';
export type { SwitchLabelPlacement, SwitchProps } from './components/Switch';
export { Textarea } from './components/Textarea';
export type { TextareaMessages, TextareaProps, TextareaResize } from './components/Textarea';

// Navigation and layout
export { Accordion } from './components/Accordion';
export type {
  AccordionHeadingLevel,
  AccordionItem,
  AccordionProps,
  AccordionVariant,
} from './components/Accordion';
export { Breadcrumb } from './components/Breadcrumb';
export type { BreadcrumbItem, BreadcrumbProps } from './components/Breadcrumb';
export { NavItem } from './components/NavItem';
export type { NavItemProps, NavItemTone } from './components/NavItem';
export { Pagination, getItemRange, getPageCount, getPageItems } from './components/Pagination';
export type { PageItem, PaginationProps } from './components/Pagination';
export { SegmentedControl } from './components/SegmentedControl';
export type {
  SegmentedControlOption,
  SegmentedControlProps,
  SegmentedControlSize,
} from './components/SegmentedControl';
export { Sidebar } from './components/Sidebar';
export type {
  SidebarItem,
  SidebarProps,
  SidebarSection,
  SidebarStatus,
  SidebarUser,
  SidebarWorkspace,
} from './components/Sidebar';
export { SkipLink } from './components/SkipLink';
export type { SkipLinkProps } from './components/SkipLink';
export { SuggestionChip } from './components/SuggestionChip';
export type { SuggestionChipProps } from './components/SuggestionChip';
export { Tab, TabList, TabPanel, Tabs } from './components/Tabs';
export type {
  TabCountTone,
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsProps,
} from './components/Tabs';
export { TopBar } from './components/TopBar';
export type { TopBarHeadingLevel, TopBarProps } from './components/TopBar';

// Status and selection
export { ChoiceTiles } from './components/ChoiceTiles';
export type {
  ChoiceTilesOption,
  ChoiceTilesProps,
  ChoiceTilesSize,
} from './components/ChoiceTiles';
export { DueIndicator } from './components/DueIndicator';
export type { DueIndicatorProps } from './components/DueIndicator';
export { StatusSteps } from './components/StatusSteps';
export type { StatusStep, StatusStepState, StatusStepsProps } from './components/StatusSteps';
export { Swatch } from './components/Swatch';
export type { SwatchProps, SwatchSize } from './components/Swatch';

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
