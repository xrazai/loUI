import type { ReactNode, Ref } from 'react';
import {
  FieldError as RACFieldError,
  Label as RACLabel,
  Text as RACText,
} from 'react-aria-components';
import type { LabelProps as RACLabelProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './Field.messages';
import type { FieldErrorMessage } from './labeling';
import styles from './Field.module.css';

export interface LabelProps extends Omit<RACLabelProps, 'className'> {
  className?: string | undefined;
  /** Adds the required marker after the text. The control itself must also be required. */
  isRequired?: boolean | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof messages.en> | undefined;
  ref?: Ref<HTMLLabelElement> | undefined;
}

/**
 * The visible label of a field. Must be rendered inside a React Aria field (TextField, Select,
 * CheckboxGroup, RadioGroup, ...), which wires `for` / `aria-labelledby`.
 * With `isRequired` it appends a visible marker (text from messages) that is hidden from
 * assistive technology: screen readers get "required" from the control itself (`required` /
 * `aria-required`), so announcing the marker too would repeat it.
 */
export function Label({
  isRequired = false,
  className,
  children,
  messages: overrides,
  ...rest
}: LabelProps) {
  return (
    <RACLabel {...rest} className={classNames(styles.label, className)}>
      {children}
      {isRequired ? <RequiredMark messages={overrides} /> : null}
    </RACLabel>
  );
}

export interface RequiredMarkProps {
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof messages.en> | undefined;
}

/**
 * The visible marker of a required field, text from messages. Hidden from assistive technology:
 * the control announces "required" itself. Use it when a field cannot use `Label`
 * (for example inside a `Checkbox` label).
 */
export function RequiredMark({ messages: overrides }: RequiredMarkProps) {
  const t = useMessages('Field', messages, overrides);
  return (
    <span className={styles.requiredMark} aria-hidden="true">
      {t.requiredMark}
    </span>
  );
}

export interface DescriptionProps {
  children?: ReactNode;
  className?: string | undefined;
  ref?: Ref<HTMLElement> | undefined;
}

/**
 * Helper text under a field (the handoff `hint`). Linked to the control with
 * `aria-describedby` by the surrounding React Aria field. It stays visible when an error shows.
 */
export function Description({ className, ...rest }: DescriptionProps) {
  return (
    <RACText {...rest} slot="description" className={classNames(styles.description, className)} />
  );
}

export interface FieldErrorProps {
  /**
   * The message. A function receives the validation result and decides everything. A static
   * message replaces only the browser's own constraint text; an error the app supplied (a
   * `validate` rule, or `validationErrors` on a `Form`) is shown instead of it. Without
   * children, the validation errors are shown (the browser's message for native constraints).
   */
  children?: FieldErrorMessage;
  className?: string | undefined;
  ref?: Ref<HTMLElement> | undefined;
}

/**
 * Error text of a field. Renders only while the field is invalid and the error is *displayed*:
 * with the default `validationBehavior="native"` that is after a submit attempt (see Field.md).
 * The message sits in a `role="alert"` element so it is announced when it appears; on submit focus also
 * moves to the first invalid field, which reads it again through `aria-describedby`.
 */
export function FieldError({ className, children, ...rest }: FieldErrorProps) {
  return (
    <RACFieldError {...rest} className={classNames(styles.error, className)}>
      {(validation) => {
        // A static message stands in for the browser's own constraint text ("Please fill out this
        // field"). Messages the app supplied (a `validate` rule, or `validationErrors` on a
        // `Form`) are flagged `customError` and always win over it (GAP-009).
        const appMessage = validation.validationDetails.customError
          ? validation.validationErrors.join(' ')
          : '';
        const content =
          typeof children === 'function'
            ? children(validation)
            : appMessage || (children ?? validation.validationErrors.join(' '));
        // No empty live region: RAC renders nothing when the render function returns null.
        if (content === null || content === undefined || content === false || content === '') {
          return null;
        }
        return <span role="alert">{content}</span>;
      }}
    </RACFieldError>
  );
}

export interface FieldMessagesProps {
  description?: ReactNode;
  errorMessage?: FieldErrorMessage;
}

/** Description followed by the error: the footer every field renders under its control. */
export function FieldMessages({ description, errorMessage }: FieldMessagesProps) {
  const hasDescription = description !== undefined && description !== null && description !== false;
  return (
    <>
      {hasDescription ? <Description>{description}</Description> : null}
      <FieldError>{errorMessage}</FieldError>
    </>
  );
}
