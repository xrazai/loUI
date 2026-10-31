# Slider

Single-value slider: a labelled track with one thumb and a formatted value. Built on React Aria `Slider` (`SliderTrack`, `SliderFill`, `SliderThumb`, `SliderOutput`). The thumb is a real `<input type="range">`, so keyboard, pointer, touch and form submission work natively. Task: CMP-INP-04.

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

## Differences from the handoff

- The thumb is a real range input (the handoff `div role="slider"` had no name, no Home/End/PageUp/PageDown and no `aria-valuetext`).
- `format(value)` became `formatOptions` (locale-aware `Intl`); `min`/`max` became `minValue`/`maxValue` (RAC names); the knob has a 24px hit area; the label is required.
- The decorative shadow on the knob was dropped (shadows only on overlays).
