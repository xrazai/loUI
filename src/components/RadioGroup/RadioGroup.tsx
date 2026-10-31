import type { ReactNode, Ref } from 'react';
import { RadioButton, RadioField, RadioGroup as RACRadioGroup } from 'react-aria-components';
import type { RadioFieldProps, RadioGroupProps as RACRadioGroupProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { FieldMessages, Label } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import styles from './RadioGroup.module.css';
import { Description } from '../Field';

interface RadioGroupBaseProps extends Omit<
  RACRadioGroupProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby'
> {
  /** The `Radio` elements of the group. */
  children: ReactNode;
  /** Helper text under the label. Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Error text for the group, shown while it is invalid and the error is displayed (after a
   * submit attempt with the default native validation, or at once with `isInvalid`).
   */
  errorMessage?: FieldErrorMessage;
  /** Layout of the options. Default `vertical`; arrow keys follow the reading direction either way. */
  orientation?: 'vertical' | 'horizontal';
  /** Class name for the group root. */
  className?: string | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the group root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type RadioGroupProps = RadioGroupBaseProps & FieldLabelingProps;

/**
 * A labelled `role="radiogroup"` of mutually exclusive options with native radio inputs.
 * The group is one tab stop; arrow keys move and select (roving focus is handled by React Aria).
 * `value`, `defaultValue` and `onChange(value)` follow React Aria; `name` is shared by every radio.
 * A group needs a name: pass `label`, `aria-label` or `aria-labelledby`.
 */
export function RadioGroup({
  label,
  description,
  errorMessage,
  orientation = 'vertical',
  className,
  messages: messageOverrides,
  children,
  ref,
  ...rest
}: RadioGroupProps) {
  warnMissingName('RadioGroup', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  return (
    <RACRadioGroup
      {...rest}
      ref={ref}
      orientation={orientation}
      className={classNames(fieldStyles.root, className)}
    >
      {label ? (
        <Label isRequired={rest.isRequired} messages={messageOverrides}>
          {label}
        </Label>
      ) : null}
      <div className={styles.items} data-orientation={orientation}>
        {children}
      </div>
      <FieldMessages description={description} errorMessage={errorMessage} />
    </RACRadioGroup>
  );
}

interface RadioBaseProps extends Omit<
  RadioFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby'
> {
  /** Secondary text under the label. Linked with `aria-describedby`, not part of the name. */
  description?: ReactNode;
  /** Class name for the option root. */
  className?: string | undefined;
  /** Ref to the option root `<div>`. Use `inputRef` for the `<input>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type RadioProps = RadioBaseProps & FieldLabelingProps;

/** One option of a `RadioGroup`. `value` is required and identifies the option. */
export function Radio({ label, description, className, ref, ...rest }: RadioProps) {
  warnMissingName('Radio', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  return (
    <RadioField {...rest} ref={ref} className={classNames(styles.radio, className)}>
      <RadioButton className={classNames(styles.button)}>
        <span className={styles.circle}>
          <span className={styles.dot} />
        </span>
        {label ? <span className={styles.text}>{label}</span> : null}
      </RadioButton>
      {description ? (
        <div className={styles.messages}>
          <Description>{description}</Description>
        </div>
      ) : null}
    </RadioField>
  );
}
