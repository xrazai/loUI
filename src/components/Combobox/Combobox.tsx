import { useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import {
  Button,
  ComboBox as RACComboBox,
  ComboBoxStateContext,
  Group,
  Header,
  Input as RACInput,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  Text,
} from 'react-aria-components';
import type { ComboBoxProps as RACComboBoxProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { matchesSearch, normalizeSearch } from '../../utils/text';
import { FieldMessages, Label } from '../Field';
import type {
  FieldErrorMessage,
  FieldLabelingProps,
  FieldMessageTone,
  fieldMessages,
} from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Icon } from '../Icon';
import { CheckIcon, ChevronDownIcon, PlusIcon } from '../Icon/icons';
import { Spinner } from '../Spinner';
import { messages } from './Combobox.messages';
import styles from './Combobox.module.css';

export type ComboboxSize = 'sm' | 'md' | 'lg';

export interface ComboboxOption {
  /** Identifies the option and is the value submitted with the form. */
  value: string;
  /** Text of the option. It is what the input shows once selected and what typing filters. */
  label: string;
  /** Second line under the label, in `--ds-text-2`. Part of the option name. */
  description?: string | undefined;
  /** Short secondary value on the right in mono type (an SKU, a count). Part of the option name. */
  meta?: string | undefined;
  /** Not selectable, dimmed, skipped by keyboard navigation. */
  isDisabled?: boolean | undefined;
  /**
   * Decoration before the label: a `Swatch`, an `Icon`, an `Avatar`. It is hidden from assistive
   * technology (`aria-hidden`), so the option name stays its text: put anything that carries
   * meaning in `label`, `description` or `meta`. While this option is selected and the input
   * shows its label, the same node also appears at the start of the input.
   */
  leading?: ReactNode;
}

export interface ComboboxGroup {
  /** Identifies the group. */
  id: string;
  /** Caption of the group, announced as the group name. */
  label: string;
  options: readonly ComboboxOption[];
}

function allOptions(entries: readonly (ComboboxOption | ComboboxGroup)[]): ComboboxOption[] {
  return entries.flatMap((entry) => (isGroup(entry) ? [...entry.options] : [entry]));
}

type ComboboxState = NonNullable<React.ContextType<typeof ComboBoxStateContext>>;

/** `id` of the "Create" row. Never reaches `onChange`. */
const CREATE_KEY = '__loui-combobox-create__';

/** Hands the React Aria combobox state to the parent (it lives below `ComboBox`). */
function StateBridge({ stateRef }: { stateRef: { current: ComboboxState | null } }) {
  const state = useContext(ComboBoxStateContext);
  useEffect(() => {
    stateRef.current = state;
  });
  return null;
}

/** The `leading` of the selected option, at the start of the input, while the input shows its label. */
function SelectedLeading({ options }: { options: readonly ComboboxOption[] }) {
  const state = useContext(ComboBoxStateContext);
  const selected = state?.value == null ? undefined : options.find((o) => o.value === state.value);
  if (!selected?.leading || state?.inputValue !== selected.label) return null;
  return (
    <span aria-hidden="true" className={styles.inputLeading}>
      {selected.leading}
    </span>
  );
}

interface CollectionNode {
  type: string;
  key: string | number;
  childNodes: Iterable<CollectionNode>;
}

/** Key of the first selectable option in the filtered collection, or null. */
function firstSelectableKey(state: ComboboxState): string | number | null {
  const visit = (nodes: Iterable<CollectionNode>): string | number | null => {
    for (const node of nodes) {
      if (node.type === 'section') {
        const found = visit(node.childNodes);
        if (found !== null) return found;
      } else if (node.type === 'item' && !state.selectionManager.isDisabled(node.key)) {
        return node.key;
      }
    }
    return null;
  };
  return visit(state.collection as Iterable<CollectionNode>);
}

function isGroup(entry: ComboboxOption | ComboboxGroup): entry is ComboboxGroup {
  return 'options' in entry;
}

export type ComboboxMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface ComboboxBaseProps extends Omit<
  RACComboBoxProps<ComboboxOption>,
  | 'children'
  | 'className'
  | 'style'
  | 'render'
  | 'items'
  | 'defaultItems'
  | 'defaultFilter'
  | 'formValue'
  | 'aria-label'
  | 'aria-labelledby'
  | 'selectionMode'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'allowsEmptyCollection'
> {
  /** The options, or groups of options. Keep the order you want users to see (see Combobox.md). */
  options: readonly (ComboboxOption | ComboboxGroup)[];
  /** The selected option `value`; `null` means nothing is selected. Pair with `onChange`. */
  value?: string | null | undefined;
  /** The initially selected `value` when uncontrolled. */
  defaultValue?: string | null | undefined;
  /** Called with the selected `value`, or `null` when the selection is cleared. */
  onChange?: ((value: string | null) => void) | undefined;
  /**
   * How options are matched against the typed text. Default: accent- and case-insensitive
   * "contains" on the label (`matchesSearch`), so `cafe` finds `Café`. Pass your own function,
   * or `false` to show `options` as given: use it when the list is loaded from a server as the
   * user types (listen to `onInputChange`, update `options`, set `isLoading` meanwhile).
   *
   * The function receives the whole option as a third argument, so you can search by a field
   * that is not the label (`option.value` as a code, `option.meta` as an SKU). Two-argument
   * functions keep working. Options that share a label are matched together: give each option
   * a distinct label when the filter looks at other fields.
   */
  filter?: false | ((label: string, query: string, option: ComboboxOption) => boolean) | undefined;
  /**
   * Press `Enter` with no option highlighted to select the first matching option (typing
   * "tri" then `Enter` picks "Trimestral"). Default `false`: the WAI-ARIA editable combobox
   * does not auto-select, so `Enter` without a highlighted option keeps the typed text (and
   * submits the surrounding form). Turn it on for lookup fields where the typed text alone is
   * never a valid value. Ignored while the list is closed, empty or has only disabled options.
   */
  selectFirstOnEnter?: boolean | undefined;
  /**
   * Turns on the "create new" row. While the typed text is not blank and matches no option label
   * (accent- and case-insensitive), the list ends with a `Create "text"` row (message
   * `createOption`). Choosing it (click, or `ArrowDown` then `Enter`) calls `onCreate` with the
   * trimmed text and does not call `onChange`; the typed text is never replaced by the row's
   * text. Add the option to `options` in the handler and set `value` to it: the input then shows
   * its label. Pair it with a controlled `value`. If the handler selects nothing, the input
   * empties when the list closes, as in any combobox without `allowsCustomValue`; with
   * `allowsCustomValue` the typed text stays as the value.
   */
  onCreate?: ((inputValue: string) => void) | undefined;
  /**
   * Shows a spinner in the box and, when there are no options yet, a "Loading" row instead of
   * "No results". The consumer owns the data: see `filter={false}` and `onInputChange`.
   */
  isLoading?: boolean | undefined;
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as
   * "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the box is empty. Never a substitute for the label. */
  placeholder?: string | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: ComboboxSize | undefined;
  /**
   * Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink
   * below its content width. Off by default. In a block context the field already spans the width.
   */
  fullWidth?: boolean | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the popover that holds the options. */
  popoverClassName?: string | undefined;
  /** Class name for the `<input>` element. */
  inputClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance: `noResults`, `loading`, `showOptions`, `createOption`, `requiredMark`. */
  messages?: ComboboxMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type ComboboxProps = ComboboxBaseProps & FieldLabelingProps;

function renderOption(option: ComboboxOption) {
  return (
    <ListBoxItem
      key={option.value}
      id={option.value}
      textValue={option.label}
      className={classNames(styles.option)}
      data-has-leading={option.leading ? true : undefined}
      {...(option.isDisabled ? { isDisabled: true } : {})}
    >
      {({ isSelected }) => (
        <>
          {option.leading ? (
            <span aria-hidden="true" className={styles.leading}>
              {option.leading}
            </span>
          ) : null}
          {/* One label element holds the label, meta and description, so the option name
              contains everything that is visible (WCAG 2.5.3); `display: contents` lets the
              spans join the option grid. */}
          <Text slot="label" className={styles.content}>
            <span className={styles.optionLabel}>{option.label}</span>
            {option.meta ? <span className={styles.meta}>{option.meta}</span> : null}
            {option.description ? (
              <span className={styles.optionDescription}>{option.description}</span>
            ) : null}
          </Text>
          {isSelected ? <Icon icon={CheckIcon} size="sm" className={styles.check} /> : null}
        </>
      )}
    </ListBoxItem>
  );
}

/**
 * A text input with a filtered list of options in a popover (ARIA combobox pattern, built on
 * React Aria `ComboBox`): the input has `role="combobox"` with `aria-expanded`,
 * `aria-controls`, `aria-autocomplete="list"` and `aria-activedescendant`, so focus stays in
 * the input while the arrow keys move through the list.
 *
 * Typing filters the options accent- and case-insensitively. `Enter` selects the highlighted
 * option, `Escape` closes the list and then restores the selected text, `ArrowDown` / `ArrowUp`
 * open the list and move, `Home` / `End` move the caret in the input (React Aria keeps them for
 * text editing). With `allowsCustomValue` the typed text itself is a valid value.
 *
 * Use it for long lists (10 or more options); for fewer prefer `Select`. `onCreate` adds a
 * `Create "text"` row for text that matches no option (see Combobox.md).
 */
export function Combobox({
  label,
  description,
  descriptionTone,
  errorMessage,
  options,
  value,
  defaultValue,
  onChange,
  filter,
  selectFirstOnEnter = false,
  onKeyDown,
  isLoading = false,
  placeholder,
  size = 'md',
  fullWidth = false,
  onCreate,
  inputValue,
  defaultInputValue,
  onInputChange,
  className,
  popoverClassName,
  inputClassName,
  inputRef,
  messages: messageOverrides,
  allowsCustomValue,
  ref,
  ...rest
}: ComboboxProps) {
  warnMissingName('Combobox', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('Combobox', messages, messageOverrides);
  const stateRef = useRef<ComboboxState | null>(null);
  const [typed, setTyped] = useState(defaultInputValue ?? '');
  const [ownValue, setOwnValue] = useState<string | null>(defaultValue ?? null);
  const flatOptions = allOptions(options);
  const currentInput = inputValue ?? typed;
  const createText = currentInput.trim();
  const showCreate =
    onCreate !== undefined &&
    !rest.isReadOnly &&
    createText !== '' &&
    !flatOptions.some((o) => normalizeSearch(o.label) === normalizeSearch(createText));
  // Without a controlled `value`, `onCreate` owns the selection here: the "Create" row is an
  // item of the collection and must never become the selected key.
  const ownsValue = value === undefined && onCreate !== undefined;
  const effectiveValue = ownsValue ? ownValue : value;
  // React Aria clears the input when a selection ends (the "Create" row selects nothing).
  // After `onCreate` the text is put back, or replaced by the label of the option the
  // handler selected, once that option is in the collection. React Aria may clear it again a
  // render later, so the correction stays active until the current task ends.
  const createdText = useRef<string | null>(null);
  useEffect(() => {
    const text = createdText.current;
    const state = stateRef.current;
    if (text === null || !state) return;
    const selected = flatOptions.find((o) => o.value === effectiveValue);
    const next = selected?.label ?? text;
    if (state.inputValue !== next) state.setInputValue(next);
  });
  let defaultFilter: (text: string, query: string) => boolean;
  if (filter === false) {
    defaultFilter = () => true;
  } else if (filter) {
    const byLabel = new Map<string, ComboboxOption[]>();
    for (const option of flatOptions) {
      byLabel.set(option.label, [...(byLabel.get(option.label) ?? []), option]);
    }
    defaultFilter = (text, query) =>
      (showCreate && text === currentInput) ||
      (byLabel.get(text) ?? []).some((option) => filter(option.label, query, option));
  } else {
    defaultFilter = (text, query) => matchesSearch(text, query);
  }
  const handleKeyDown = (event: Parameters<NonNullable<typeof onKeyDown>>[0]) => {
    // React Aria's own handler may already have prevented the default of Enter; only a
    // consumer handler that prevents it claims the key.
    const preventedBefore = event.isDefaultPrevented();
    onKeyDown?.(event);
    const claimed = !preventedBefore && event.isDefaultPrevented();
    const state = stateRef.current;
    if (
      selectFirstOnEnter &&
      event.key === 'Enter' &&
      !claimed &&
      state?.isOpen &&
      state.selectionManager.focusedKey === null
    ) {
      const key = firstSelectableKey(state);
      if (key !== null) {
        event.preventDefault();
        state.setValue(key);
        state.close();
        return;
      }
    }
    // Keep unhandled keys bubbling to page-level shortcuts (GAP-035).
    if (!event.isDefaultPrevented()) event.continuePropagation();
  };
  const hasOptions = options.some((entry) => (isGroup(entry) ? entry.options.length > 0 : true));

  return (
    <RACComboBox<ComboboxOption>
      {...rest}
      ref={ref}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-loading={isLoading || undefined}
      defaultFilter={defaultFilter}
      onKeyDown={handleKeyDown}
      allowsEmptyCollection
      {...(allowsCustomValue === undefined ? {} : { allowsCustomValue })}
      {...(inputValue === undefined ? {} : { inputValue })}
      {...(defaultInputValue === undefined ? {} : { defaultInputValue })}
      onInputChange={(text) => {
        setTyped(text);
        onInputChange?.(text);
      }}
      {...(effectiveValue === undefined ? {} : { value: effectiveValue })}
      {...(defaultValue === undefined || ownsValue ? {} : { defaultValue })}
      onChange={(key) => {
        if (key === CREATE_KEY) {
          createdText.current = currentInput;
          setTimeout(() => {
            createdText.current = null;
            // Putting the text back counts as typing, which opens the list; a chosen row closes it.
            stateRef.current?.close();
          }, 0);
          onCreate?.(createText);
          return;
        }
        const next = key === null ? null : String(key);
        if (ownsValue) setOwnValue(next);
        onChange?.(next);
      }}
      className={classNames(fieldStyles.root, styles.field, className)}
    >
      <StateBridge stateRef={stateRef} />
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <Group className={classNames(fieldStyles.control, fieldStyles.row, styles.group)}>
        <SelectedLeading options={flatOptions} />
        <RACInput
          ref={inputRef}
          {...(placeholder === undefined ? {} : { placeholder })}
          className={classNames(styles.input, inputClassName)}
        />
        {isLoading ? <Spinner size="sm" label={t.loading} className={styles.spinner} /> : null}
        <Button aria-label={t.showOptions} className={classNames(styles.trigger)}>
          <Icon icon={ChevronDownIcon} size="sm" />
        </Button>
      </Group>
      <FieldMessages
        description={description}
        descriptionTone={descriptionTone}
        errorMessage={errorMessage}
      />
      {/* RAC writes an inline z-index of 100000; the style prop is the only way to put the popover on the dropdown layer. */}
      <Popover
        className={classNames(styles.popover, popoverClassName)}
        style={{ zIndex: 'var(--ds-z-dropdown)' }}
      >
        <ListBox
          className={classNames(styles.listbox)}
          aria-busy={isLoading || undefined}
          renderEmptyState={() => (
            <div className={styles.empty}>{isLoading && !hasOptions ? t.loading : t.noResults}</div>
          )}
        >
          {options.map((entry) =>
            isGroup(entry) ? (
              <ListBoxSection key={entry.id} className={classNames(styles.section)}>
                <Header className={classNames(styles.sectionHeader)}>{entry.label}</Header>
                {entry.options.map(renderOption)}
              </ListBoxSection>
            ) : (
              renderOption(entry)
            ),
          )}
          {showCreate ? (
            <ListBoxItem
              id={CREATE_KEY}
              // The row's text is the typed text, so choosing it leaves the input as it is.
              textValue={currentInput}
              className={classNames(styles.option, styles.create)}
            >
              <Icon icon={PlusIcon} size="sm" className={styles.createIcon} />
              <Text slot="label" className={styles.createLabel}>
                {t.createOption(createText)}
              </Text>
            </ListBoxItem>
          ) : null}
        </ListBox>
      </Popover>
    </RACComboBox>
  );
}
