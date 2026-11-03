import { useContext, useEffect, useRef } from 'react';
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
import { matchesSearch } from '../../utils/text';
import { FieldMessages, Label } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Icon } from '../Icon';
import { CheckIcon, ChevronDownIcon } from '../Icon/icons';
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

/** Hands the React Aria combobox state to the parent (it lives below `ComboBox`). */
function StateBridge({ stateRef }: { stateRef: { current: ComboboxState | null } }) {
  const state = useContext(ComboBoxStateContext);
  useEffect(() => {
    stateRef.current = state;
  });
  return null;
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
   * Shows a spinner in the box and, when there are no options yet, a "Loading" row instead of
   * "No results". The consumer owns the data: see `filter={false}` and `onInputChange`.
   */
  isLoading?: boolean | undefined;
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the box is empty. Never a substitute for the label. */
  placeholder?: string | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: ComboboxSize | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the popover that holds the options. */
  popoverClassName?: string | undefined;
  /** Class name for the `<input>` element. */
  inputClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance: `noResults`, `loading`, `showOptions`, `requiredMark`. */
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
      {...(option.isDisabled ? { isDisabled: true } : {})}
    >
      {({ isSelected }) => (
        <>
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
 * Use it for long lists (10 or more options); for fewer prefer `Select`.
 */
export function Combobox({
  label,
  description,
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
  let defaultFilter: (text: string, query: string) => boolean;
  if (filter === false) {
    defaultFilter = () => true;
  } else if (filter) {
    const byLabel = new Map<string, ComboboxOption[]>();
    for (const option of allOptions(options)) {
      byLabel.set(option.label, [...(byLabel.get(option.label) ?? []), option]);
    }
    defaultFilter = (text, query) =>
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
      data-loading={isLoading || undefined}
      defaultFilter={defaultFilter}
      onKeyDown={handleKeyDown}
      allowsEmptyCollection
      {...(allowsCustomValue === undefined ? {} : { allowsCustomValue })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onChange={(key) => {
        onChange?.(key === null ? null : String(key));
      }}
      className={classNames(fieldStyles.root, className)}
    >
      <StateBridge stateRef={stateRef} />
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <Group className={classNames(fieldStyles.control, fieldStyles.row, styles.group)}>
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
      <FieldMessages description={description} errorMessage={errorMessage} />
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
        </ListBox>
      </Popover>
    </RACComboBox>
  );
}
