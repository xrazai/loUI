import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import type { FocusEventHandler, KeyboardEventHandler, MouseEvent, ReactNode, Ref } from 'react';
import { Form as RACForm } from 'react-aria-components';
import type { FormProps as RACFormProps } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { messages } from './Form.messages';
import styles from './Form.module.css';
import { collectInvalidFields } from './invalidFields';
import type { InvalidField } from './invalidFields';

interface FormSummaryContextValue {
  fields: readonly InvalidField[];
  /** Incremented when the summary should take focus (a failed submit or new server errors). */
  focusRequest: number;
  /** Called by a mounted summary so the form starts watching for invalid fields. */
  register: () => () => void;
  messages: typeof messages.en;
}

const FormSummaryContext = createContext<FormSummaryContextValue | null>(null);

export interface FormProps extends Omit<
  RACFormProps,
  'className' | 'style' | 'render' | 'children' | 'validationErrors' | 'validationBehavior'
> {
  /**
   * Native validation (default) uses the browser's constraint validation: a failed submit
   * focuses the first invalid field. `aria` marks fields invalid with ARIA only and never blocks
   * the submit; use it when the server is the only validator.
   */
  validationBehavior?: 'native' | 'aria';
  /**
   * Errors from the server, keyed by the field `name`. The matching fields become invalid and
   * show the message; the first one takes focus (or the summary does, with `errorSummary`).
   * Clear them (pass `undefined`) when the user edits the field or submits again.
   */
  validationErrors?: RACFormProps['validationErrors'] | undefined;
  /**
   * Shows a `FormErrorSummary` at the top of the form. After a failed submit it takes focus and
   * lists the invalid fields as links. Default `false`. To place the summary elsewhere, leave
   * this off and render `FormErrorSummary` inside the form yourself.
   */
  errorSummary?: boolean;
  /**
   * The `id` of the `<form>`. Other elements link to it with the `form` attribute, for example
   * a submit button in a `Sheet` footer: `<Button type="submit" form="order-form">`.
   */
  id?: string;
  /**
   * Key handlers on the `<form>`. They receive every key pressed inside a field (the events
   * bubble), so a form-level shortcut such as `Ctrl+Enter` can live here. The form adds no key
   * handling of its own, so yours never replaces anything.
   */
  onKeyDown?: KeyboardEventHandler<HTMLFormElement>;
  /** Key-up handler on the `<form>`; see `onKeyDown`. */
  onKeyUp?: KeyboardEventHandler<HTMLFormElement>;
  /** Fires when focus enters the form or moves between its fields (React `focus` bubbles). */
  onFocus?: FocusEventHandler<HTMLFormElement>;
  /** Fires when focus leaves a field in the form; check `relatedTarget` to detect leaving the form. */
  onBlur?: FocusEventHandler<HTMLFormElement>;
  /** The fields and actions of the form. */
  children?: ReactNode;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  className?: string;
  /** Ref to the `<form>` element. */
  ref?: Ref<HTMLFormElement>;
}

/**
 * A form built on React Aria `Form`: native validation by default, server errors through
 * `validationErrors`, a vertical rhythm of `--ds-form-gap` between its children, and an
 * optional error summary. Fields inside inherit the form's `validationBehavior`.
 *
 * Put exactly one primary action in it, at the end ("Save changes"), and keep submit enabled:
 * a disabled submit gives no way to learn what is wrong.
 */
