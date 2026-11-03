# Switch

> An on/off setting that applies immediately. Renders a native checkbox with `role="switch"`
> (so `name` / `value` take part in form submission), a 36x20 track and a 16px knob.

State props follow React Aria: `isSelected`, `defaultSelected` and `onChange(isSelected)`.
For a choice that is confirmed later with a Save button, prefer `Checkbox`.

An on/off setting that takes effect immediately. A native checkbox with `role="switch"`, a 36x20 track and a 16px knob. Built on React Aria `SwitchField` + `SwitchButton` (the non-deprecated pair that supports a description and an error outside the label). Shared field behavior is in [Field](../Field/Field.md).

- Import: `import { Switch } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Switch/Switch.tsx`
- Stories (Storybook title `Components/Switch`): Default, On, WithDescription, LabelAtEnd, Disabled, ReadOnly, Required, Invalid, LongLabel, WithoutVisibleLabel

## Props

| Prop              | Type                                 | Required | Default   | Description                                                                                                                                                                               |
| ----------------- | ------------------------------------ | -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`     | `ReactNode`                          |          |           | Secondary text under the label. Linked with `aria-describedby`, not part of the name.                                                                                                     |
| `errorMessage`    | `FieldErrorMessage`                  |          |           | Error text, shown while the switch is invalid and the error is displayed.                                                                                                                 |
| `labelPlacement`  | `'start' \| 'end'`                   |          | `'start'` | Where the label sits relative to the track. `start` (default): text on the leading side, track on the trailing side, spread across the row, the settings-list layout. `end`: track first. |
| `className`       | `string`                             |          |           | Class name for the field root.                                                                                                                                                            |
| `messages`        | `Partial<{ requiredMark: string; }>` |          |           | Message overrides for this instance (`requiredMark`).                                                                                                                                     |
| `ref`             | `Ref<HTMLDivElement>`                |          |           | Ref to the field root `<div>`. Use `inputRef` for the `<input>`.                                                                                                                          |
| `label`           | `ReactNode`                          |          |           | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                       |
| `aria-label`      | `string`                             |          |           | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                   |
| `aria-labelledby` | `string`                             |          |           | Id of the element that names the field.                                                                                                                                                   |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaSwitchProps` (react-aria): `aria-controls`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `SwitchFieldProps` (react-aria-components): `inputRef`
- From `ToggleProps` (react-stately): `value`
- From `ToggleStateOptions` (react-stately): `defaultSelected`, `isSelected`, `onChange`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-focus-ring-danger`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radius-pill`, `--ds-space-1`, `--ds-space-4`, `--ds-switch-knob-offset`, `--ds-switch-knob-size`, `--ds-switch-track-height`, `--ds-switch-track-width`, `--ds-text`, `--ds-text-3`

## When to use

- Settings that apply as soon as they change ("Email notifications"), with the state obvious from the label.

## When not to use

- Choices confirmed later with a Save button or submitted as an agreement: `Checkbox`.
- One of several options: `RadioGroup`.

## Props (key ones)

| Prop                                                                  | Notes                                                                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `label`                                                               | Visible label. Without it pass `aria-label` or `aria-labelledby` (renders only the track).                          |
| `description`                                                         | Secondary text under the label, linked by `aria-describedby`, not part of the name.                                 |
| `labelPlacement`                                                      | `start` (default): text on the leading side, track on the trailing side, spread across the row. `end`: track first. |
| `isSelected` / `defaultSelected` / `onChange(isSelected)`             | React Aria naming.                                                                                                  |
| `name`, `value`                                                       | Submitted with the form while on (`value` defaults to `on`).                                                        |
| `isDisabled`, `isReadOnly`, `isRequired`, `isInvalid`, `errorMessage` | Standard states.                                                                                                    |
| `inputRef` / `ref`                                                    | `inputRef` is the `<input>`, `ref` the field root.                                                                  |

## Look

- Off: track in `--ds-line-control` (3:1 or better against the page, also on hover); on: `--ds-accent`. The knob uses `--ds-text` and moves with `inset-inline-start`, so it mirrors in right-to-left.
- Sizes come from component tokens: `--ds-switch-track-width`, `--ds-switch-track-height`, `--ds-switch-knob-size`, `--ds-switch-knob-offset`.
- The row is at least as tall as the track and the whole row is the click target, with one toggle per click.
- Reduced motion: transitions are removed by the base layer.
- Forced colors: the track gets a system border and a `Highlight` fill when on; the knob uses `CanvasText`.

## Accessibility

- `Space` toggles the focused switch. `Enter` does not toggle (it submits the form, as for any native checkbox).
- Announced as "switch, on/off", named by the label only; the description is `aria-describedby`.
- State is conveyed by position and by color, and by the announced state.

## Example

```tsx
<Switch label="Email notifications" description="A summary every morning." defaultSelected />
<Switch label="Dark mode" labelPlacement="end" name="theme" value="dark" />
<Switch aria-label="Enable sync" />
```

## Related components

- Instead, see Checkbox: Choices confirmed later with a Save button or submitted as an agreement: `Checkbox`.
- Instead, see RadioGroup: One of several options: `RadioGroup`.
- Renders: FieldMessages, RequiredMark
