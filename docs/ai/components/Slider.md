# Slider

> A single-value slider built on React Aria `Slider`: a labelled track with one thumb that is a
> real `<input type="range">`, so keyboard, pointer, touch and form submission (`name`) work
> natively. Keys: arrows step by `step`, `PageUp`/`PageDown` move by a larger step (10% of the
> range, at least `step`), `Home`/`End` jump to the limits.

Range selection with two thumbs is not part of this component yet.

Single-value slider: a labelled track with one thumb and a formatted value. Built on React Aria `Slider` (`SliderTrack`, `SliderFill`, `SliderThumb`, `SliderOutput`). The thumb is a real `<input type="range">`, so keyboard, pointer, touch and form submission work natively. Task: CMP-INP-04.

- Import: `import { Slider } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Slider/Slider.tsx`
- Stories (Storybook title `Components/Slider`): Default, KeyboardContract, Percent, WithDescription, SteppedByTen, WithoutValue, Disabled, AriaLabelOnly, Controlled, LongLabel

## Props

| Prop              | Type                        | Required | Default | Description                                                                                                                                                                                     |
| ----------------- | --------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`           | `number`                    |          |         | The value when controlled. Pair with `onChange`.                                                                                                                                                |
| `defaultValue`    | `number`                    |          |         | The initial value when uncontrolled. Defaults to `minValue`.                                                                                                                                    |
| `onChange`        | `((value: number) => void)` |          |         | Called while the value changes (each key press, each pointer move).                                                                                                                             |
| `onChangeEnd`     | `((value: number) => void)` |          |         | Called once when a drag ends or a key press is committed. Use it to save.                                                                                                                       |
| `formatOptions`   | `NumberFormatOptions`       |          |         | Formats the value shown next to the label and spoken to screen readers (`aria-valuetext`): `{ style: 'percent' }`, `{ style: 'unit', unit: 'kilometer' }`, ... Uses the locale of `DSProvider`. |
| `name`            | `string`                    |          |         | Name for form submission; the form receives the number.                                                                                                                                         |
| `showValue`       | `boolean`                   |          | `true`  | Shows the formatted value (mono) on the right of the label. Default `true`.                                                                                                                     |
| `description`     | `ReactNode`                 |          |         | Helper text under the track, linked with `aria-describedby`.                                                                                                                                    |
| `className`       | `string`                    |          |         | Class name for the field root.                                                                                                                                                                  |
| `ref`             | `Ref<HTMLDivElement>`       |          |         | Ref to the field root `<div>`.                                                                                                                                                                  |
| `label`           | `ReactNode`                 |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                             |
| `aria-label`      | `string`                    |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                         |
| `aria-labelledby` | `string`                    |          |         | Id of the element that names the field.                                                                                                                                                         |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `SliderProps` (react-stately): `isDisabled`, `maxValue`, `minValue`, `step`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-label`, `--ds-lh-label`, `--ds-line-control`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-pill`, `--ds-slider-thumb-dot-size`, `--ds-slider-thumb-size`, `--ds-slider-track-height`, `--ds-space-3`, `--ds-text`, `--ds-text-2`, `--ds-text-3`

## When to use

- Picking a number from a bounded range where the approximate value matters more than the exact one (discount, opacity, threshold).

## When not to use

- An exact quantity: `NumberField`. Money: `CurrencyInput`.
- A range with two ends: not supported yet (two-thumb range is P2).
- Fewer than about five discrete choices: `RadioGroup` or a segmented control.

## Anatomy

- Header: `Label` (left) and the formatted value in mono (right, `SliderOutput`).
- Track: rail (`--ds-line-control`, 3:1 against the page), fill from the start to the thumb (`--ds-accent`), thumb.
- Thumb: a 24px hit area (`--ds-slider-thumb-size`, WCAG 2.5.8) with a 16px visible knob; the focus ring follows the hit area.
- Optional description under the track.

## Props (key ones)

| Prop                                         | Notes                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `label` / `aria-label` / `aria-labelledby`   | One is required (types and a development warning).                                               |
| `value` / `defaultValue` / `onChange(value)` | Controlled / uncontrolled, RAC naming. `onChange` fires on every step; `onChangeEnd` on commit.  |
| `minValue`, `maxValue`, `step`               | Defaults `0`, `100`, `1`.                                                                        |
| `formatOptions`                              | `Intl.NumberFormat` options for the shown value and `aria-valuetext`, locale from `DSProvider`.  |
| `showValue`                                  | Default `true`.                                                                                  |
| `description`                                | Helper text, linked with `aria-describedby` on the thumb.                                        |
| `name`                                       | Submitted with the form as the number.                                                           |
| `isDisabled`                                 | Dimmed track; the text drops to `--ds-text-3` instead of using opacity so it keeps its contrast. |

## Accessibility and keyboard

| Key                       | Behavior                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| `ArrowRight` / `ArrowUp`  | Increase by `step`                                                       |
| `ArrowLeft` / `ArrowDown` | Decrease by `step`                                                       |
| `PageUp` / `PageDown`     | Increase / decrease by a larger step (10% of the range, at least `step`) |
| `Home` / `End`            | Minimum / maximum                                                        |

The thumb is `input[type=range]`, named by the label, with `aria-valuetext` from `formatOptions`. The value text is not a live region (RAC announces changes through the input).

## Content rules

Label with the thing being set ("Discount"), not an instruction. Put the unit in `formatOptions` (`{ style: 'percent' }`, `{ style: 'unit', unit: 'kilometer' }`), never in the label.

## Example

```tsx
<Slider
  label="Discount"
  name="discount"
  defaultValue={10}
  maxValue={50}
  formatOptions={{ style: 'unit', unit: 'percent' }}
/>
```

## Related components

- Instead, see NumberField: An exact quantity: `NumberField`. Money: `CurrencyInput`.
- Instead, see CurrencyInput: An exact quantity: `NumberField`. Money: `CurrencyInput`.
- Instead, see RadioGroup: Fewer than about five discrete choices: `RadioGroup` or a segmented control.
- Renders: Label
