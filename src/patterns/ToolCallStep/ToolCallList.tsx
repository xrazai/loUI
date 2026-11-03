import type { ComponentPropsWithRef } from 'react';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './ToolCallStep.messages';
import { ToolCallStep } from './ToolCallStep';
import type { ToolCallStepProps } from './ToolCallStep';
import styles from './ToolCallStep.module.css';

export interface ToolCallListStep extends ToolCallStepProps {
  /** Stable, unique id of the step (never the index). Used as the React key. */
  stepId: string;
}

export interface ToolCallListProps extends Omit<
  ComponentPropsWithRef<'ol'>,
  'children' | 'aria-label'
> {
  /** The steps of the run, in the order they happened. */
  steps: readonly ToolCallListStep[];
  /** Accessible name of the list. Defaults to "Steps"; say which run it is ("Steps of the order check"). */
  'aria-label'?: string;
  /** Override the built-in messages for this instance (also applied to every step). */
  messages?: Partial<typeof messages.en>;
}

/**
 * The steps of a multi-step agent run as an ordered list of `ToolCallStep`. Use it under the
 * message the run belongs to; each step opens its own details.
 */
export function ToolCallList({
  steps,
  'aria-label': ariaLabel,
  messages: overrides,
  className,
  ...rest
}: ToolCallListProps) {
  const t = useMessages('ToolCallStep', messages, overrides);
  return (
    // Safari drops the list role of a list with `list-style: none`; keep it explicit.
    // eslint-disable-next-line jsx-a11y-x/no-redundant-roles
    <ol
      {...rest}
      role="list"
      aria-label={ariaLabel ?? t.listLabel}
      className={classNames(styles.list, className)}
    >
      {steps.map(({ stepId, messages: stepMessages, ...step }) => (
        <li key={stepId} className={styles.item}>
          <ToolCallStep {...step} messages={{ ...overrides, ...stepMessages }} />
        </li>
      ))}
    </ol>
  );
}
