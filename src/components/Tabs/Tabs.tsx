import type { ReactNode, Ref } from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from 'react-aria-components';
import type {
  TabListProps as AriaTabListProps,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { useDSLocale } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { Kbd } from '../Kbd';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Tabs.module.css';

export type TabCountTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface TabsProps extends Omit<
  AriaTabsProps,
  'className' | 'style' | 'children' | 'orientation'
> {
  /** A `TabList` followed by one `TabPanel` per tab. */
  children: ReactNode;
  className?: string;
  /** Ref to the root element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Tabs switch between panels of related content. Built on React Aria `Tabs`: one tab stop,
 * `Left` / `Right` / `Home` / `End` move between tabs, `Tab` moves into the panel.
 *
 * Selection follows RAC: `selectedKey` / `defaultSelectedKey` / `onSelectionChange`.
 * `keyboardActivation="manual"` makes the arrow keys only move focus; `Enter` or `Space`
 * then activates the tab (use it when showing a panel is slow or has side effects).
 */
export function Tabs({ className, children, ...rest }: TabsProps) {
  return (
    <AriaTabs {...rest} className={classNames(styles.root, className)}>
      {children}
    </AriaTabs>
  );
}

export interface TabListProps extends Omit<
  AriaTabListProps<object>,
  'className' | 'style' | 'children'
> {
  /** The `Tab`s. Each `Tab` needs an `id` that matches a `TabPanel`. */
  children: ReactNode;
  className?: string;
  /** Ref to the `tablist` element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * The row of tabs. Name it with `aria-label` (or `aria-labelledby`) so screen readers can
 * tell several tab lists apart.
 */
export function TabList({ className, children, ...rest }: TabListProps) {
  return (
    <AriaTabList {...rest} className={classNames(styles.list, className)}>
      {children}
    </AriaTabList>
  );
}

export interface TabProps extends Omit<AriaTabProps, 'className' | 'style' | 'children'> {
  /** Tab label: a noun in sentence case ("Orders"). */
  children: ReactNode;
  /**
   * A count shown after the label. Numbers are formatted for the active locale. The count is
   * part of the tab's accessible name, so pair it with `countLabel` when the bare number is
   * ambiguous.
   */
  count?: number | string;
  /**
   * Accessible text for the count ("3 pending"). When set, it replaces the visible count in the
   * accessible name. Recommended whenever `countTone` is not `neutral`.
   */
  countLabel?: string;
  /**
   * Tone of the count. `neutral` (default) is plain mono text; the other tones draw a soft pill.
   * Color never carries the meaning alone: use `countLabel` to say what the count means.
   */
  countTone?: TabCountTone;
  /**
   * Keys of a shortcut hint shown after the label, as for `Kbd` (`['1']`, `['Mod', 'K']`).
   * Decorative: hidden from assistive technology, and it registers nothing. Register the
   * shortcut itself with `useHotkey`.
   */
  shortcut?: readonly string[];
  className?: string;
  /** Ref to the tab element. */
  ref?: Ref<HTMLDivElement>;
}

/** One tab of a `TabList`, with an optional count and shortcut hint. */
export function Tab({
  children,
  count,
  countLabel,
  countTone = 'neutral',
  shortcut,
  className,
  ...rest
}: TabProps) {
  const locale = useDSLocale();
  const hasCount = count !== undefined && count !== '';
  const visibleCount = typeof count === 'number' ? formatNumber(count, locale) : count;
  return (
    <AriaTab {...rest} className={classNames(styles.tab, className)}>
      <span className={styles.label}>{children}</span>
      {hasCount ? (
        <span className={styles.count} data-tone={countTone}>
          <span aria-hidden={countLabel === undefined ? undefined : 'true'}>{visibleCount}</span>
          {countLabel === undefined ? null : <VisuallyHidden> {countLabel}</VisuallyHidden>}
        </span>
      ) : null}
      {shortcut && shortcut.length > 0 ? (
        <span className={styles.shortcut} aria-hidden="true">
          <Kbd keys={shortcut} />
        </span>
      ) : null}
    </AriaTab>
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'className' | 'style' | 'children'> {
  /** Panel content. */
  children?: ReactNode;
  className?: string;
  /** Ref to the `tabpanel` element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * The content of one tab. `id` must equal the `id` of its `Tab`; the panel is then labelled by
 * the tab and the tab points to the panel (`aria-controls`). The panel is focusable when it
 * has no focusable content, so keyboard users can reach it.
 */
export function TabPanel({ className, children, ...rest }: TabPanelProps) {
  return (
    <AriaTabPanel {...rest} className={classNames(styles.panel, className)}>
      {children}
    </AriaTabPanel>
  );
}
