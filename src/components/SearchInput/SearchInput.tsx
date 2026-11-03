import type { Ref } from 'react';
import {
  Button,
  ComboBox,
  Group,
  Input as RACInput,
  Label as RACLabel,
  ListBox,
  ListBoxItem,
  Popover,
  SearchField,
} from 'react-aria-components';
import type { SearchFieldProps } from 'react-aria-components';
import { useControllableState } from '../../hooks/useControllableState';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { highlightMatch, matchesSearch } from '../../utils/text';
import type { fieldMessages } from '../Field';
import type { FieldLabelingProps } from '../Field';
import { continueUnhandledKeys } from '../Field/keyboard';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Icon } from '../Icon';
import { SearchIcon, XIcon } from '../Icon/icons';
import { Kbd } from '../Kbd';
import { messages } from './SearchInput.messages';
import styles from './SearchInput.module.css';

export type SearchInputSize = 'sm' | 'md' | 'lg';

export interface SearchSuggestion {
  /** Text of the suggestion; it is matched, highlighted and put in the box when chosen. */
  label: string;
  /** Short secondary value on the right in mono type (an SKU, a count). */
  meta?: string | undefined;
  /** Anything else you need back in `onSelect`. */
  data?: unknown;
}

export type SearchInputMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface SearchInputBaseProps extends Omit<
  SearchFieldProps,
  | 'children'
  | 'className'
  | 'style'
  | 'render'
  | 'aria-label'
  | 'aria-labelledby'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'isRequired'
  | 'validate'
  | 'validationBehavior'
  | 'onSelect'
> {
  /** The text. Pair with `onChange`. */
  value?: string | undefined;
  /** The initial text when uncontrolled. */
  defaultValue?: string | undefined;
  /** Called with the new text on every keystroke and when it is cleared. */
  onChange?: ((value: string) => void) | undefined;
  /**
   * Suggestions shown under the box while typing, matched accent- and case-insensitively against
   * `label` with the matching part highlighted. Strings are shorthand for `{ label }`. Without
   * this prop the component is a plain search field (`role="searchbox"`); with it the input is a
   * combobox (`role="combobox"`). Keep the array order: it is the order shown.
   */
  suggestions?: readonly (SearchSuggestion | string)[] | undefined;
  /** Called when a suggestion is chosen (click or `Enter` on the highlighted one). */
  onSelect?: ((suggestion: SearchSuggestion) => void) | undefined;
  /** Most suggestions shown. Default `6`. */
  maxResults?: number | undefined;
  /**
   * A decorative hint of the global shortcut that focuses the search (`['Mod', 'K']`, `['/']`),
   * drawn with `Kbd` while the box is empty. It does not register the shortcut: use
   * `useHotkey` and focus `inputRef` yourself. Hidden from assistive technology, since the hint
   * is only useful when the shortcut exists; announce it with `aria-keyshortcuts` if it does.
   */
  shortcut?: readonly string[] | undefined;
  /** Text shown while the box is empty. Default from messages: "Search". */
  placeholder?: string | undefined;
  /**
   * Wraps the field in a `role="search"` landmark named by the label. Use it once per page for
   * the main search of a page or site; not for filters inside a table.
   */
  landmark?: boolean | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: SearchInputSize | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the popover that holds the suggestions. */
  popoverClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance: `clear`, `placeholder`, `noResults`. */
  messages?: SearchInputMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

/** `label` is optional here: most searches use `aria-label` and no visible label. */
export type SearchInputProps = SearchInputBaseProps & FieldLabelingProps;

interface SuggestionItem extends SearchSuggestion {
  id: string;
}

function toItems(suggestions: readonly (SearchSuggestion | string)[]): SuggestionItem[] {
  return suggestions.map((entry, index) => {
    const suggestion = typeof entry === 'string' ? { label: entry } : entry;
    return { ...suggestion, id: `${String(index)}:${suggestion.label}` };
  });
}

/**
 * A search box: leading search icon, clear button (and `Escape` clears), optional decorative
 * shortcut hint, optional suggestions with accent-insensitive match highlighting. Built on React
 * Aria `SearchField` (plain) or `ComboBox` (with `suggestions`).
 *
 * `onSubmit(text)` fires on `Enter` when no suggestion is highlighted.
 */
export function SearchInput(props: SearchInputProps) {
  warnMissingName('SearchInput', {
    label: props.label,
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
  });
  const { suggestions, onSelect, maxResults, landmark, popoverClassName, ...common } = props;
  const body = suggestions ? (
    <SuggestionsSearch
      {...common}
      suggestions={suggestions}
      {...(onSelect ? { onSelect } : {})}
      {...(maxResults === undefined ? {} : { maxResults })}
      {...(popoverClassName === undefined ? {} : { popoverClassName })}
    />
  ) : (
    <PlainSearch {...common} />
  );
  if (!landmark) return body;
  return (
    <div
      role="search"
      {...(typeof props.label === 'string' ? { 'aria-label': props.label } : {})}
      {...(props['aria-label'] ? { 'aria-label': props['aria-label'] } : {})}
      {...(props['aria-labelledby'] ? { 'aria-labelledby': props['aria-labelledby'] } : {})}
    >
      {body}
    </div>
  );
}

function Hint({ shortcut }: { shortcut: readonly string[] | undefined }) {
  if (!shortcut || shortcut.length === 0) return null;
  return (
    <span className={styles.hint} aria-hidden="true">
      <Kbd keys={shortcut} />
    </span>
  );
}

function ClearIcon() {
  return <Icon icon={XIcon} size="sm" />;
}

type CommonProps = Omit<
  SearchInputProps,
  'suggestions' | 'onSelect' | 'maxResults' | 'landmark' | 'popoverClassName'
>;

function PlainSearch({
  label,
  value,
  defaultValue,
  onChange,
  shortcut,
  placeholder,
  size = 'md',
  className,
  inputRef,
  messages: overrides,
  ref,
  onKeyDown,
  ...rest
}: CommonProps) {
  const t = useMessages('SearchInput', messages, overrides);
  return (
    <SearchField
      {...rest}
      ref={ref}
      {...(onKeyDown ? { onKeyDown: continueUnhandledKeys(onKeyDown) } : {})}
      data-size={size}
      className={classNames(fieldStyles.root, styles.root, className)}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange ? { onChange } : {})}
    >
      {label ? <RACLabel className={styles.label}>{label}</RACLabel> : null}
      <Group className={classNames(fieldStyles.control, fieldStyles.row, styles.group)}>
        <Icon icon={SearchIcon} size="sm" className={styles.icon} />
        <RACInput
          ref={inputRef}
          placeholder={placeholder ?? t.placeholder}
          className={classNames(styles.input)}
        />
        <Hint shortcut={shortcut} />
        <Button aria-label={t.clear} className={classNames(styles.clear)}>
          <ClearIcon />
        </Button>
      </Group>
    </SearchField>
  );
}

