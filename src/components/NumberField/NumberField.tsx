import type { ReactNode, Ref } from 'react';
import { Group, Input as RACInput, NumberField as RACNumberField } from 'react-aria-components';
import type { NumberFieldProps as RACNumberFieldProps } from 'react-aria-components';
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
import { MinusIcon, PlusIcon } from '../Icon/icons';
import { IconButton } from '../IconButton';
import { messages } from './NumberField.messages';
import styles from './NumberField.module.css';

export type NumberFieldSize = 'sm' | 'md' | 'lg';

export type NumberFieldMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface NumberFieldBaseProps extends Omit<
  RACNumberFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby' | 'render'
> {
  /** Helper text under the control, linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as
   * "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the field is empty. Never a substitute for the label. */
  placeholder?: string | undefined;
  /**
   * A unit shown after the number inside the box ("m", "kg", "pcs"). Visual only: for a spoken
   * unit use `formatOptions={{ style: 'unit', unit: 'meter' }}`, which also formats the number.
   */
  suffix?: ReactNode;
  /** Height of the box and of both stepper buttons: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: NumberFieldSize | undefined;
  /**
   * Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink
   * below its content width. Off by default. In a block context the field already spans the width.
   */
  fullWidth?: boolean | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the `<input>` element. */
  inputClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance: `decrease`, `increase`, `requiredMark`. */
  messages?: NumberFieldMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type NumberFieldProps = NumberFieldBaseProps & FieldLabelingProps;

/**
 * A number field with minus and plus steppers (the handoff `Stepper`), built on React Aria
 * `NumberField`: a text `<input>` with `aria-roledescription="Number field"` (React Aria
 * deliberately drops `role="spinbutton"`: VoiceOver cannot focus a spin button with typed
 * text). You can type a value or step it: `ArrowUp` / `ArrowDown` by `step`,
 * `PageUp` / `PageDown` like the arrows (React Aria has no larger step), `Home` / `End` to the
 * limits (when `minValue` / `maxValue` are set), the mouse wheel while focused, and press and hold on a button repeats.
 * The typed text is parsed with the locale of `DSProvider` (`1.234,5` in pt-BR) and committed on
 * blur or `Enter`; values are clamped to the limits and snapped to `step`.
 *
 * `onChange` receives a number, `NaN` while the field is empty. For money use `CurrencyInput`.
 */
export function NumberField({
  label,
  description,
  descriptionTone,
  errorMessage,
  placeholder,
  suffix,
  size = 'md',
  fullWidth = false,
  className,
  inputClassName,
  inputRef,
  messages: messageOverrides,
  ref,
  ...rest
}: NumberFieldProps) {
  warnMissingName('NumberField', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('NumberField', messages, messageOverrides);
  return (
    <RACNumberField
      {...rest}
      ref={ref}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={classNames(fieldStyles.root, styles.field, className)}
    >
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <Group className={classNames(styles.group)}>
        <IconButton slot="decrement" label={t.decrease} icon={MinusIcon} size={size} />
        <div className={classNames(fieldStyles.control, fieldStyles.row, styles.box)}>
          <RACInput
            ref={inputRef}
            {...(placeholder === undefined ? {} : { placeholder })}
            className={classNames(styles.input, inputClassName)}
          />
          {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
        </div>
        <IconButton slot="increment" label={t.increase} icon={PlusIcon} size={size} />
      </Group>
      <FieldMessages
        description={description}
        descriptionTone={descriptionTone}
        errorMessage={errorMessage}
      />
    </RACNumberField>
  );
}
