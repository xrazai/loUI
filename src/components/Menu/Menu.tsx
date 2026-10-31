import type { ReactElement, ReactNode, Ref } from 'react';
import {
  Header,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger,
  Popover as AriaPopover,
  Separator,
  SubmenuTrigger,
} from 'react-aria-components';
import type {
  MenuItemProps as AriaMenuItemProps,
  MenuProps as AriaMenuProps,
  MenuSectionProps as AriaMenuSectionProps,
  PopoverProps as AriaPopoverProps,
} from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Icon } from '../Icon';
import { CheckIcon, ChevronRightIcon, EllipsisIcon } from '../Icon/icons';
import { IconButton } from '../IconButton';
import { messages } from './Menu.messages';
import styles from './Menu.module.css';

export type MenuPlacement = NonNullable<AriaPopoverProps['placement']>;
export type MenuItemTone = 'neutral' | 'danger';

export interface MenuProps extends Omit<
  AriaMenuProps<object>,
  'className' | 'style' | 'children' | 'render'
> {
  /**
   * The element that opens the menu: a `Button` or `IconButton`. It receives `aria-haspopup`,
   * `aria-expanded` and names the menu (`aria-labelledby`), so give it a clear name.
   */
  trigger: ReactElement;
  /** `MenuItem`, `MenuSection`, `MenuSeparator` and `SubMenu` elements. */
  children: ReactNode;
  /** Side and alignment relative to the trigger. Default `bottom start`. Flips on collision. */
  placement?: MenuPlacement;
  /** Controlled open state. Pair with `onOpenChange`. */
  isOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Class name for the menu list. */
  className?: string;
  /** Class name for the popover that holds the menu. */
  popoverClassName?: string;
  /** Ref to the menu list element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A menu of commands that opens from a trigger, built on React Aria `MenuTrigger`, `Popover`
 * and `Menu`.
 *
 * Keys: the trigger opens it with Enter, Space or Arrow Down (focus goes to the first item;
 * Arrow Up focuses the last); Arrow Up/Down, Home/End and typeahead move; Enter or Space
 * activates; Escape closes and focus returns to the trigger. Selection modes
 * (`selectionMode="single"` or `"multiple"`) turn items into radio or checkbox items.
 */
export function Menu({
  trigger,
  children,
  placement = 'bottom start',
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  popoverClassName,
  ref,
  ...rest
}: MenuProps) {
  return (
    <MenuTrigger
      {...(isOpen === undefined ? {} : { isOpen })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {trigger}
      {/* RAC writes an inline z-index; the style prop is the only way to use the popover layer. */}
      <AriaPopover
        placement={placement}
        offset={0}
        className={classNames(styles.popover, popoverClassName)}
        style={{ zIndex: 'var(--ds-z-popover)' }}
      >
        <AriaMenu
          {...rest}
          {...(ref ? { ref } : {})}
          className={classNames(styles.menu, className)}
        >
          {children}
        </AriaMenu>
      </AriaPopover>
    </MenuTrigger>
  );
}

export interface MenuItemProps extends Omit<
  AriaMenuItemProps,
  'className' | 'style' | 'children' | 'render'
> {
  /** The label: a verb plus object in sentence case ("Duplicate order"). */
  children: ReactNode;
  /**
   * `danger` marks a destructive command (red text and tint). It does not confirm anything:
   * open a `ConfirmDialog` from `onAction`.
   */
  tone?: MenuItemTone;
  /** Shortcut hint in mono type ("Ctrl+D"). Visual only; it does not bind the key. */
  shortcut?: string;
  className?: string;
}

/**
 * One command. Inside a menu with `selectionMode` it becomes a checkbox or radio item and shows
 * its selected state with a check or a dot. Disabled items are dimmed and skipped by keyboard
 * navigation.
 */
export function MenuItem({
  children,
  tone = 'neutral',
  shortcut,
  className,
  ...rest
}: MenuItemProps) {
  return (
    <AriaMenuItem
      {...rest}
      data-tone={tone}
      className={classNames(styles.item, className)}
      {...(rest.textValue === undefined && typeof children === 'string'
        ? { textValue: children }
        : {})}
    >
      {({ isSelected, selectionMode, hasSubmenu }) => (
        <>
          {selectionMode === 'none' ? null : (
            <span className={classNames(styles.indicator)}>
              {isSelected ? (
                selectionMode === 'multiple' ? (
                  <Icon icon={CheckIcon} size="sm" />
                ) : (
                  <span className={classNames(styles.dot)} />
                )
              ) : null}
            </span>
          )}
          <span className={classNames(styles.label)}>{children}</span>
          {shortcut ? <span className={classNames(styles.shortcut)}>{shortcut}</span> : null}
          {hasSubmenu ? (
            <Icon
              icon={ChevronRightIcon}
              size="sm"
              directional
              className={classNames(styles.chevron)}
            />
          ) : null}
        </>
      )}
    </AriaMenuItem>
  );
}

export interface MenuSectionProps extends Omit<
  AriaMenuSectionProps<object>,
  'className' | 'style' | 'children' | 'render'
> {
  /** Caption of the group, announced as its name. Mono uppercase by CSS. Omit it for an unnamed group. */
  title?: string;
  /** `MenuItem` elements. */
  children: ReactNode;
  className?: string;
}

/**
 * A group of items with an optional caption. Give a section its own `selectionMode` to make a
 * radio group or a set of checkbox items inside a menu that also holds plain commands.
 */
export function MenuSection({ title, children, className, ...rest }: MenuSectionProps) {
  return (
    <AriaMenuSection
      {...rest}
      className={classNames(styles.section, className)}
      {...(title ? { 'aria-label': title } : {})}
    >
      {title ? <Header className={classNames(styles.sectionHeader)}>{title}</Header> : null}
      {children}
    </AriaMenuSection>
  );
}

/** A 1px line between groups of items. */
export function MenuSeparator({ className }: { className?: string }) {
  return <Separator className={classNames(styles.separator, className)} />;
}

export interface SubMenuProps {
  /** Label of the item that opens the submenu; end it with an ellipsis when it opens more choices ("Move to…"). */
  label: ReactNode;
  /** `MenuItem`, `MenuSection` and `MenuSeparator` elements of the submenu. */
  children: ReactNode;
  /** Used for typeahead and as the item's name when `label` is not a string. */
  textValue?: string;
  isDisabled?: boolean;
  /** Milliseconds the pointer must rest on the item before the submenu opens. Default 200. */
  delay?: number;
  /** Class name for the submenu list. */
  className?: string;
}

/**
 * An item that opens a nested menu. Arrow Right (Arrow Left in right-to-left) opens it and
 * Arrow Left closes it; Escape closes the submenu first, then the menu.
 */
export function SubMenu({
  label,
  children,
  textValue,
  isDisabled,
  delay,
  className,
}: SubMenuProps) {
  return (
    <SubmenuTrigger {...(delay === undefined ? {} : { delay })}>
      <MenuItem
        {...(textValue === undefined ? {} : { textValue })}
        {...(isDisabled === undefined ? {} : { isDisabled })}
      >
        {label}
      </MenuItem>
      <AriaPopover
        offset={0}
        className={classNames(styles.popover)}
        style={{ zIndex: 'var(--ds-z-popover)' }}
      >
        <AriaMenu className={classNames(styles.menu, className)}>{children}</AriaMenu>
      </AriaPopover>
    </SubmenuTrigger>
  );
}

export interface MoreActionsMenuProps extends Omit<MenuProps, 'trigger'> {
  /** Size of the trigger button. Default `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * The common "more actions" menu: an icon button with three dots whose name comes from the
 * message catalog ("More actions"), opening a `Menu`. Use it for the row or card actions that
 * do not deserve their own button.
 */
export function MoreActionsMenu({
  size = 'md',
  messages: overrides,
  placement = 'bottom end',
  ...rest
}: MoreActionsMenuProps) {
  const t = useMessages('Menu', messages, overrides);
  return (
    <Menu
      {...rest}
      placement={placement}
      trigger={
        <IconButton variant="ghost" size={size} icon={EllipsisIcon} label={t.moreActions} tooltip />
      }
    />
  );
}