function SuggestionsSearch({
  label,
  value,
  defaultValue,
  onChange,
  onSubmit,
  onClear,
  onSelect,
  suggestions,
  maxResults = 6,
  shortcut,
  placeholder,
  size = 'md',
  className,
  popoverClassName,
  inputRef,
  messages: overrides,
  ref,
  autoFocus,
  isDisabled,
  isReadOnly,
  name,
  ...rest
}: CommonProps & {
  suggestions: readonly (SearchSuggestion | string)[];
  onSelect?: ((suggestion: SearchSuggestion) => void) | undefined;
  maxResults?: number | undefined;
  popoverClassName?: string | undefined;
}) {
  const t = useMessages('SearchInput', messages, overrides);
  const [text, setText] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange,
  });
  const query = text.trim();
  const items = query
    ? toItems(suggestions)
        .filter((item) => matchesSearch(item.label, query))
        .slice(0, Math.max(1, maxResults))
    : [];
  return (
    <ComboBox<SuggestionItem>
      ref={ref}
      {...(rest['aria-label'] ? { 'aria-label': rest['aria-label'] } : {})}
      {...(rest['aria-labelledby'] ? { 'aria-labelledby': rest['aria-labelledby'] } : {})}
      data-size={size}
      data-empty={text === '' || undefined}
      className={classNames(fieldStyles.root, styles.root, className)}
      items={items}
      allowsCustomValue
      allowsEmptyCollection
      inputValue={text}
      onInputChange={setText}
      menuTrigger="input"
      {...(autoFocus === undefined ? {} : { autoFocus })}
      {...(isDisabled === undefined ? {} : { isDisabled })}
      {...(isReadOnly === undefined ? {} : { isReadOnly })}
      {...(name === undefined ? {} : { name })}
      onChange={(key) => {
        const chosen = items.find((item) => item.id === key);
        if (chosen) onSelect?.({ label: chosen.label, meta: chosen.meta, data: chosen.data });
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && text !== '') {
          // Second Escape (list already closed) clears, like SearchField.
          if (!document.querySelector('[role="listbox"]')) {
            setText('');
            onClear?.();
          }
        }
        if (event.key === 'Enter' && !document.querySelector('[role="option"][data-focused]')) {
          onSubmit?.(text);
        }
      }}
    >
      {label ? <RACLabel className={styles.label}>{label}</RACLabel> : null}
      <Group className={classNames(fieldStyles.control, fieldStyles.row, styles.group)}>
        <Icon icon={SearchIcon} size="sm" className={styles.icon} />
        <RACInput
          ref={inputRef}
          placeholder={placeholder ?? t.placeholder}
          className={classNames(styles.input)}
        />
        <Hint shortcut={shortcut} />
        <Button
          aria-label={t.clear}
          className={classNames(styles.clear)}
          excludeFromTabOrder
          onPress={() => {
            setText('');
            onClear?.();
          }}
        >
          <ClearIcon />
        </Button>
      </Group>
      {/* RAC writes an inline z-index of 100000; the style prop is the only way to put the popover on the dropdown layer. */}
      <Popover
        className={classNames(styles.popover, popoverClassName)}
        style={{ zIndex: 'var(--ds-z-dropdown)' }}
      >
        <ListBox
          className={classNames(styles.listbox)}
          renderEmptyState={() => <div className={styles.empty}>{t.noResults}</div>}
        >
          {(item: SuggestionItem) => (
            <ListBoxItem id={item.id} textValue={item.label} className={classNames(styles.option)}>
              <span className={styles.optionLabel}>
                {highlightMatch(item.label, text).map((segment, index) =>
                  segment.match ? (
                    <mark key={index} className={styles.mark}>
                      {segment.text}
                    </mark>
                  ) : (
                    segment.text
                  ),
                )}
              </span>
              {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}
