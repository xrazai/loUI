import type { ComponentPropsWithRef } from 'react';
import { Button } from 'react-aria-components';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { CheckIcon } from '../Icon/icons';
import { Icon } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './StatusSteps.messages';
import styles from './StatusSteps.module.css';

export type StatusStepState = 'complete' | 'current' | 'upcoming';

export interface StatusStep {
  /** Stable identifier, used as the React key and passed to `onSelect`. */
  id: string;
  /** Visible name of the step ("Packed"). Sentence case, one or two words. */
  label: string;
}

interface StatusStepsBaseProps extends Omit<
  ComponentPropsWithRef<'ol'>,
  'children' | 'onSelect' | 'aria-label' | 'aria-labelledby'
> {
  /** The steps, in order. */
  steps: readonly StatusStep[];
  /** Index of the current step (0-based). Steps before it are complete. */
  current: number;
  /** When `true`, the current step is complete too (the whole flow is done). */
  complete?: boolean;
  /**
   * Makes every step a button. Called with the index and the step; the consumer decides
   * whether going back or skipping ahead is allowed. Reversible changes need no confirmation
   * (offer Undo).
   */
  onSelect?: (index: number, step: StatusStep) => void;
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

interface LabelledByText extends StatusStepsBaseProps {
  /** Accessible name of the list ("Order status"). Required: name this or use `aria-labelledby`. */
  'aria-label': string;
  'aria-labelledby'?: string;
}

interface LabelledByElement extends StatusStepsBaseProps {
  'aria-label'?: string;
  /** Id of the element that names the list. */
  'aria-labelledby': string;
}

export type StatusStepsProps = LabelledByText | LabelledByElement;

/**
 * A horizontal indicator of progress through a linear status flow (Draft, Packed, Shipped).
 * It is an ordered list; every step states its progress as text read by assistive technology
 * ("Completed", "Current", "Not started", from messages), and the current step has
 * `aria-current="step"`. The marker (number or check) and the connector lines are decorative.
 *
 * With `onSelect` each step becomes a real button, so the status can be changed from here.
 */
export function StatusSteps({
  steps,
  current,
  complete = false,
  onSelect,
  messages: overrides,
  className,
  ...rest
}: StatusStepsProps) {
  const t = useMessages('StatusSteps', messages, overrides);
  const locale = useDSLocale();
  return (
    <ol {...rest} className={classNames(styles.root, className)}>
      {steps.map((step, index) => {
        const state: StatusStepState =
          index < current || (complete && index === current)
            ? 'complete'
            : index === current
              ? 'current'
              : 'upcoming';
        const content = (
          <>
            <span className={styles.marker} aria-hidden="true">
              {state === 'complete' ? (
                <Icon icon={CheckIcon} size="xs" />
              ) : (
                formatNumber(index + 1, locale)
              )}
            </span>
            <span className={styles.label}>{step.label}</span>
            <VisuallyHidden> {t[state]}</VisuallyHidden>
          </>
        );
        return (
          <li key={step.id} className={styles.step} data-state={state}>
            {onSelect ? (
              <Button
                className={classNames(styles.content)}
                {...(index === current ? { 'aria-current': 'step' as const } : {})}
                onPress={() => {
                  onSelect(index, step);
                }}
              >
                {content}
              </Button>
            ) : (
              <span
                className={classNames(styles.content)}
                aria-current={index === current ? 'step' : undefined}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
