import { useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './FieldSet.module.css';

export interface FieldSetProps extends Omit<
  ComponentPropsWithRef<'fieldset'>,
  'disabled' | 'title'
> {
  /**
   * Caption of the group, required. It is the `legend`: screen readers announce it before each
   * field in the group ("Billing address, Street"). Write it in sentence case; CSS makes it a
   * mono caption.
   */
  legend: ReactNode;
  /** Optional help for the whole group, linked to the fieldset with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Disables every native control inside (inputs, selects, textareas, buttons), the way
   * `<fieldset disabled>` does: they cannot be focused or submitted and dim together.
   * Controls that are not native elements (menus, custom widgets) are not affected: disable
   * those individually.
   */
  isDisabled?: boolean;
}

/**
 * Groups related fields under a caption: a real `fieldset` with a `legend`, an optional
 * description, and disabled propagation. Use it for a set of fields that answer one question
 * (an address, notification channels), not for every section of a form.
 */
export function FieldSet({
  legend,
  description,
  isDisabled = false,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: FieldSetProps) {
  const descriptionId = useId();
  const hasDescription = description !== undefined && description !== null && description !== false;
  const describedBy =
    [ariaDescribedBy, hasDescription ? descriptionId : undefined].filter(Boolean).join(' ') ||
    undefined;
  return (
    <fieldset
      {...rest}
      disabled={isDisabled}
      aria-describedby={describedBy}
      className={classNames(styles.root, className)}
      data-disabled={isDisabled ? 'true' : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>
      {hasDescription ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
      <div className={styles.fields}>{children}</div>
    </fieldset>
  );
}
