import {
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
  CircleAlert as CircleAlertIcon,
  CircleCheck as CircleCheckIcon,
  CircleX as CircleXIcon,
  Ellipsis as EllipsisIcon,
  ExternalLink as ExternalLinkIcon,
  Info as InfoIcon,
  LoaderCircle as LoaderIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Star as StarIcon,
  TriangleAlert as TriangleAlertIcon,
  X as XIcon,
} from 'lucide-react';

/**
 * Curated icon set (ICON-003). Only these icons are part of the design system: the manifest
 * lists them for AI tooling, and consumers import them from here instead of `lucide-react`.
 * Lucide is bundled (never fetched at runtime) and every export is tree-shakeable.
 * Add an icon here, with a documented use, before using it in a component.
 */
export {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  InfoIcon,
  LoaderIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  TriangleAlertIcon,
  XIcon,
};

/** Lucide icon component type, for props that accept any icon of the set. */
export type { LucideIcon as IconComponent } from 'lucide-react';

/**
 * Kebab-case names of the curated set with the use each icon is meant for. Source of the
 * allow-list in the component manifest; keep it in sync with the exports above (tested).
 */
export const iconNames = {
  'arrow-down': 'Descending sort, move down',
  'arrow-left': 'Back, previous page',
  'arrow-right': 'Forward, next step',
  'arrow-up': 'Ascending sort, move up',
  calendar: 'Date fields and date pickers',
  check: 'Done, selected, checkbox mark',
  'chevron-down': 'Collapsed disclosure, select trigger, menu button',
  'chevron-left': 'Previous month or page (use the directional prop so it mirrors in RTL)',
  'chevron-right': 'Next month or page, submenu, breadcrumb separator (directional)',
  'chevron-up': 'Expanded disclosure',
  'chevrons-up-down': 'Sortable column, select trigger with many options',
  'circle-alert': 'Error and danger status',
  'circle-check': 'Success status',
  'circle-x': 'Failed status, clear input',
  ellipsis: 'More actions (overflow menu)',
  'external-link': 'Link that opens in a new tab',
  info: 'Neutral information status',
  loader: 'Loading glyph (static); animated loading uses Spinner',
  minus: 'Remove one, indeterminate checkbox',
  plus: 'Add, create',
  search: 'Search fields',
  star: 'Rating, favorite',
  'triangle-alert': 'Warning status',
  x: 'Close, dismiss, remove',
} as const;

/** The curated set by kebab-case name, for tooling and name-driven rendering. */
export const iconSet = {
  'arrow-down': ArrowDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-up': ArrowUpIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-up': ChevronUpIcon,
  'chevrons-up-down': ChevronsUpDownIcon,
  'circle-alert': CircleAlertIcon,
  'circle-check': CircleCheckIcon,
  'circle-x': CircleXIcon,
  ellipsis: EllipsisIcon,
  'external-link': ExternalLinkIcon,
  info: InfoIcon,
  loader: LoaderIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  search: SearchIcon,
  star: StarIcon,
  'triangle-alert': TriangleAlertIcon,
  x: XIcon,
} as const;

/** Name of an icon in the curated set. */
export type IconName = keyof typeof iconNames;
