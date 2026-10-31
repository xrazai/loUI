import type { ReactNode, Ref } from 'react';
import { SwitchButton, SwitchField } from 'react-aria-components';
import type { SwitchFieldProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { FieldMessages, RequiredMark } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import styles from './Switch.module.css';

export type SwitchLabelPlacement = 'start' | 'end';

interface SwitchBaseProps extends Omit<
  SwitchFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby'
> {
  /** Secondary text under the label. Linked with `aria-describedby`, not part of the name. */
  description?: ReactNode;
  /** Error text, shown while the switch is invalid and the error is displayed. */
  errorMessage?: FieldErrorMessage;
  /**
   * Where the label sits relative to the track. `start` (default): text on the leading side, track
   * on the trailing side, spread across the row, the settings-list layout. `end`: track first.
   */
  labelPlacement?: SwitchLabelPlacement | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the field root `<div>`. Use `inputRef` for the `<input>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type SwitchProps = SwitchBaseProps & FieldLabelingProps;

/**
 * An on/off setting that applies immediately. Renders a native checkbox with `role="switch"`
 * (so `name` / `value` take part in form submission), a 36x20 track and a 16px knob.
 *
 * State props follow React Aria: `isSelected`, `defaultSelected` and `onChange(isSelected)`.
 * For a choice that is confirmed later with a Save button, prefer `Checkbox`.
 */
export function Switch({
  label,
  description,
  errorMessage,
  labelPlacement = 'start',
  className,
  messages: messageOverrides,
  ref,
  ...rest
}: SwitchProps) {
  warnMissingName('Switch', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const text = label ? (
    <span className={styles.text}>
      {label}
      {rest.isRequired ? <RequiredMark messages={messageOverrides} /> : null}
    </span>
  ) : null;
  const track = (
    <span className={styles.track}>
      <span className={styles.knob} />
    </span>
  );
  return (
    <SwitchField
      {...rest}
      ref={ref}
      data-label-placement={labelPlacement}
      data-has-label={label ? true : undefined}
      className={classNames(fieldStyles.root, styles.root, className)}
    >
      <SwitchButton className={classNames(styles.button)}>
        {labelPlacement === 'start' ? (
          <>
            {text}
            {track}
          </>
        ) : (
          <>
            {track}
            {text}
          </>
        )}
      </SwitchButton>
      <div className={styles.messages}>
        <FieldMessages description={description} errorMessage={errorMessage} />
      </div>
    </SwitchField>
  );
}
