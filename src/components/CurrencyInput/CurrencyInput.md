# CurrencyInput

A money field. The value is an **integer in minor units** plus an ISO 4217 `currency` (ADR-0006), never a float. Built on [Input](../Input/Input.md); the formatting comes from `Intl` through `formatCurrency`-style helpers and `parseCurrencyInput` (see `docs/architecture/utilities.md`). Task: CMP-INP-05.

## When to use

- Prices, totals, payments, adjustments: anywhere a person types an amount of money.
- Editing a price inline, in place of its text in a table row or list (see the `InlinePriceEdit` recipe).

## When not to use

- Quantities or measures: `NumberField`.
- Showing an amount (not editing it): `formatCurrency(minorUnits, currency, locale)` from `loui-ds`.

## Editing model: digits shift in from the right (decision)

Two models were considered:

1. **React Aria `NumberField` with `style: 'currency'`**. Reuses its parsing and stepping, but its editing model is "type a number, format on blur": locale decimal marks must be typed, the caret and text change on blur, and the value is a JS `number` in major units, so every boundary needs `Math.round(x * 100)` and float drift (`0.1 + 0.2`) becomes a bug source. Money in the handoff is also typed without separators.
2. **Digits-only typing** (the handoff model, implemented by `parseCurrencyInput`). Typing `1`, `2`, `3` gives `$1.23`; `1`, `2`, `3`, `4`, `5`, `6` gives `$1,234.56`. Separators and symbols are ignored, `Backspace` shifts the last digit out, the caret always stays at the end. The state is an integer from the first keystroke to the form value, so there is no floating point anywhere; the same code serves JPY (0 digits) and KWD (3 digits); no locale decimal mark has to be known to type.

**Decision: digits-only typing**, with a smarter **paste** (below). The trade-off: a person who types `12.5` gets `$1.25`, not `$12.50`. That is the point of the model (type `1250`), the field always shows what it will submit, and paste covers the decimal-writing habit.

## Behavior

- `value` / `defaultValue` / `onChange` are **integer minor units** or `null` (empty, which is not `0`). `onChange` receives `null` when the field is emptied (select all, then `Delete`).
- Display: the currency's own format with the symbol where the locale puts it (`$1,234.56`, `R$ 1.234,56`, `1.234,56 €`, `¥1,234`), mono, tabular, right-aligned. The symbol is part of the text, so screen readers announce it with the amount.
- Caret: always moved to the end after every edit and whenever you click or arrow into the text. A range selection (Ctrl+A) is allowed so you can clear the field.
- `allowNegative`: type `-` anywhere to flip the sign; a lone `-` shows `-$0.00` (negative zero) and the next digit keeps the sign. Without it, minus signs are ignored.
- `maxDigits` (default and maximum 15, the largest count that is always a safe integer): typing beyond it is ignored. Large amounts are exact (`$9,999,999,999,999.99` is `999999999999999`).
- **Paste** reads the text against the locale: `12.50` and `12,50` both paste as 12.50; `1,234.56` in en-US and `1.234,56` in pt-BR are grouped thousands; a lone separator followed by exactly three digits is a thousands group (`1.234` is 1234 in pt-BR but 1.23 in en-US because `.` is the en-US decimal mark); extra fraction digits are rounded half up; symbols and spaces are dropped; text without digits is ignored.
- **Form**: `name` submits the **integer minor units** (`123456`) or an empty string, through a hidden input; it is not sent while the field is disabled. The visible text is never submitted.

## Props (key ones)

| Prop                                                                                                                                   | Notes                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `currency`                                                                                                                             | Required ISO 4217 code.                                                                            |
| `value` / `defaultValue` / `onChange`                                                                                                  | `number \| null` in minor units.                                                                   |
| `allowNegative`, `maxDigits`                                                                                                           | See above.                                                                                         |
| `label` / `aria-label` / `aria-labelledby`                                                                                             | One is required.                                                                                   |
| `description`, `descriptionTone`, `errorMessage`, `size`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly`, `placeholder`, `name` | As in `Input`.                                                                                     |
| `placeholder`                                                                                                                          | Shown while `value` is `null`, also while focused, until the first digit is typed.                 |
| `fullWidth`                                                                                                                            | Take the free space of a flex row such as `Inline` (`flex: 1 1 auto`, can shrink). Off by default. |
| `onKeyDown`, `onFocus`, `onBlur`                                                                                                       | Event handlers, composed with the internal ones (see below).                                       |
| `inputRef`, `ref`, `className`, `inputClassName`, `messages`                                                                           | As in `Input`.                                                                                     |

## Accessibility and keyboard

A text input (`inputmode="numeric"`, or `text` with `allowNegative` so a minus can be typed on mobile) named by the label, described by the description and the error. Digits type, `Backspace` removes the last digit, `-` flips the sign when allowed. There is no live region; the value is announced as typed. The border stays 3:1 in every state (shared Input styling).

Hotkeys: A consumer `onKeyDown` does not hide keys from `useHotkeys(..., { allowInEditable: true })` shortcuts: a key keeps bubbling unless your handler called `event.preventDefault()` on it. Recipe: `Enter` confirms and `Escape` cancels (both with `preventDefault()`), every other key stays a hotkey. See `docs/architecture/hotkeys.md`.

## Events: `onKeyDown`, `onFocus`, `onBlur`

These come from the underlying text field and are **composed** with the internal handlers, never replaced:

- `onKeyDown`: runs for every key. A key your handler does not `preventDefault()` keeps bubbling to `useHotkeys` shortcuts and still types a digit. Call `preventDefault()` for the keys you take (`Enter`, `Escape`).
- `onFocus`: your handler runs first, then the caret moves to the end of the text.
- `onBlur`: your handler runs after the field resets a lone `-` (negative zero). `onChange` has already delivered the last typed value, so a blur handler may confirm it.

Inline price editing (`Enter` confirms, `Escape` cancels, blur confirms) is the recipe `inline-price-edit`.

## Placeholder

While `value` is `null` the box is empty and shows `placeholder` in `--ds-text-3`, focused or not. It disappears with the first digit and returns when the field is emptied again (select all, then `Delete`). `0` is a value, not empty: it shows `$0.00`. Use the placeholder for a hint such as an inherited price, never as the label.

## Content rules

Label the thing being priced ("Price per unit"). The currency symbol is automatic, never part of the label. Errors say how to fix: "Enter a price above zero."

## Example

```tsx
<CurrencyInput
  label="Price per unit"
  currency="BRL"
  name="price"
  value={priceMinor}
  onChange={setPriceMinor}
/>
```

## Differences from the handoff

- The value is integer minor units (the handoff used a `number` in major units), the currency is an ISO code (the handoff took a `"R$"` string), and the format comes from `Intl` (the handoff hard-coded `pt-BR`).
- Negative amounts, `maxDigits`, paste handling, `null`, caret stability, form submission of the integer, description and error, and sizes are new.
