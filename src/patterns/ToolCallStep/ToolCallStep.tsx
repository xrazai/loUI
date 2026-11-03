import { useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button as AriaButton, Disclosure, DisclosurePanel, Heading } from 'react-aria-components';

import { Code } from '../../components/Code';
import { Icon } from '../../components/Icon';
import { ChevronDownIcon, CircleCheckIcon, CircleXIcon } from '../../components/Icon/icons';
import { Spinner } from '../../components/Spinner';
import { VisuallyHidden } from '../../components/VisuallyHidden';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { messages } from './ToolCallStep.messages';
import styles from './ToolCallStep.module.css';

export type ToolCallStatus = 'running' | 'succeeded' | 'failed';

export interface ToolCallStepProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'title' | 'onChange'
> {
  /** Name of the tool or step ("search_orders"). Shown in mono; it is the name of the details button. */
  name: string;
  /** `running` (spinner), `succeeded` or `failed`. The status is always shown as text next to its icon. */
  status: ToolCallStatus;
  /** How long the step took, in milliseconds. Omit while it is running. */
  durationMs?: number;
  /**
   * What the tool was called with. A string is shown in a code block; pass nodes for anything
   * richer. With `input` or `output` the step gets a details button.
   */
  input?: ReactNode;
  /** What the tool returned, or the error text when `status` is `failed`. Same rules as `input`. */
  output?: ReactNode;
  /** Controlled state of the details. */
  isExpanded?: boolean;
  /** Initial state of the details when uncontrolled. Default closed. */
  defaultExpanded?: boolean;
  /** Called when the details open or close. */
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Heading level of the step header (`h1` to `h6`). Default `4`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override the built-in messages for this instance. */
  messages?: Partial<typeof messages.en>;
}

const STATUS_ICON = { succeeded: CircleCheckIcon, failed: CircleXIcon } as const;

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== '';
}

function useDuration(durationMs: number | undefined): string | undefined {
  const locale = useDSLocale();
  if (durationMs === undefined) return undefined;
  return durationMs < 1000
    ? `${formatNumber(Math.round(durationMs), locale)} ms`
    : `${formatNumber(durationMs / 1000, locale, { maximumFractionDigits: 1 })} s`;
}

/**
 * One step of an agent run: the tool it called, whether it is running, succeeded or failed, how
 * long it took and, on request, what went in and out.
 *
 * With `input` or `output` the header is a button that opens the details (`aria-expanded`,
 * `aria-controls`), inside a heading so the steps appear in the outline. Without them it is
 * plain text. The status is text plus an icon, never color alone. When a running step finishes,
 * a polite live region says so once; a step that is already finished on first render is silent.
 */
export function ToolCallStep({
  name,
  status,
  durationMs,
  input,
  output,
  isExpanded,
  defaultExpanded = false,
  onExpandedChange,
  headingLevel = 4,
  messages: overrides,
  className,
  ...rest
}: ToolCallStepProps) {
  const t = useMessages('ToolCallStep', messages, overrides);
  const duration = useDuration(durationMs);
  // Adjusting state while rendering (not in an effect): a running step that finishes is news,
  // a step that renders already finished is not.
  const [previous, setPrevious] = useState(status);
  const [finished, setFinished] = useState<ToolCallStatus | null>(null);
  if (previous !== status) {
    setPrevious(status);
    setFinished(previous === 'running' && status !== 'running' ? status : null);
  }
  const announcement =
    finished === null
      ? ''
      : finished === 'failed'
        ? t.finishedFailed(name)
        : t.finishedSucceeded(name);

  const statusText = t[status];
  const header = (
    <>
      <span className={styles.status} data-status={status}>
        {status === 'running' ? (
          <Spinner size="sm" decorative />
        ) : (
          <Icon icon={STATUS_ICON[status]} size="sm" />
        )}
        <span>{statusText}</span>
      </span>{' '}
      <span className={styles.name}>{name}</span>
      {duration ? (
        <>
          {' '}
          <span className={styles.duration}>{duration}</span>
        </>
      ) : null}
    </>
  );

  const hasDetails = hasContent(input) || hasContent(output);
  const outputLabel = status === 'failed' ? t.error : t.output;

  function block(content: ReactNode, label: string) {
    return (
      <div className={styles.block}>
        <span className={styles.label}>{label}</span>
        {typeof content === 'string' ? (
          <Code variant="block" aria-label={label}>
            {content}
          </Code>
        ) : (
          content
        )}
      </div>
    );
  }

  return (
    <div {...rest} className={classNames(styles.root, className)} data-status={status}>
      {hasDetails ? (
        <Disclosure
          className={classNames(styles.disclosure)}
          {...(isExpanded === undefined ? {} : { isExpanded })}
          defaultExpanded={defaultExpanded}
          {...(onExpandedChange ? { onExpandedChange } : {})}
        >
          <Heading level={headingLevel} className={classNames(styles.heading)}>
            <AriaButton slot="trigger" className={classNames(styles.trigger)}>
              <Icon icon={ChevronDownIcon} size="sm" className={styles.chevron} />
              {header}
            </AriaButton>
          </Heading>
          <DisclosurePanel>
            <div className={styles.details}>
              {hasContent(input) ? block(input, t.input) : null}
              {hasContent(output) ? block(output, outputLabel) : null}
            </div>
          </DisclosurePanel>
        </Disclosure>
      ) : (
        <div className={styles.static}>{header}</div>
      )}
      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
