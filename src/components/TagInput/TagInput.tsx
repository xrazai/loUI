import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { Group, Input as RACInput, TextField } from 'react-aria-components';
import type { TextFieldProps } from 'react-aria-components';
import { useControllableState } from '../../hooks';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { FieldMessages, Label } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Tag, TagGroup } from '../Tag';
import { messages } from './TagInput.messages';
import { addTags, hasDelimiter, splitEntries } from './tagInputLogic';
import styles from './TagInput.module.css';

export type TagInputSize = 'sm' | 'md' | 'lg';

export type TagInputMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface TagInputBaseProps extends Omit<
  TextFieldProps,
  | 'children'
  | 'className'
  | 'style'
  | 'render'
  | 'slot'
  | 'aria-label'
  | 'aria-labelledby'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'name'
  | 'form'
  | 'type'
  | 'inputMode'
  | 'pattern'
  | 'minLength'
  | 'maxLength'
  | 'validate'
> {
  /** The tags (controlled). Pair with `onChange`. */
  value?: readonly string[] | undefined;
  /** The initial tags (uncontrolled). */
  defaultValue?: readonly string[] | undefined;
  /** Called with the full list of tags whenever a tag is added or removed. */
  onChange?: ((tags: string[]) => void) | undefined;
  /**
   * Name used to submit the tags with a form. Each tag is submitted as its own hidden field with
   * this name (read them with `formData.getAll(name)`). The text being typed is never submitted.
   */
  name?: string | undefined;
  /** The `id` of the `<form>` the hidden fields belong to, when the field is outside it. */
  form?: string | undefined;
  /** The text in the input, not yet a tag (controlled). Pair with `onInputChange`. */
  inputValue?: string | undefined;
  /** The initial text in the input (uncontrolled). */
  defaultInputValue?: string | undefined;
  /** Called with the text of the input as the user types. */
  onInputChange?: ((text: string) => void) | undefined;
  /**
   * Characters that end a tag while typing and split pasted text. `Enter` always adds the tag,
   * and line breaks always split pasted text. Default `[',']`. Pass `[]` to use only `Enter`.
   */
  delimiters?: readonly string[] | undefined;
  /** Maximum number of tags. Trying to add another shows an error and keeps the text. */
  maxTags?: number | undefined;
  /**
   * Decides whether a tag may be added. Return a message to reject it ("Use letters and digits
   * only."); return nothing to accept it. The message is shown as the field error and read
   * aloud. It receives the trimmed text.
   */
  validateTag?: ((tag: string) => string | null | undefined) | undefined;
  /** Treat "Notebook" and "notebook" as different tags. Default: they are the same, and the second is ignored. */
  caseSensitive?: boolean | undefined;
  /** Turns the text left in the input into a tag when the input loses focus. Default `true`. */
  addOnBlur?: boolean | undefined;
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Error text from your own validation, shown while the field is invalid (`isInvalid`). The
   * messages of `validateTag` and `maxTags` take its place while they apply.
   */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the field has no tags and no text. Never a substitute for the label. */
  placeholder?: string | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. The box grows when tags wrap. */
  size?: TagInputSize | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the text `<input>`. */
  inputClassName?: string | undefined;
  /** Ref to the text `<input>`. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /**
   * Message overrides for this instance: `tagsLabel`, `added`, `addedMany`, `removed`,
   * `duplicate`, `duplicates`, `maxReached`, `requiredMark`. The remove button of a tag uses the
   * `Tag` messages.
   */
  messages?: TagInputMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type TagInputProps = TagInputBaseProps & FieldLabelingProps;

const DEFAULT_DELIMITERS: readonly string[] = [','];

interface Announcement {
  text: string;
  id: number;
}

/**
 * A text field that turns what you type into removable tags: `Enter` or a comma adds the
 * tag, pasting `a, b, c` adds three, `Backspace` on the empty input removes the last one.
 * Duplicates are ignored with a polite message; `maxTags` and `validateTag` reject with an
 * error that is read aloud.
 *
 * Built from `TagGroup` / `Tag` and React Aria `TextField`. The tags are a keyboard-navigable
 * list (one tab stop; `Shift+Tab` from the input reaches it, `Backspace` or `Delete` on a tag
 * removes it), the input is a normal text box. The value is the list of tags; with `name` each
 * tag is submitted as a hidden field.
 *
 * For choosing from known options use `Combobox`; for filters that are always visible use
 * `ToggleGroup`.
 */
export function TagInput({
  label,
  description,
  errorMessage,
  value,
  defaultValue,
  onChange,
  name,
  form,
  inputValue,
  defaultInputValue,
  onInputChange,
  delimiters = DEFAULT_DELIMITERS,
  maxTags,
  validateTag,
  caseSensitive = false,
  addOnBlur = true,
  placeholder,
  size = 'md',
  className,
  inputClassName,
  inputRef,
  messages: messageOverrides,
  ref,
  ...rest
}: TagInputProps) {
  warnMissingName('TagInput', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const locale = useDSLocale();
  const t = useMessages('TagInput', messages, messageOverrides);
  const [tags, setTags] = useControllableState<readonly string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onChange
      ? (next) => {
          onChange([...next]);
        }
      : undefined,
  });
  const [text, setText] = useControllableState<string>({
    value: inputValue,
    defaultValue: defaultInputValue ?? '',
    onChange: onInputChange,
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const focusWhenEmpty = useRef(false);
  const announcementId = useRef(0);

  const isDisabled = rest.isDisabled === true;
  const isReadOnly = rest.isReadOnly === true;
  const isEditable = !isDisabled && !isReadOnly;

  const announce = (message: string | null) => {
    announcementId.current += 1;
    setAnnouncement(message ? { text: message, id: announcementId.current } : null);
  };

  const focusInput = () => {
    controlRef.current?.querySelector('input')?.focus();
  };

  // After the last tag is removed the list disappears: keep focus in the field.
  useEffect(() => {
    if (focusWhenEmpty.current && tags.length === 0) {
      focusWhenEmpty.current = false;
      focusInput();
    }
  }, [tags.length]);

  /** Adds candidate tags. Returns true when the typed text can be cleared (nothing blocked it). */
  const commit = (entries: readonly string[]): boolean => {
    const result = addTags({
      current: tags,
      entries,
      maxTags,
      validate: validateTag,
      caseSensitive,
      locale,
    });
    if (result.added.length > 0) setTags(result.tags);
    const blocked =
      result.invalid ?? (result.hitMax && maxTags !== undefined ? t.maxReached(maxTags) : null);
    const duplicateNotice =
      result.duplicates.length === 0
        ? null
        : result.duplicates.length === 1 && result.duplicates[0] !== undefined
          ? t.duplicate(result.duplicates[0])
          : t.duplicates(result.duplicates.length);
    let addedNotice: string | null = null;
    if (result.added.length === 1 && result.added[0] !== undefined)
      addedNotice = t.added(result.added[0]);
    else if (result.added.length > 1) addedNotice = t.addedMany(result.added.length);
    setError(blocked);
    setNotice(duplicateNotice);
    announce(blocked ? null : (duplicateNotice ?? addedNotice));
    return blocked === null;
  };

  const commitText = (typed: string) => {
    if (commit([typed])) setText('');
  };

  const handleTextChange = (next: string) => {
    if (!hasDelimiter(next, delimiters)) {
      setError(null);
      setNotice(null);
      setAnnouncement(null);
      setText(next);
      return;
    }
    // A delimiter that reached the input (mobile keyboards, composition, drag and drop).
    const parts = splitEntries(next, delimiters);
    const tail = parts.pop() ?? '';
    if (commit(parts)) setText(tail);
    else
      setText(
        [...parts, tail]
          .map((part) => part.trim())
          .filter(Boolean)
          .join(' '),
      );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing || !isEditable) return;
    const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
    if (event.key === 'Enter') {
      // An empty input lets Enter submit the form, as in any text field.
      if (text.trim() === '') return;
      event.preventDefault();
      commitText(text);
    } else if (plain && delimiters.includes(event.key)) {
      event.preventDefault();
      commitText(text);
    } else if (event.key === 'Backspace' && text === '' && tags.length > 0) {
      event.preventDefault();
      const last = tags[tags.length - 1];
      setTags(tags.slice(0, -1));
      setError(null);
      setNotice(null);
      announce(last === undefined ? null : t.removed(last));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    const pasted = event.clipboardData.getData('text');
    if (!hasDelimiter(pasted, delimiters)) return;
    event.preventDefault();
    commit(splitEntries(pasted, delimiters));
  };

  const handleBlur = () => {
    if (addOnBlur && isEditable && text.trim() !== '') commitText(text);
  };

  const handleRemove = (keys: Set<string | number>) => {
    const removed = tags.filter((tag) => keys.has(tag));
    if (removed.length === 0) return;
    const next = tags.filter((tag) => !keys.has(tag));
    focusWhenEmpty.current = next.length === 0;
    setTags(next);
    setError(null);
    setNotice(null);
    const only = removed[0];
    announce(removed.length === 1 && only !== undefined ? t.removed(only) : null);
  };

  const handleControlClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as Element;
    // Clicks on the empty part of the box start typing; tags and buttons keep their own behavior.
    if (!target.closest('[role="row"], [role="gridcell"], button, input')) focusInput();
  };

  const fieldLabel = typeof label === 'string' ? label : rest['aria-label'];
  const hasError = error !== null || rest.isInvalid === true;
  const required = rest.isRequired === true;

  return (
    <TextField
      autoComplete="off"
      {...rest}
      ref={ref}
      value={text}
      onChange={handleTextChange}
      // The field is satisfied by one tag: the empty input must not block the form.
      isRequired={required && tags.length === 0}
      {...(hasError ? { isInvalid: true } : {})}
      data-size={size}
      className={classNames(fieldStyles.root, styles.root, className)}
    >
      {label ? (
        <Label isRequired={required} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <Group
        ref={controlRef}
        role="presentation"
        className={classNames(fieldStyles.control, styles.control)}
        onClick={handleControlClick}
      >
        {tags.length > 0 ? (
          <TagGroup
            aria-label={t.tagsLabel(fieldLabel)}
            className={classNames(styles.tags)}
            disabledKeys={isDisabled ? tags : []}
            {...(isEditable ? { onRemove: handleRemove } : {})}
          >
            {tags.map((tag) => (
              <Tag key={tag} id={tag}>
                {tag}
              </Tag>
            ))}
          </TagGroup>
        ) : null}
        <RACInput
          ref={inputRef}
          {...(placeholder === undefined || tags.length > 0 ? {} : { placeholder })}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          className={classNames(styles.input, inputClassName)}
        />
      </Group>
      <FieldMessages description={description} errorMessage={error ?? errorMessage} />
      {/* One live region for every message. It is visible only while a notice applies (a duplicate). */}
      <div role="status" className={styles.status} data-visible={notice ? '' : undefined}>
        {announcement ? <span key={announcement.id}>{announcement.text}</span> : null}
      </div>
      {name
        ? tags.map((tag) => (
            <input
              key={tag}
              type="hidden"
              name={name}
              value={tag}
              {...(form ? { form } : {})}
              disabled={isDisabled}
            />
          ))
        : null}
    </TextField>
  );
}
