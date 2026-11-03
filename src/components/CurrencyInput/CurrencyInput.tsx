import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { ClipboardEvent, FocusEvent, ReactNode, Ref } from 'react';
import type { TextFieldProps } from 'react-aria-components';
import { useDSLocale } from '../../i18n';
import { useControllableState } from '../../hooks/useControllableState';
import { classNames } from '../../utils/classNames';
import type {
  FieldErrorMessage,
  FieldLabelingProps,
  FieldMessageTone,
  fieldMessages,
} from '../Field';
import { Input } from '../Input';
import type { InputProps, InputSize } from '../Input';
import {
  MAX_SAFE_DIGITS,
  formatMinorCurrency,
  interpretPaste,
  interpretTyping,
} from './CurrencyInput.model';
import type { TypedAmount, TypingOptions } from './CurrencyInput.model';
import styles from './CurrencyInput.module.css';

interface CurrencyInputBaseProps extends Omit<
  TextFieldProps,
  | 'children'
  | 'className'
  | 'style'
  | 'aria-label'
  | 'aria-labelledby'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'name'
  | 'type'
  | 'inputMode'
  | 'pattern'
  | 'maxLength'
  | 'minLength'
  | 'validate'
  | 'autoComplete'
> {
  /**
   * ISO 4217 code of the currency (`'USD'`, `'BRL'`, `'JPY'`). It decides the number of fraction
   * digits (JPY has 0, KWD has 3), the symbol and where the locale places it.
   */
  currency: string;
  /**
   * The amount in **integer minor units** (ADR-0006): `123456` is `$1,234.56` in USD and
   * `¥123456` in JPY. `null` is an empty field (nothing entered), which is different from `0`.
   */
  value?: number | null | undefined;
  /** The initial amount when uncontrolled. Defaults to empty (`null`). */
  defaultValue?: number | null | undefined;
  /** Called with the new amount in minor units, or `null` when the field is emptied. */
  onChange?: ((minorUnits: number | null) => void) | undefined;
  /** Accepts negative amounts. Type `-` anywhere to flip the sign. Default `false`. */
  allowNegative?: boolean | undefined;
  /**
   * Most digits the amount may have, fraction digits included (`15` is the maximum, the
   * largest count that is always a safe integer). Typing beyond it is ignored. Default `15`.
   */
  maxDigits?: number | undefined;
  /**
   * Name for form submission. The form receives the **integer minor units** (`123456`), or an
   * empty string when the field is empty, never the formatted text.
   */
  name?: string | undefined;
  /** Helper text under the control. Linked with `aria-describedby`. */
  description?: ReactNode;
  /**
   * Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as
   * "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.
   */
  descriptionTone?: FieldMessageTone | undefined;
  /** Error text, shown while the field is invalid and the error is displayed. See `Input`. */
  errorMessage?: FieldErrorMessage;
  /** Text shown while the field is empty. */
  placeholder?: string | undefined;
  /** Control height: `sm` 32px, `md` 40px (default), `lg` 48px. */
  size?: InputSize | undefined;
  /** Class name for the field root. */
  className?: string | undefined;
  /** Class name for the `<input>` element. */
  inputClassName?: string | undefined;
  /** Ref to the `<input>` element. The `ref` prop points at the field root. */
  inputRef?: Ref<HTMLInputElement> | undefined;
  /** Message overrides for this instance (`requiredMark`). */
  messages?: Partial<typeof fieldMessages.en> | undefined;
  /** Ref to the field root `<div>`. */
  ref?: Ref<HTMLDivElement> | undefined;
}

export type CurrencyInputProps = CurrencyInputBaseProps & FieldLabelingProps;

/**
 * A money field. The value is an integer in minor units (ADR-0006) plus an ISO `currency`, never
 * a float. It uses the **digits-only typing model**: every digit you type shifts in from the
 * right (typing `1`, `2`, `3` gives `1.23`), separators are ignored, Backspace shifts the last
 * digit out, and the caret always stays at the end. Pasting is smarter: `12.50` and `12,50` both
 * paste as 12.50, read against the locale (see CurrencyInput.md). The box is mono and
 * right-aligned; the currency symbol is part of the text, where the locale puts it, so screen
 * readers announce it with the amount.
 *
 * The form receives the integer minor units under `name`.
 */
export function CurrencyInput({
  currency,
  value,
  defaultValue,
  onChange,
  allowNegative = false,
  maxDigits = MAX_SAFE_DIGITS,
  name,
  inputRef,
  inputClassName,
  className,
  onFocus,
  onBlur,
  ref,
  ...rest
}: CurrencyInputProps) {
  const locale = useDSLocale();
  const [amount, setAmount] = useControllableState<number | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange,
  });
  const [typedNegative, setTypedNegative] = useState(false);
  const showNegativeZero = typedNegative && amount === 0;
  const text =
    amount === null ? '' : formatMinorCurrency(amount, currency, locale, showNegativeZero);
  const options: TypingOptions = { currency, locale, allowNegative, maxDigits };

  const input = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(inputRef, () => input.current as HTMLInputElement);

  // The caret always stays at the end: digits shift in from the right, wherever you click.
  useLayoutEffect(() => {
    const element = input.current;
    if (element && document.activeElement === element) {
      element.setSelectionRange(text.length, text.length);
    }
  }, [text]);
  useEffect(() => {
    const keepCaretAtEnd = () => {
      const element = input.current;
      if (!element || document.activeElement !== element) return;
      const { selectionStart, selectionEnd, value: shown } = element;
      // A range (Ctrl+A, then Delete to clear) is allowed; a lone caret is moved to the end.
      if (selectionStart === selectionEnd && selectionStart !== shown.length) {
        element.setSelectionRange(shown.length, shown.length);
      }
    };
    document.addEventListener('selectionchange', keepCaretAtEnd);
    return () => {
      document.removeEventListener('selectionchange', keepCaretAtEnd);
    };
  }, []);

  const apply = (next: TypedAmount | undefined) => {
    if (!next) return;
    setTypedNegative(next.negativeZero);
    setAmount(next.minorUnits);
  };

  const inputProps = {
    ...rest,
    value: text,
    onChange: (typed: string) => {
      const next = interpretTyping(typed, options);
      // Backspace over a non-digit (the trailing symbol of "10,00 EUR", a group separator)
      // changes the text but not the digits: treat it as shifting the last digit out.
      if (
        next &&
        amount !== null &&
        typed.length < text.length &&
        next.minorUnits !== null &&
        Math.abs(next.minorUnits) === Math.abs(amount)
      ) {
        const shifted = Math.trunc(Math.abs(amount) / 10);
        apply({ minorUnits: amount < 0 ? -shifted : shifted, negativeZero: false });
        return;
      }
      apply(next);
    },
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData('text');
      event.preventDefault();
      apply(interpretPaste(pasted, options));
    },
    onFocus: (event: FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      const element = event.currentTarget;
      element.setSelectionRange(element.value.length, element.value.length);
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      setTypedNegative(false);
      onBlur?.(event);
    },
    mono: true,
    inputMode: allowNegative ? 'text' : 'numeric',
    autoComplete: 'off',
    inputClassName: classNames(styles.input, inputClassName),
    inputRef: input,
    className,
    ref,
  } as InputProps;

  return (
    <>
      <Input {...inputProps} />
      {name ? (
        <input
          type="hidden"
          name={name}
          value={amount === null ? '' : String(amount)}
          disabled={rest.isDisabled === true}
        />
      ) : null}
    </>
  );
}
