import type { ReactNode, Ref } from 'react';
import {
  Button,
  Header,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  Select as RACSelect,
  SelectValue,
} from 'react-aria-components';
import type { SelectProps as RACSelectProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
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
import { CheckIcon, ChevronDownIcon } from '../Icon/icons';
import { messages } from './Select.messages';
import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  /** Identifies the option and is the value submitted with the form. */
  value: string;
  /** Text of the option. It is also what the trigger shows once selected. */
  label: string;
  /** Not selectable, dimmed, skipped by keyboard navigation. */
  isDisabled?: boolean | undefined;
}

export interface SelectGroup {
  /** Identifies the group. */
  id: string;
  /** Caption of the group, announced as the group name. */
  label: string;
  options: readonly SelectOption[];
}

function isGroup(entry: SelectOption | SelectGroup): entry is SelectGroup {
  return 'options' in entry;
}

export type SelectMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface SelectBaseProps extends Omit<
  RACSelectProps<SelectOption>,
  | 'children'
  | 'className'
  | 'style'
  | 'items'
  | 'aria-label'
  | 'aria-labelledby'
  | 'placeholder'
  | 'selectionMode'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange'
> {
  /** The options, or groups of options. Keep the order you want users to see (see Select.md). */
  options: readonly (SelectOption | SelectGroup)[];
  /** The selected `value`; `null` means nothing is selected. Pair with `onChange`. */
  value?: string | null | undefined;
  /** The initially selected `value` when uncontrolled. */
  defaultValue?: string | null | undefined;
  /** Called with the new `value`. */
  onChange?: ((value: string | null) => void) | undefined;
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as
   * "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /** Trigger text while nothing is selected. Default from messages: "Select an option". */
  placeholder?: string | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: SelectSize | undefined;
  /**
   * Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink
   * below its content width. Off by default. In a block context the field already spans the width.
   */
  fullWidth?: boolean | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the popover that holds the options. */
  popoverClassName?: string | undefined;
  /** Message overrides for this instance: `placeholder`, `requiredMark`. */
  messages?: SelectMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type SelectProps = SelectBaseProps & FieldLabelingProps;

function renderOption(option: SelectOption) {
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
          <span className={styles.optionLabel}>{option.label}</span>
          {isSelected ? <Icon icon={CheckIcon} size="sm" className={styles.check} /> : null}
        </>
      )}
    </ListBoxItem>
  );
}

/**
 * A single-choice dropdown built on React Aria `Select`: a button that opens a listbox in a
 * popover. Keyboard: Enter, Space or the arrow keys open it; typing selects by prefix (typeahead);
 * Escape closes it and returns focus to the trigger. A hidden native `<select>` carries `name` and
 * the value into form submission and browser autofill.
 *
 * Use it for 4 or more options; for 2 to 4 prefer `RadioGroup`.
 */
export function Select({
  label,
  description,
  descriptionTone,
  errorMessage,
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  size = 'md',
  fullWidth = false,
  className,
  popoverClassName,
  messages: messageOverrides,
  ref,
  ...rest
}: SelectProps) {
  warnMissingName('Select', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('Select', messages, messageOverrides);
  return (
    <RACSelect
      {...rest}
      ref={ref}
      placeholder={placeholder ?? t.placeholder}
      data-size={size}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onChange={(key) => {
        onChange?.(key === null ? null : String(key));
      }}
      data-full-width={fullWidth || undefined}
      className={classNames(fieldStyles.root, styles.field, className)}
    >
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <Button className={classNames(fieldStyles.control, fieldStyles.row, styles.trigger)}>
        <SelectValue className={classNames(styles.value)}>
          {({ isPlaceholder, selectedText, defaultChildren }) =>
            isPlaceholder ? defaultChildren : selectedText
          }
        </SelectValue>
        <Icon icon={ChevronDownIcon} size="sm" className={styles.chevron} />
      </Button>
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
        <ListBox className={classNames(styles.listbox)}>
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
    </RACSelect>
  );
}
