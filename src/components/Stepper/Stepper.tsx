import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { CheckIcon } from '../Icon/icons';
import { Icon } from '../Icon';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './Stepper.messages';
import styles from './Stepper.module.css';

export type StepperStepState = 'complete' | 'current' | 'upcoming';
export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperStep {
  /** Stable identifier, used as the React key and passed to `onStepPress`. */
  id: string;
  /** Visible name of the step ("Choose a template"). Sentence case, a few words. */
  label: string;
  /** Optional one-line help under the label. Shown in the vertical orientation only. */
  description?: ReactNode;
}

interface StepperBaseProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-label' | 'aria-labelledby'
> {
  /** The steps, in order. */
  steps: readonly StepperStep[];
  /** Index of the current step (0-based). Steps before it are completed. */
  current: number;
  /** When `true`, the current step is completed too (the whole flow is done). */
  complete?: boolean;
  /** `horizontal` (default) or `vertical`. Horizontal collapses to markers and "Step 3 of 9" in narrow containers. */
  orientation?: StepperOrientation;
  /**
   * Makes every completed step a button that calls this with its index and the step, so people
   * can go back. The current and upcoming steps are never buttons: the flow itself (Next)
   * moves forward.
   */
  onStepPress?: (index: number, step: StepperStep) => void;
  /** Message overrides for this instance. */
  messages?: Partial<typeof messages.en>;
}

interface LabelledByText extends StepperBaseProps {
  /** Accessible name of the list ("New agent steps"). Required: name this or use `aria-labelledby`. */
  'aria-label': string;
  'aria-labelledby'?: string;
}

interface LabelledByElement extends StepperBaseProps {
  'aria-label'?: string;
  /** Id of the element that names the list. */
  'aria-labelledby': string;
}

export type StepperProps = LabelledByText | LabelledByElement;

/**
 * Progress through a multi-step flow such as a setup assistant. It is an ordered list; every
 * step states its progress as text for assistive technology ("Completed", "Current", "Not
 * started") and the current step has `aria-current="step"`. Markers and connectors are
 * decorative. Completed steps can be buttons with `onStepPress`.
 *
 * In narrow containers the horizontal orientation shows only the markers and a visible summary
 * ("Step 3 of 9"), so nine steps fit in 320 px.
 */
export function Stepper({
  steps,
  current,
  complete = false,
  orientation = 'horizontal',
  onStepPress,
  messages: overrides,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: StepperProps) {
  const t = useMessages('Stepper', messages, overrides);
  const locale = useDSLocale();
  const active = steps[current];
  return (
    <div {...rest} className={classNames(styles.root, className)} data-orientation={orientation}>
      {active ? (
        <p className={styles.summary} aria-hidden="true">
          {t.summary(formatNumber(current + 1, locale), formatNumber(steps.length, locale))}
          {': '}
          {active.label}
        </p>
      ) : null}
      <ol className={styles.list} aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
        {steps.map((step, index) => {
          const state: StepperStepState =
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
              <span className={styles.text}>
                <span className={styles.label}>
                  {step.label}
                  <VisuallyHidden> {t[state]}</VisuallyHidden>
                </span>
                {orientation === 'vertical' && step.description ? (
                  <span className={styles.description}>{step.description}</span>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={step.id} className={styles.step} data-state={state}>
              {onStepPress && state === 'complete' ? (
                <Button
                  className={classNames(styles.content)}
                  {...(index === current ? { 'aria-current': 'step' as const } : {})}
                  onPress={() => {
                    onStepPress(index, step);
                  }}
                >
                  {content}
                </Button>
              ) : (
                <span
                  className={styles.content}
                  aria-current={index === current ? 'step' : undefined}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
