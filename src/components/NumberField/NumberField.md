# NumberField

A number input with minus and plus steppers; the successor of the handoff `Stepper`. Built on React Aria `NumberField` (`Group`, `Input`, two `Button`s in the `decrement` / `increment` slots), styled like [Input](../Input/Input.md). Task: CMP-PAT-06.

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
| `description`, `errorMessage`                                 | As in `Input`.                                                                                       |
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

## Differences from the handoff

- `Stepper` became `NumberField`: direct typing, locale parsing, press-and-hold, min/max/step, form `name`, label wiring, description and error, sizes.
- The `aria-live` on the value was dropped.
- Button labels come from messages (en "Decrease" / "Increase", pt-BR "Diminuir" / "Aumentar").
- No `role="spinbutton"` (see Accessibility); the handoff `+` and `-` keys do not step.
