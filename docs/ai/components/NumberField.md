# NumberField

> A number field with minus and plus steppers (the handoff `Stepper`), built on React Aria
> `NumberField`: a text `<input>` with `aria-roledescription="Number field"` (React Aria
> deliberately drops `role="spinbutton"`: VoiceOver cannot focus a spin button with typed
> text). You can type a value or step it: `ArrowUp` / `ArrowDown` by `step`,
> `PageUp` / `PageDown` like the arrows (React Aria has no larger step), `Home` / `End` to the
> limits (when `minValue` / `maxValue` are set), the mouse wheel while focused, and press and hold on a button repeats.
> The typed text is parsed with the locale of `DSProvider` (`1.234,5` in pt-BR) and committed on
> blur or `Enter`; values are clamped to the limits and snapped to `step`.

`onChange` receives a number, `NaN` while the field is empty. For money use `CurrencyInput`.

A number input with minus and plus steppers; the successor of the handoff `Stepper`. Built on React Aria `NumberField` (`Group`, `Input`, two `Button`s in the `decrement` / `increment` slots), styled like [Input](../Input/Input.md). Task: CMP-PAT-06.

- Import: `import { NumberField } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/NumberField/NumberField.tsx`
- Stories (Storybook title `Components/NumberField`): Default, KeyboardContract, TypingClampsToLimits, WithSuffix, FormattedUnit, WithDescription, Required, Invalid, Disabled, ReadOnly, AtLimit, Sizes, Controlled, FullWidthInRow

## Props

