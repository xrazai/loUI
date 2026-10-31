import type { ReactNode, Ref } from 'react';
import { CheckboxGroup as RACCheckboxGroup } from 'react-aria-components';
import type { CheckboxGroupProps as RACCheckboxGroupProps } from 'react-aria-components';
import { classNames } from '../../utils/classNames';
import { FieldMessages, Label } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, fieldMessages } from '../Field';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import styles from './CheckboxGroup.module.css';

interface CheckboxGroupBaseProps extends Omit<
  RACCheckboxGroupProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby'
> {
  /** The `Checkbox` elements of the group. Each needs a `value`. */
  children: ReactNode;
  /** Helper text under the label. Linked with `aria-describedby`. */
  description?: ReactNode;
  /** Error text for the group, shown while it is invalid and the error is displayed. */
  errorMessage?: FieldErrorMessage;
  /** Layout of the checkboxes. Default `vertical`. */
  orientation?: 'vertical' | 'horizontal' | undefined;
  /** Class name for the group root. */
  className?: string | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the group root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type CheckboxGroupProps = CheckboxGroupBaseProps & FieldLabelingProps;

/**
 * A labelled `role="group"` of checkboxes that share one value (`string[]`), one `name`, and
 * one description and error. `value`, `defaultValue` and `onChange(values)` follow React Aria.
 */
export function CheckboxGroup({
  label,
  description,
  errorMessage,
  orientation = 'vertical',
  className,
  messages: messageOverrides,
  children,
  ref,
  ...rest
}: CheckboxGroupProps) {
  warnMissingName('CheckboxGroup', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  return (
    <RACCheckboxGroup
      {...rest}
      ref={ref}
      data-orientation={orientation}
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
    </RACCheckboxGroup>
  );
}
