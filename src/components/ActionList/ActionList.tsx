import { useRef } from 'react';
import type { ReactNode, Ref } from 'react';
import { GridList, GridListItem } from 'react-aria-components';
import type { GridListProps, Key } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { EmptyState } from '../EmptyState';
import { MoreActionsMenu } from '../Menu';
import { messages } from './ActionList.messages';
import styles from './ActionList.module.css';

export interface ActionListItem {
  /** Unique id of the row. */
  id: string;
  /** Main text of the row. Truncated with an ellipsis when it does not fit. */
  title: ReactNode;
  /**
   * Plain text that names the row for typeahead and for the "More actions for {title}" button.
   * Required when `title` is not a string.
   */
  textValue?: string;
  /** Secondary line under the title, in `text-2`. */
  description?: ReactNode;
  /** Value on the end side in mono type: a date, an amount, a size. */
  meta?: ReactNode;
  /** Node before the text: an `Avatar`, a thumbnail or an `Icon`. Keep it decorative or named. */
  leading?: ReactNode;
  /**
   * `MenuItem`, `MenuSection` and `MenuSeparator` elements for the "more actions" menu of this
   * row. Without it the row has no menu button.
   */
  actions?: ReactNode;
  /** Disables the row: it is dimmed and skipped by keyboard navigation. */
  isDisabled?: boolean;
}

interface ActionListBaseProps extends Omit<
  GridListProps<ActionListItem>,
  | 'children'
  | 'className'
  | 'style'
  | 'render'
  | 'items'
  | 'dependencies'
  | 'renderEmptyState'
  | 'onAction'
  | 'aria-label'
  | 'aria-labelledby'
  | 'selectionMode'
  | 'selectedKeys'
  | 'defaultSelectedKeys'
  | 'onSelectionChange'
  | 'selectionBehavior'
  | 'disallowEmptySelection'
  | 'disabledKeys'
  | 'dragAndDropHooks'
  | 'layout'
  | 'orientation'
  | 'UNSTABLE_focusOnEntry'
> {
  /** Class name for the list root. */
  className?: string;
  /** Ref to the list root element. */
  ref?: Ref<HTMLDivElement>;
  /**
   * The rows, in the order given. The list never sorts: lists are alphabetical by default in
   * this design system, so sort with `sortByText` before passing them (tasks by urgency and
   * dated records newest first are the exceptions).
   */
  items: readonly ActionListItem[];
  /**
   * Called when the user activates a row (click, or Enter on the focused row). Makes the whole
   * row a press target with hover and pointer cursor. The menu button does not trigger it.
   */
  onAction?: (item: ActionListItem) => void;
  /** Draws the border, surface and radius around the list. Turn off inside a `Card`. Default `true`. */
  bordered?: boolean;
  /** Content when `items` is empty. Default: an `EmptyState` with built-in text. */
  emptyState?: ReactNode;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

type ActionListNaming =
  | {
      /** Accessible name of the list. Required unless `aria-labelledby` is set. */
      'aria-label': string;
      'aria-labelledby'?: string;
    }
  | {
      'aria-label'?: string;
      /** Id of the element that names the list (a visible heading). */
      'aria-labelledby': string;
    };

export type ActionListProps = ActionListBaseProps & ActionListNaming;

function nameOf(item: ActionListItem): string {
  if (item.textValue !== undefined) return item.textValue;
  return typeof item.title === 'string' ? item.title : item.id;
}

/** How long after closing the menu we wait for React Aria to focus the row. */
const RESTORE_WINDOW_MS = 1000;

interface RowMenuProps {
  name: string;
  moreActions: (title: string) => string;
  children: ReactNode;
}

/**
 * The "more actions" menu of a row. When an overlay closes, React Aria's `GridList` moves focus to
 * the row. The menu traps focus until it unmounts, so the trigger can only be refocused after
 * that: when focus lands on the row, hand it back to the button the user pressed. Otherwise
 * Escape would drop keyboard users on the row instead of the button.
 */
function RowMenu({ name, moreActions, children }: RowMenuProps) {
  const trigger = useRef<HTMLElement | null>(null);
  return (
    <MoreActionsMenu
      size="sm"
      messages={{ moreActions: moreActions(name) }}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          trigger.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
          return;
        }
        const element = trigger.current;
        const row = element?.closest('[role="row"]');
        if (!element || !row) return;
        const stop = () => {
          document.removeEventListener('focusin', onFocusIn, true);
        };
        const onFocusIn = (event: FocusEvent) => {
          if (event.target !== row) return;
          stop();
          requestAnimationFrame(() => {
            if (element.isConnected) element.focus();
          });
        };
        document.addEventListener('focusin', onFocusIn, true);
        // The menu may close without the row being focused (pointer users): do not keep listening.
        setTimeout(stop, RESTORE_WINDOW_MS);
      }}
    >
      {children}
    </MoreActionsMenu>
  );
}

/**
 * A vertical list of records, each with a title, optional description, a mono meta value and a
 * "more actions" menu. Built on React Aria `GridList`: rows are reached with the arrow keys
 * (one tab stop for the list), `Enter` runs `onAction`, and `Tab` or the right arrow moves
 * from a row to its menu button.
 */
export function ActionList({
  items,
  onAction,
  bordered = true,
  emptyState,
  messages: overrides,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ActionListProps) {
  const t = useMessages('ActionList', messages, overrides);
  const byId = new Map(items.map((item) => [item.id, item]));
  return (
    <GridList
      {...rest}
      {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
      {...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy })}
      items={items}
      className={classNames(styles.root, className)}
      data-bordered={bordered || undefined}
      {...(onAction
        ? {
            onAction: (key: Key) => {
              const item = byId.get(String(key));
              if (item && item.isDisabled !== true) onAction(item);
            },
          }
        : {})}
      renderEmptyState={() =>
        emptyState ?? (
          <EmptyState
            compact
            bordered={false}
            headingLevel={3}
            title={t.emptyTitle}
            description={t.emptyDescription}
          />
        )
      }
    >
      {(item) => (
        <GridListItem
          id={item.id}
          textValue={nameOf(item)}
          isDisabled={item.isDisabled ?? false}
          className={classNames(styles.item)}
          data-has-action={onAction !== undefined || undefined}
        >
          {item.leading ? <span className={styles.leading}>{item.leading}</span> : null}
          <span className={styles.body}>
            <span className={styles.title}>{item.title}</span>
            {item.description ? (
              <span className={styles.description}>{item.description}</span>
            ) : null}
          </span>
          {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
          {item.actions ? (
            <span className={styles.actions}>
              <RowMenu name={nameOf(item)} moreActions={t.moreActions}>
                {item.actions}
              </RowMenu>
            </span>
          ) : null}
        </GridListItem>
      )}
    </GridList>
  );
}
