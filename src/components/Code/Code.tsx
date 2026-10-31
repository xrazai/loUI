import { useRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { useScrollable } from '../ScrollArea/useScrollable';
import { messages } from './Code.messages';
import styles from './Code.module.css';

export type CodeVariant = 'inline' | 'block';

export interface CodeProps extends ComponentPropsWithRef<'code'> {
  /**
   * `inline` (default) is a `code` element inside running text. `block` renders a `pre` with a
   * `code` inside it, keeps the whitespace, and scrolls sideways instead of wrapping.
   */
  variant?: CodeVariant;
  /**
   * Block only. Accessible name of the block when it scrolls and becomes a region. Defaults to
   * "Code" from the message catalog; say what the code is when there are several ("Request body").
   */
  'aria-label'?: string;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
}

/**
 * Monospace code: inline in a sentence, or as a block (`pre` + `code`). A block that overflows
 * becomes a keyboard stop and a labelled region so it can be scrolled without a mouse.
 * It does not highlight syntax.
 */
export function Code({
  variant = 'inline',
  className,
  messages: overrides,
  'aria-label': ariaLabel,
  ref,
  ...rest
}: CodeProps) {
  const t = useMessages('Code', messages, overrides);
  const preRef = useRef<HTMLPreElement>(null);
  const scrollable = useScrollable(preRef);
  if (variant === 'inline') {
    return (
      <code
        {...rest}
        {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
        ref={ref}
        className={classNames(styles.inline, className)}
      />
    );
  }
  return (
    <pre
      ref={preRef}
      {...(scrollable
        ? { role: 'region', tabIndex: 0, 'aria-label': ariaLabel ?? t.blockLabel }
        : {})}
      className={styles.block}
    >
      <code {...rest} ref={ref} className={classNames(styles.blockCode, className)} />
    </pre>
  );
}