| Prop              | Type                                                                           | Required | Default | Description                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------ | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`     | `ReactNode`                                                                    |          |         | Helper text under the control, linked with `aria-describedby`.                                                                                                                            |
| `descriptionTone` | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'`                  |          |         | Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it.          |
| `errorMessage`    | `FieldErrorMessage`                                                            |          |         | Error text, shown while the field is invalid and the error is displayed. See `Input`.                                                                                                     |
| `placeholder`     | `string`                                                                       |          |         | Text shown while the field is empty. Never a substitute for the label.                                                                                                                    |
| `suffix`          | `ReactNode`                                                                    |          |         | A unit shown after the number inside the box ("m", "kg", "pcs"). Visual only: for a spoken unit use `formatOptions={{ style: 'unit', unit: 'meter' }}`, which also formats the number.    |
| `size`            | `'sm' \| 'md' \| 'lg'`                                                         |          | `'md'`  | Height of the box and of both stepper buttons: `sm` 32px, `md` 40px (default), `lg` 48px.                                                                                                 |
| `fullWidth`       | `boolean`                                                                      |          | `false` | Take the free space of a flex row (an `Inline`): the field grows to fill it and can shrink below its content width. Off by default. In a block context the field already spans the width. |
| `className`       | `string`                                                                       |          |         | Class name for the field root.                                                                                                                                                            |
| `inputClassName`  | `string`                                                                       |          |         | Class name for the `<input>` element.                                                                                                                                                     |
| `inputRef`        | `Ref<HTMLInputElement>`                                                        |          |         | Ref to the `<input>` element. The `ref` prop points at the field root.                                                                                                                    |
| `messages`        | `Partial<{ decrease: string; increase: string; } & { requiredMark: string; }>` |          |         | Message overrides for this instance: `decrease`, `increase`, `requiredMark`.                                                                                                              |
| `ref`             | `Ref<HTMLDivElement>`                                                          |          |         | Ref to the field root `<div>`.                                                                                                                                                            |
| `label`           | `ReactNode`                                                                    |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                       |
| `aria-label`      | `string`                                                                       |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                   |
| `aria-labelledby` | `string`                                                                       |          |         | Id of the element that names the field.                                                                                                                                                   |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaNumberFieldProps` (react-aria): `decrementAriaLabel`, `incrementAriaLabel`, `isWheelDisabled`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `NumberFieldProps` (react-stately): `commitBehavior`, `formatOptions`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `RangeInputBase` (@react-types/shared): `maxValue`, `minValue`, `step`
- From `SlotProps` (react-aria-components): `slot`
- From `TextInputDOMEvents` (@react-types/shared): `onBeforeInput`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onCopy`, `onCut`, `onInput`, `onPaste`, `onSelect`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- From `ValueBase` (@react-types/shared): `defaultValue`, `onChange`, `value`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ NumberField: { ... } }}>`.

| Key        | English default | Notes                                          |
| ---------- | --------------- | ---------------------------------------------- |
| `decrease` | `Decrease`      | Accessible name of the "minus" stepper button. |
| `increase` | `Increase`      | Accessible name of the "plus" stepper button.  |

## Design tokens used

`--ds-field-control-padding-inline`, `--ds-font-mono`, `--ds-fs-label`, `--ds-number-field-value-min-width`, `--ds-space-1`, `--ds-text-3`

## When to use

- A bounded or unbounded count or measure that users type or nudge: quantity, length, number of copies.

## When not to use

- Money: `CurrencyInput` (integer minor units, currency formatting).
- An approximate value on a range: `Slider`.
- Digits that are an identifier (postal code, phone): `Input` with `mono`.

## Anatomy

`[ - ] [ value + suffix ] [ + ]`: three boxes of the same height (`sm` 32 / `md` 40 / `lg` 48). The middle box is the `Input` look (`--ds-line-control` border, focus ring, mono, centered); the steppers are `IconButton`s.

## Props (key ones)

| Prop                                                          | Notes                                                                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby`                    | One is required.                                                                                     |
| `value` / `defaultValue` / `onChange(value)`                  | RAC naming. `onChange` receives a `number`, `NaN` while the field is empty.                          |
| `minValue`, `maxValue`, `step`                                | Typed and stepped values are clamped and snapped to `step`.                                          |
| `formatOptions`                                               | `Intl.NumberFormat` options (`{ style: 'unit', unit: 'kilogram' }`, `{ maximumFractionDigits: 2 }`). |
| `suffix`                                                      | A visual unit after the number ("m", "pcs"). For a spoken unit use `formatOptions`.                  |
| `size`                                                        | `sm` / `md` (default) / `lg`; the steppers follow.                                                   |
| `fullWidth`                                                   | Take the free space of a flex row such as `Inline` (`flex: 1 1 auto`, can shrink). Off by default.   |
| `description`, `descriptionTone`, `errorMessage`              | As in `Input`.                                                                                       |
| `name`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly` | Standard. `name` submits the raw number (`1234.5`), not the formatted text.                          |
| `messages`                                                    | `decrease`, `increase`, `requiredMark`.                                                              |

## Accessibility and keyboard

| Key                       | Behavior                                                                  |
| ------------------------- | ------------------------------------------------------------------------- |
| `ArrowUp` / `ArrowDown`   | Step up / down                                                            |
| `PageUp` / `PageDown`     | Same as the arrows (React Aria has no larger step)                        |
| `Home` / `End`            | `minValue` / `maxValue` (only when set)                                   |
| Typing                    | Parsed with the locale (`1.234,5` in pt-BR), committed on `Enter` or blur |
| Press and hold a stepper  | Repeats (React Aria)                                                      |
| Mouse wheel while focused | Steps                                                                     |

The input is a text input with `aria-roledescription="Number field"`: React Aria deliberately does not use `role="spinbutton"` because VoiceOver cannot focus a spin button that accepts typed text. The stepper buttons are named "Decrease" / "Increase" from messages and, through `aria-labelledby`, followed by the field label ("Increase Quantity"); they are out of the tab order (the input handles the keys) and disabled at the limits. The value is not a live region (RAC announces changes).

## Content rules

Label with the noun ("Quantity"). Put the unit in `suffix` or `formatOptions`, not in the label. Error text says how to fix: "Enter a quantity between 0 and 10."

## Example

```tsx
<NumberField label="Quantity" name="quantity" defaultValue={1} minValue={1} maxValue={99} />
```

## Related components

- Instead, see CurrencyInput: Money: `CurrencyInput` (integer minor units, currency formatting).
- Instead, see Slider: An approximate value on a range: `Slider`.
- Instead, see Input: Digits that are an identifier (postal code, phone): `Input` with `mono`.
- Renders: FieldMessages, IconButton, Label
