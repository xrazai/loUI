import type { ReactNode, Ref } from 'react';
import { Input as RACInput, TextField } from 'react-aria-components';
import type { TextFieldProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { FieldMessages, Label, type fieldMessages } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, FieldMessageTone } from '../Field';
import { continueUnhandledKeys } from '../Field/keyboard';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import styles from './Input.module.css';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputBaseProps extends Omit<
  TextFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby'
> {
  /** Helper text under the control (handoff `hint`). Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as
   * "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /**
   * Error text (handoff `error`). Shown while the field is invalid *and* the error is displayed:
   * after a submit attempt with the default `validationBehavior="native"`, or at once when you
   * control `isInvalid`. A function receives the validation result.
   */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the field is empty. Never a substitute for the label. */
  placeholder?: string | undefined;
  /** Geist Mono with tabular figures, for codes, identifiers and numbers. */
  mono?: boolean | undefined;
  /** Decoration before the text, usually an `Icon`. Keep it decorative or give it its own name. */
  leading?: ReactNode;
  /** Content after the text: a unit, a shortcut hint (`Kbd`), or an `IconButton`. */
  trailing?: ReactNode;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: InputSize | undefined;
  /**
   * Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink
   * below its content width. Off by default. In a block context the field already spans the width.
   */
  fullWidth?: boolean | undefined;
  /** Class name for the field root (label, control and messages). */
  className?: string | undefined;
  /** Class name for the `<input>` element. */
  inputClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type InputProps = InputBaseProps & FieldLabelingProps;

/**
 * Single-line text field: label, control, description and error wired together
 * (`for`, `aria-describedby`, `aria-invalid`), built on React Aria `TextField`.
 *
 * Consumer `onFocus`, `onBlur`, `onKeyDown` etc. are composed with the internal handlers, so
 * they never break the focus ring (a defect of the handoff).
 */
export function Input({
  label,
  description,
  descriptionTone,
  errorMessage,
  placeholder,
  mono = false,
  leading,
  trailing,
  size = 'md',
  fullWidth = false,
  className,
  inputClassName,
  inputRef,
  messages: messageOverrides,
  ref,
  onKeyDown,
  ...rest
}: InputProps) {
  warnMissingName('Input', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  return (
    <TextField
      {...rest}
      ref={ref}
      {...(onKeyDown ? { onKeyDown: continueUnhandledKeys(onKeyDown) } : {})}
      data-size={size}
      data-full-width={fullWidth || undefined}
      className={classNames(fieldStyles.root, styles.field, className)}
    >
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <div className={classNames(fieldStyles.control, fieldStyles.row)}>
        {leading ? <span className={styles.adornmentStart}>{leading}</span> : null}
        <RACInput
          ref={inputRef}
          {...(placeholder === undefined ? {} : { placeholder })}
          data-mono={mono || undefined}
          className={classNames(styles.input, inputClassName)}
        />
        {trailing ? <span className={styles.adornmentEnd}>{trailing}</span> : null}
      </div>
      <FieldMessages
        description={description}
        descriptionTone={descriptionTone}
        errorMessage={errorMessage}
      />
    </TextField>
  );
}
