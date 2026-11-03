import { useRef } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode, Ref } from 'react';
import { GridList, GridListItem } from 'react-aria-components';
import type { GridListProps, Key, Selection } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { EmptyState } from '../EmptyState';
import { Checkbox } from '../Checkbox';
import { MoreActionsMenu } from '../Menu';
import { VisuallyHidden } from '../VisuallyHidden';
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
  /**
   * Marks the record as done (a completed task). The title turns `text-3` with a line-through
   * and a visually hidden "Done" is added to the row for screen readers, so the state never
   * relies on color or decoration alone. Independent of selection: with `selectionMode` the
   * consumer usually derives the selected keys from it.
   */
  isDone?: boolean;
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
  /**
   * Adds a checkbox at the start of every row. `'multiple'` toggles rows independently (the
   * checkbox toggles, the row still runs `onAction`). Default `'none'`.
   */
  selectionMode?: 'none' | 'multiple';
  /** Controlled selected row ids. Use together with `onSelectionChange`. */
  selectedKeys?: 'all' | Iterable<Key>;
  /** Initially selected row ids (uncontrolled). */
  defaultSelectedKeys?: 'all' | Iterable<Key>;
  /**
   * Called when the checkbox of a row is toggled (click, or `Space` on the focused row or
   * checkbox). The list never shows an Undo toast itself: update your state, then call
   * `toastWithUndo` (reversible toggles never ask for confirmation).
   */
  onSelectionChange?: (keys: Selection) => void;
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
 * "more actions" menu, with optional row checkboxes (`selectionMode="multiple"`). Built on React Aria `GridList`: rows are reached with the arrow keys
 * (one tab stop for the list), `Enter` runs `onAction`, and `Tab` or the right arrow moves
 * from a row to its menu button.
 */
export function ActionList({
  items,
  onAction,
  selectionMode = 'none',
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
  const isSelectable = selectionMode === 'multiple';

  // React Aria turns the row into a pure toggle as soon as one row is selected, so `onAction`
  // would stop working. With checkboxes the row action is handled here instead, and the row
  // content (not the checkbox, not the menu) never starts a selection press.
  const rowFor = (event: { target: EventTarget; currentTarget: Element }) => {
    const target = event.target instanceof Element ? event.target : null;
    const row = target?.closest<HTMLElement>('[role="row"]') ?? null;
    return row && event.currentTarget.contains(row) ? { row, target } : null;
  };
  const itemFor = (row: HTMLElement) => {
    const item = byId.get(row.getAttribute('data-key') ?? '');
    return item && item.isDisabled !== true ? item : undefined;
  };
  const isControl = (target: Element | null) =>
    target?.closest('label, button, input, a, [role="menu"]') != null;
  const actionScope =
    isSelectable && onAction
      ? {
          onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
            const hit = rowFor(event);
            if (!hit || event.key !== 'Enter' || hit.target !== hit.row) return;
            event.preventDefault();
            event.stopPropagation();
            const item = itemFor(hit.row);
            if (item) onAction(item);
          },
          onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
            const hit = rowFor(event);
            if (hit && !isControl(hit.target)) event.stopPropagation();
          },
          onClickCapture: (event: MouseEvent<HTMLElement>) => {
            const hit = rowFor(event);
            if (!hit || isControl(hit.target)) return;
            event.stopPropagation();
            const item = itemFor(hit.row);
            if (item) onAction(item);
          },
        }
      : undefined;

  const list = (
    <GridList
      {...rest}
      {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
      {...(ariaLabelledBy === undefined ? {} : { 'aria-labelledby': ariaLabelledBy })}
      items={items}
      selectionMode={selectionMode}
      selectionBehavior="toggle"
      className={classNames(styles.root, className)}
      data-bordered={bordered || undefined}
      {...(onAction && !isSelectable
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
          data-done={item.isDone || undefined}
        >
          {selectionMode === 'multiple' ? (
            <span className={styles.selection}>
              <Checkbox slot="selection" aria-label={t.select} />
            </span>
          ) : null}
          {item.leading ? <span className={styles.leading}>{item.leading}</span> : null}
          <span className={styles.body}>
            <span className={styles.title}>
              {item.title}
              {item.isDone ? <VisuallyHidden> {t.done}</VisuallyHidden> : null}
            </span>
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
  return actionScope ? (
    <div className={styles.scope} {...actionScope}>
      {list}
    </div>
  ) : (
    list
  );
}
