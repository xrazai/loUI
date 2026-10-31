import type { ReactNode, Ref } from 'react';
import { CheckboxButton, CheckboxField } from 'react-aria-components';
import type { CheckboxFieldProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { FieldMessages, RequiredMark } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { Icon } from '../Icon';
import { CheckIcon, MinusIcon } from '../Icon/icons';
import styles from './Checkbox.module.css';

interface CheckboxBaseProps extends Omit<
  CheckboxFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby'
> {
  /** Secondary text under the label. Linked with `aria-describedby`, not part of the name. */
  description?: ReactNode;
  /**
   * Error text, for example "Accept the terms to continue". Shown while the checkbox is invalid
   * and the error is displayed (after a submit attempt with the default native validation).
   * Inside a `CheckboxGroup` put the error on the group instead.
   */
  errorMessage?: FieldErrorMessage;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the field root `<div>`. Use `inputRef` for the `<input>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type CheckboxProps = CheckboxBaseProps & FieldLabelingProps;

/**
 * A checkbox with a native `<input type="checkbox">` (so `name` / `value` take part in form
 * submission), an 18px box and an optional description. The whole label row is the click target.
 *
 * State props follow React Aria: `isSelected`, `defaultSelected` and `onChange(isSelected)`.
 * `isIndeterminate` is visual and semantic ("mixed") until the user toggles it.
 */
export function Checkbox({
  label,
  description,
  errorMessage,
  className,
  messages: messageOverrides,
  ref,
  ...rest
}: CheckboxProps) {
  warnMissingName('Checkbox', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  return (
    <CheckboxField
      {...rest}
      ref={ref}
      className={classNames(fieldStyles.root, styles.root, className)}
    >
      <CheckboxButton className={classNames(styles.button)}>
        {({ isSelected, isIndeterminate }) => (
          <>
            <span className={styles.box}>
              {isIndeterminate ? <Icon icon={MinusIcon} size="xs" /> : null}
              {isSelected && !isIndeterminate ? <Icon icon={CheckIcon} size="xs" /> : null}
            </span>
            {label ? (
              <span className={styles.text}>
                {label}
                {rest.isRequired ? <RequiredMark messages={messageOverrides} /> : null}
              </span>
            ) : null}
          </>
        )}
      </CheckboxButton>
      <div className={styles.messages}>
        <FieldMessages description={description} errorMessage={errorMessage} />
      </div>
    </CheckboxField>
  );
}