export function Form({
  validationBehavior = 'native',
  errorSummary = false,
  messages: overrides,
  className,
  children,
  ref,
  validationErrors,
  onSubmit,
  onReset,
  ...rest
}: FormProps) {
  const t = useMessages('Form', messages, overrides);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [summaryCount, setSummaryCount] = useState(0);
  const [fields, setFields] = useState<readonly InvalidField[]>([]);
  const [focusRequest, setFocusRequest] = useState(0);
  const watching = errorSummary || summaryCount > 0;

  const setRef = useCallback(
    (element: HTMLFormElement | null) => {
      formRef.current = element;
      if (typeof ref === 'function') ref(element);
      else if (ref) (ref as { current: HTMLFormElement | null }).current = element;
    },
    [ref],
  );

  const register = useCallback(() => {
    setSummaryCount((count) => count + 1);
    return () => {
      setSummaryCount((count) => count - 1);
    };
  }, []);

  // The summary follows the DOM: React Aria renders field errors (and clears them when an edit
  // is committed) on its own schedule, so a MutationObserver is the one reliable signal.
  const wantFocus = useRef(false);
  const recompute = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const next = collectInvalidFields(form);
    setFields((current) => {
      const same =
        current.length === next.length &&
        current.every(
          (field, index) =>
            field.element === next[index]?.element &&
            field.label === next[index].label &&
            field.message === next[index].message,
        );
      return same ? current : next;
    });
    if (wantFocus.current && next.length > 0) {
      wantFocus.current = false;
      setFocusRequest((value) => value + 1);
    }
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!watching || !form) return undefined;
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        recompute();
      });
    };
    const observer = new MutationObserver(schedule);
    observer.observe(form, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-invalid', 'aria-invalid'],
    });
    // A failed submit fires `invalid` on each invalid control (it does not bubble: capture it).
    const onInvalid = () => {
      wantFocus.current = true;
      schedule();
    };
    const onClear = () => {
      wantFocus.current = false;
      schedule();
    };
    form.addEventListener('invalid', onInvalid, true);
    form.addEventListener('reset', onClear);
    recompute();
    return () => {
      observer.disconnect();
      form.removeEventListener('invalid', onInvalid, true);
      form.removeEventListener('reset', onClear);
    };
  }, [watching, recompute]);

  // Server errors arrive after a submit: summarize them and move focus to the summary.
  const hasServerErrors =
    validationErrors !== undefined && Object.keys(validationErrors).length > 0;
  useEffect(() => {
    if (!watching || !hasServerErrors) return;
    wantFocus.current = true;
    recompute();
  }, [watching, hasServerErrors, validationErrors, recompute]);

  const context: FormSummaryContextValue = { fields, focusRequest, register, messages: t };

  return (
    <FormSummaryContext value={context}>
      <RACForm
        {...rest}
        ref={setRef}
        validationBehavior={validationBehavior}
        {...(validationErrors === undefined ? {} : { validationErrors })}
        {...(onSubmit ? { onSubmit } : {})}
        {...(onReset ? { onReset } : {})}
        className={classNames(styles.root, className)}
      >
        {errorSummary ? <FormErrorSummary /> : null}
        {children}
      </RACForm>
    </FormSummaryContext>
  );
}

export interface FormErrorSummaryProps {
  /** Class name for the summary. */
  className?: string;
}

/**
 * The error summary of a `Form`: after a failed submit (or new server errors) it takes focus,
 * is announced (`role="alert"`), says how many fields need fixing, and lists them as links that
 * move focus to the field. It renders nothing while the form is valid. Place it inside a
 * `Form`, or turn it on with the form's `errorSummary` prop.
 */
export function FormErrorSummary({ className }: FormErrorSummaryProps) {
  const context = useContext(FormSummaryContext);
  if (!context) {
    throw new Error('FormErrorSummary must be rendered inside Form.');
  }
  const { fields, focusRequest, register, messages: t } = context;
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => register(), [register]);

  const lastRequest = useRef(0);
  const visible = fields.length > 0;
  useEffect(() => {
    if (focusRequest !== lastRequest.current && visible) {
      lastRequest.current = focusRequest;
      rootRef.current?.focus();
    }
  }, [focusRequest, visible]);

  if (!visible) return null;

  const focusField = (event: MouseEvent<HTMLAnchorElement>, field: InvalidField) => {
    event.preventDefault();
    field.element.focus();
  };

  return (
    <div
      ref={rootRef}
      role="alert"
      tabIndex={-1}
      aria-labelledby={titleId}
      className={classNames(styles.summary, className)}
    >
      <p id={titleId} className={styles.summaryTitle}>
        {t.summaryTitle(fields.length)}
      </p>
      <ul className={styles.summaryList}>
        {fields.map((field, index) => (
          <li key={field.id || `${field.label}-${String(index)}`}>
            <a
              href={field.id ? `#${field.id}` : '#'}
              onClick={(event) => {
                focusField(event, field);
              }}
            >
              {field.label}
            </a>
            {field.message ? (
              <span className={styles.summaryMessage}>: {field.message}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
