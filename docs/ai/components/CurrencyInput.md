# CurrencyInput

> A money field. The value is an integer in minor units (ADR-0006) plus an ISO `currency`, never
> a float. It uses the **digits-only typing model**: every digit you type shifts in from the
> right (typing `1`, `2`, `3` gives `1.23`), separators are ignored, Backspace shifts the last
> digit out, and the caret always stays at the end. Pasting is smarter: `12.50` and `12,50` both
> paste as 12.50, read against the locale (see CurrencyInput.md). The box is mono and
> right-aligned; the currency symbol is part of the text, where the locale puts it, so screen
> readers announce it with the amount.

The form receives the integer minor units under `name`.

A money field. The value is an **integer in minor units** plus an ISO 4217 `currency` (ADR-0006), never a float. Built on [Input](../Input/Input.md); the formatting comes from `Intl` through `formatCurrency`-style helpers and `parseCurrencyInput` (see `docs/architecture/utilities.md`). Task: CMP-INP-05.

- Import: `import { CurrencyInput } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/CurrencyInput/CurrencyInput.tsx`
- Stories (Storybook title `Components/CurrencyInput`): Default, Filled, WithDescription, Required, Invalid, Disabled, ReadOnly, AllowNegative, MaxDigits, Brazilian, ZeroAndThreeDigitCurrencies, Sizes, Controlled

## Props

| Prop              | Type                                     | Required | Default | Description                                                                                                                                                                     |
| ----------------- | ---------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currency`        | `string`                                 | yes      |         | ISO 4217 code of the currency (`'USD'`, `'BRL'`, `'JPY'`). It decides the number of fraction digits (JPY has 0, KWD has 3), the symbol and where the locale places it.          |
| `value`           | `number \| null`                         |          |         | The amount in **integer minor units** (ADR-0006): `123456` is `$1,234.56` in USD and `¥123456` in JPY. `null` is an empty field (nothing entered), which is different from `0`. |
| `defaultValue`    | `number \| null`                         |          |         | The initial amount when uncontrolled. Defaults to empty (`null`).                                                                                                               |
| `onChange`        | `((minorUnits: number \| null) => void)` |          |         | Called with the new amount in minor units, or `null` when the field is emptied.                                                                                                 |
| `allowNegative`   | `boolean`                                |          | `false` | Accepts negative amounts. Type `-` anywhere to flip the sign. Default `false`.                                                                                                  |
| `maxDigits`       | `number`                                 |          | `15`    | Most digits the amount may have, fraction digits included (`15` is the maximum, the largest count that is always a safe integer). Typing beyond it is ignored. Default `15`.    |
| `name`            | `string`                                 |          |         | Name for form submission. The form receives the **integer minor units** (`123456`), or an empty string when the field is empty, never the formatted text.                       |
| `description`     | `ReactNode`                              |          |         | Helper text under the control. Linked with `aria-describedby`.                                                                                                                  |
| `errorMessage`    | `FieldErrorMessage`                      |          |         | Error text, shown while the field is invalid and the error is displayed. See `Input`.                                                                                           |
| `placeholder`     | `string`                                 |          |         | Text shown while the field is empty.                                                                                                                                            |
| `size`            | `'sm' \| 'md' \| 'lg'`                   |          |         | Control height: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                                      |
| `className`       | `string`                                 |          |         | Class name for the field root.                                                                                                                                                  |
| `inputClassName`  | `string`                                 |          |         | Class name for the `<input>` element.                                                                                                                                           |
| `inputRef`        | `Ref<HTMLInputElement>`                  |          |         | Ref to the `<input>` element. The `ref` prop points at the field root.                                                                                                          |
| `messages`        | `Partial<{ requiredMark: string; }>`     |          |         | Message overrides for this instance (`requiredMark`).                                                                                                                           |
| `ref`             | `Ref<HTMLDivElement>`                    |          |         | Ref to the field root `<div>`.                                                                                                                                                  |
| `label`           | `ReactNode`                              |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                             |
| `aria-label`      | `string`                                 |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                         |
| `aria-labelledby` | `string`                                 |          |         | Id of the element that names the field.                                                                                                                                         |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaTextFieldProps` (react-aria): `aria-activedescendant`, `aria-autocomplete`, `aria-controls`, `aria-haspopup`, `enterKeyHint`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `TextFieldProps` (react-aria-components): `isInvalid`
- From `TextInputDOMEvents` (@react-types/shared): `onBeforeInput`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onCopy`, `onCut`, `onInput`, `onPaste`, `onSelect`
- From `TextInputDOMProps` (@react-types/shared): `autoCorrect`, `spellCheck`
- From `Validation` (@react-types/shared): `isRequired`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## When to use

- Prices, totals, payments, adjustments: anywhere a person types an amount of money.

## When not to use

- Quantities or measures: `NumberField`.
- Showing an amount (not editing it): `formatCurrency(minorUnits, currency, locale)` from `@loui/ds`.

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

| Prop                                                                                                                | Notes                            |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `currency`                                                                                                          | Required ISO 4217 code.          |
| `value` / `defaultValue` / `onChange`                                                                               | `number \| null` in minor units. |
| `allowNegative`, `maxDigits`                                                                                        | See above.                       |
| `label` / `aria-label` / `aria-labelledby`                                                                          | One is required.                 |
| `description`, `errorMessage`, `size`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly`, `placeholder`, `name` | As in `Input`.                   |
| `inputRef`, `ref`, `className`, `inputClassName`, `messages`                                                        | As in `Input`.                   |

## Accessibility and keyboard

A text input (`inputmode="numeric"`, or `text` with `allowNegative` so a minus can be typed on mobile) named by the label, described by the description and the error. Digits type, `Backspace` removes the last digit, `-` flips the sign when allowed. There is no live region; the value is announced as typed. The border stays 3:1 in every state (shared Input styling).

## Content rules

Label the thing being priced ("Price per meter"). The currency symbol is automatic, never part of the label. Errors say how to fix: "Enter a price above zero."

## Example

```tsx
<CurrencyInput
  label="Price per meter"
  currency="BRL"
  name="price"
  value={priceMinor}
  onChange={setPriceMinor}
/>
```

## Related components

- Instead, see NumberField: Quantities or measures: `NumberField`.
- Renders: Input
