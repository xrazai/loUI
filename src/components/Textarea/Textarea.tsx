import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { TextArea as RACTextArea, TextField } from 'react-aria-components';
import type { TextFieldProps } from 'react-aria-components';
import { useDSLocale, useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { formatNumber } from '../../utils/number';
import { FieldMessages, Label, type fieldMessages } from '../Field';
import type { FieldErrorMessage, FieldLabelingProps, FieldMessageTone } from '../Field';
import { continueUnhandledKeys } from '../Field/keyboard';
import { warnMissingName } from '../Field/labeling';
import fieldStyles from '../Field/Field.module.css';
import { VisuallyHidden } from '../VisuallyHidden';
import { messages } from './Textarea.messages';
import styles from './Textarea.module.css';

/** Quiet period after the last keystroke before the remaining count is announced. */
const ANNOUNCE_DELAY_MS = 1000;

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export type TextareaMessages = Partial<typeof messages.en & typeof fieldMessages.en>;

interface TextareaBaseProps extends Omit<
  TextFieldProps,
  'children' | 'className' | 'style' | 'aria-label' | 'aria-labelledby' | 'type' | 'inputMode'
> {
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as
   * "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /**
   * Text on the label line, aligned to the end (for example "Optional" or "Markdown supported").
   * It is part of the field's description for assistive technology, not of its name.
   */
  aside?: ReactNode;
  /** Text shown while the field is empty. Never a substitute for the label. */
  placeholder?: string | undefined;
  /** Visible lines before the user types. Default 3. */
  rows?: number | undefined;
  /** Whether the user can drag the corner to resize. Default `vertical`. Ignored with `autoGrow`. */
  resize?: TextareaResize | undefined;
  /** Grows with its content instead of scrolling. */
  autoGrow?: boolean | undefined;
  /**
   * Shows "used / max" on the label line and announces the remaining characters politely once
   * typing pauses. Needs `maxLength`.
   */
  showCount?: boolean | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the `<textarea>` element. */
  textareaClassName?: string | undefined;
  /** Ref to the `<textarea>` element. The `ref` prop points at the field root. */
  textareaRef?: Ref<HTMLTextAreaElement> | undefined;
  /** Message overrides for this instance: `count`, `remaining`, `over`, `requiredMark`. */
  messages?: TextareaMessages | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type TextareaProps = TextareaBaseProps & FieldLabelingProps;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Multi-line text field built on React Aria `TextField` + `TextArea`. Same contract as `Input`. */
export function Textarea({
  label,
  description,
  descriptionTone,
  errorMessage,
  aside,
  placeholder,
  rows = 3,
  resize = 'vertical',
  autoGrow = false,
  showCount = false,
  className,
  textareaClassName,
  textareaRef,
  messages: messageOverrides,
  ref,
  onKeyDown,
  ...rest
}: TextareaProps) {
  warnMissingName('Textarea', {
    label,
    'aria-label': rest['aria-label'],
    'aria-labelledby': rest['aria-labelledby'],
  });
  const t = useMessages('Textarea', messages, messageOverrides);
  const locale = useDSLocale();
  const asideId = useId();
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const { maxLength, value, defaultValue, onChange } = rest;
  const [uncontrolledLength, setUncontrolledLength] = useState((defaultValue ?? '').length);
  const length = value === undefined ? uncontrolledLength : value.length;
  const [announced, setAnnounced] = useState<number | null>(null);
  const mounted = useRef(false);

  const limit = showCount ? maxLength : undefined;
  const counting = limit !== undefined;

  // Announce the remaining characters only after the value changed, and only once typing pauses.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return undefined;
    }
    if (!counting) return undefined;
    const id = setTimeout(() => {
      setAnnounced(length);
    }, ANNOUNCE_DELAY_MS);
    return () => {
      clearTimeout(id);
    };
  }, [counting, length]);

  const resizeToContent = useCallback(() => {
    const element = localRef.current;
    if (!element || !autoGrow) return;
    // The measured height is the one value that cannot be a token: it is handed to CSS as a custom property.
    element.style.removeProperty('--textarea-height');
    const { borderTopWidth, borderBottomWidth } = getComputedStyle(element);
    const borders = Number.parseFloat(borderTopWidth) + Number.parseFloat(borderBottomWidth);
    element.style.setProperty('--textarea-height', `${String(element.scrollHeight + borders)}px`);
  }, [autoGrow]);

  useEffect(() => {
    resizeToContent();
  }, [resizeToContent, value, length]);

  useEffect(() => {
    const element = localRef.current;
    if (!autoGrow || !element || typeof ResizeObserver === 'undefined') return undefined;
    let width = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== width) {
        width = element.clientWidth;
        resizeToContent();
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [autoGrow, resizeToContent]);

  const describedBy = [aside ? asideId : undefined, rest['aria-describedby']]
    .filter(Boolean)
    .join(' ');
  const remaining = (limit ?? 0) - (announced ?? 0);
  let announcement = '';
  if (counting && announced !== null) {
    announcement = remaining >= 0 ? t.remaining(remaining) : t.over(-remaining);
  }
  const hasHeader = Boolean(label) || Boolean(aside) || counting;

  return (
    <TextField
      {...rest}
      ref={ref}
      {...(onKeyDown ? { onKeyDown: continueUnhandledKeys(onKeyDown) } : {})}
      {...(describedBy ? { 'aria-describedby': describedBy } : {})}
      onChange={(next) => {
        setUncontrolledLength(next.length);
        onChange?.(next);
      }}
      className={classNames(fieldStyles.root, className)}
    >
      {hasHeader ? (
        <div className={styles.header}>
          {label ? (
            <Label
              className={styles.label}
              isRequired={rest.isRequired}
              messages={messageOverrides}
            >
              {label}
            </Label>
          ) : null}
          {aside ? (
            <span id={asideId} className={styles.aside}>
              {aside}
            </span>
          ) : null}
          {counting ? (
            <span
              className={styles.count}
              aria-hidden="true"
              data-over={length > limit || undefined}
            >
              {t.count(formatNumber(length, locale), formatNumber(limit, locale))}
            </span>
          ) : null}
        </div>
      ) : null}
      <RACTextArea
        ref={(element) => {
          localRef.current = element;
          assignRef(textareaRef, element);
        }}
        rows={rows}
        {...(placeholder === undefined ? {} : { placeholder })}
        data-resize={autoGrow ? 'none' : resize}
        data-autogrow={autoGrow || undefined}
        className={classNames(fieldStyles.control, styles.textarea, textareaClassName)}
      />
      <FieldMessages
        description={description}
        descriptionTone={descriptionTone}
        errorMessage={errorMessage}
      />
      {counting ? (
        <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </VisuallyHidden>
      ) : null}
    </TextField>
  );
}
