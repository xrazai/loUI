import { createContext, useContext, useId } from 'react';
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import {
  Button,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
} from 'react-aria-components';
import type {
  Key,
  TagGroupProps as AriaTagGroupProps,
  TagProps as AriaTagProps,
} from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Icon, XIcon } from '../Icon';
import styles from './Tag.module.css';
import { messages } from './Tag.messages';

const InGroupContext = createContext(false);

type TagMessages = Partial<typeof messages.en>;

export interface TagProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'id' | 'onClick'
> {
  /**
   * The text of the tag. Plain text, or any node together with `textValue`.
   */
  children: ReactNode;
  /**
   * Plain-text version of the tag. Required when `children` is not a string: it names the tag
   * for screen readers and is used in the name of the remove button ("Remove {textValue}").
   */
  textValue?: string;
  /**
   * Inside a `TagGroup`: the key of the tag (used by `onRemove`, selection and `disabledKeys`).
   * Outside a group: the DOM `id`.
   */
  id?: Key;
  /** Disables the tag (inside a group: keyboard removal and selection too). */
  isDisabled?: boolean;
  /**
   * Standalone tag only: shows a remove button that calls this. Inside a `TagGroup` use the
   * group's `onRemove` instead (it also enables Backspace and Delete on the focused tag).
   */
  onRemove?: () => void;
  /** Per-instance overrides of the built-in messages. */
  messages?: TagMessages;
}

function textOf(children: ReactNode, textValue: string | undefined): string {
  if (textValue !== undefined) return textValue;
  return typeof children === 'string' || typeof children === 'number' ? String(children) : '';
}

/**
 * A mono outlined label for versions, SKUs and filters. Standalone it is static text (with an
 * optional remove button); inside a `TagGroup` it is a keyboard-navigable item that can be
 * removed with Backspace or Delete.
 */
export function Tag({
  children,
  textValue,
  id,
  isDisabled,
  onRemove,
  messages: overrides,
  className,
  ref,
  ...rest
}: TagProps) {
  const t = useMessages('Tag', messages, overrides);
  const inGroup = useContext(InGroupContext);
  const removeId = useId();
  const text = textOf(children, textValue);

  if (inGroup) {
    return (
      <AriaTag
        {...(rest as Partial<AriaTagProps>)}
        ref={ref as Ref<HTMLDivElement>}
        {...(id === undefined ? {} : { id })}
        {...(isDisabled === undefined ? {} : { isDisabled })}
        textValue={text}
        className={classNames(styles.tag, className)}
      >
        {({ allowsRemoving }) => (
          <>
            <span className={styles.text}>{children}</span>
            {allowsRemoving ? (
              <Button
                slot="remove"
                id={removeId}
                // The name of the button is its own label, not RAC's "Remove" + tag text.
                aria-labelledby={removeId}
                aria-label={t.remove(text)}
                className={classNames(styles.remove)}
              >
                <Icon icon={XIcon} size="xs" />
              </Button>
            ) : null}
          </>
        )}
      </AriaTag>
    );
  }

  return (
    <span
      {...rest}
      ref={ref}
      id={id === undefined ? undefined : String(id)}
      className={classNames(styles.tag, className)}
      aria-disabled={isDisabled || undefined}
      data-disabled={isDisabled || undefined}
      data-allows-removing={onRemove ? '' : undefined}
    >
      <span className={styles.text}>{children}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.remove}
          aria-label={t.remove(text)}
          disabled={isDisabled}
          onClick={onRemove}
        >
          <Icon icon={XIcon} size="xs" />
        </button>
      ) : null}
    </span>
  );
}

export interface TagGroupProps<T extends object = object> extends Omit<
  AriaTagGroupProps,
  'children' | 'className' | 'style' | 'render' | 'slot' | 'onRemove'
> {
  /** Visible label of the group. Without it, give the group an `aria-label` or `aria-labelledby`. */
  label?: ReactNode;
  /** Called with the keys of the tags to remove (Backspace, Delete or the remove button). Makes the tags removable. */
  onRemove?: (keys: Set<Key>) => void;
  /** Static `Tag` children, or a render function when `items` is given. */
  children: ReactNode | ((item: T) => ReactNode);
  /** Data for the render function. Each item needs an `id` (or pass `id` to the rendered `Tag`). */
  items?: Iterable<T>;
  /** Content shown when there are no tags (for example "No filters applied"). */
  renderEmptyState?: () => ReactNode;
  className?: string;
}

/**
 * A group of tags with one tab stop and arrow-key navigation. With `onRemove`, Backspace and
 * Delete remove the focused tag (or the selected tags) and every tag gets a remove button.
 * Built on React Aria `TagGroup`.
 */
export function TagGroup<T extends object>({
  label,
  children,
  items,
  renderEmptyState,
  className,
  ...rest
}: TagGroupProps<T>) {
  return (
    <InGroupContext value>
      <AriaTagGroup {...rest} className={classNames(styles.group, className)}>
        {label ? <Label className={classNames(styles.label)}>{label}</Label> : null}
        <AriaTagList
          className={classNames(styles.list)}
          {...(items === undefined ? {} : { items })}
          {...(renderEmptyState ? { renderEmptyState } : {})}
        >
          {children}
        </AriaTagList>
      </AriaTagGroup>
    </InGroupContext>
  );
}
