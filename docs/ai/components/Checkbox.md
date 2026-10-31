# Checkbox

> A checkbox with a native `<input type="checkbox">` (so `name` / `value` take part in form
> submission), an 18px box and an optional description. The whole label row is the click target.

State props follow React Aria: `isSelected`, `defaultSelected` and `onChange(isSelected)`.
`isIndeterminate` is visual and semantic ("mixed") until the user toggles it.

A checkbox with a native `<input type="checkbox">`, an 18px box and an optional description, plus a labelled group for several related checkboxes. Built on React Aria `CheckboxField` + `CheckboxButton` (the non-deprecated pair that supports a description and an error outside the label) and `CheckboxGroup`. Shared field behavior is in [Field](../Field/Field.md).

- Import: `import { Checkbox } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Checkbox/Checkbox.tsx`
- Stories (Storybook title `Components/Checkbox`): Default, Checked, Indeterminate, WithDescription, Required, Invalid, Disabled, ReadOnly, LongLabel, WithoutVisibleLabel, InAGroup, GroupHorizontal, GroupInvalid

## Props

| Prop              | Type                                 | Required | Default | Description                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `description`     | `ReactNode`                          |          |         | Secondary text under the label. Linked with `aria-describedby`, not part of the name.                                                                                                                                                            |
| `errorMessage`    | `FieldErrorMessage`                  |          |         | Error text, for example "Accept the terms to continue". Shown while the checkbox is invalid and the error is displayed (after a submit attempt with the default native validation). Inside a `CheckboxGroup` put the error on the group instead. |
| `className`       | `string`                             |          |         | Class name for the field root.                                                                                                                                                                                                                   |
| `messages`        | `Partial<{ requiredMark: string; }>` |          |         | Message overrides for this instance (`requiredMark`).                                                                                                                                                                                            |
| `ref`             | `Ref<HTMLDivElement>`                |          |         | Ref to the field root `<div>`. Use `inputRef` for the `<input>`.                                                                                                                                                                                 |
| `label`           | `ReactNode`                          |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                                                                              |
| `aria-label`      | `string`                             |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                                                                          |
| `aria-labelledby` | `string`                             |          |         | Id of the element that names the field.                                                                                                                                                                                                          |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaToggleProps` (react-aria): `aria-controls`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `CheckboxFieldProps` (react-aria-components): `inputRef`
- From `CheckboxProps` (react-aria): `isIndeterminate`
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
- From `ToggleProps` (react-stately): `value`
- From `ToggleStateOptions` (react-stately): `defaultSelected`, `isSelected`, `onChange`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-checkbox-box-size`, `--ds-checkbox-radius`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-field-choice-gap`, `--ds-focus-ring`, `--ds-focus-ring-danger`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-space-1`, `--ds-space-3`, `--ds-space-5`, `--ds-target-min`, `--ds-text`, `--ds-text-3`, `--ds-text-inverse`

## When to use

- Independent yes/no choices, agreement ("I accept the terms"), selecting rows, picking several items from a list (`CheckboxGroup`).
- `isIndeterminate` for a parent that summarizes partly selected children.

## When not to use

- An on/off setting that applies at once: `Switch`.
- One choice from several: `RadioGroup`.

## Props (key ones)

| Prop                                                      | Notes                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `label`                                                   | Visible label. Without it pass `aria-label` or `aria-labelledby` (type error otherwise).         |
| `description`                                             | Secondary text under the label, linked by `aria-describedby`, not part of the name.              |
| `errorMessage`                                            | Error for a single checkbox (for example a required agreement). In a group, set it on the group. |
| `isSelected` / `defaultSelected` / `onChange(isSelected)` | React Aria naming for controlled and uncontrolled use.                                           |
| `isIndeterminate`                                         | Shows a minus; the native input is `indeterminate` until toggled.                                |
| `name`, `value`                                           | Submitted with the form while checked (`value` defaults to `on`).                                |
| `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly`     | Standard states.                                                                                 |
| `inputRef` / `ref`                                        | `inputRef` is the `<input>`, `ref` the field root.                                               |

`CheckboxGroup` takes `label`, `description`, `errorMessage`, `orientation` (`vertical` default, `horizontal`), `name`, `value`/`defaultValue`/`onChange(values: string[])`, `isRequired`, `isInvalid`, `isDisabled`. Each child `Checkbox` needs a `value`.

## Look

- 18px box, radius from `--ds-checkbox-radius` (5px), `--ds-line-control` border (3:1 or better in every state), accent fill with a `--ds-text-inverse` check when selected, minus when indeterminate.
- Hover brightens the border; it never changes the fill.
- The whole row is the click target and is at least 24px tall (WCAG 2.5.8).
- A disabled group dims once as a whole; disabled single checkboxes use `--ds-opacity-disabled`.

## Accessibility

- Space toggles the focused checkbox. Tab moves between checkboxes; each checkbox is a tab stop.
- Name comes from the label only; the description is `aria-describedby`.
- Group: `role="group"` named by the label, with the group description and error.
- Forced colors: borders and the check glyph use system colors; the glyph (check or minus) carries the state.

## Example

```tsx
<Checkbox label="I accept the terms" name="terms" isRequired errorMessage="Accept the terms to continue." />

<CheckboxGroup label="Notify me about" name="topics" defaultValue={['orders']}>
  <Checkbox value="orders" label="New orders" />
  <Checkbox value="stock" label="Low stock" description="When a fabric drops below its minimum." />
</CheckboxGroup>
```

## Related components

- Instead, see Switch: An on/off setting that applies at once: `Switch`.
- Instead, see RadioGroup: One choice from several: `RadioGroup`.
- Renders: FieldMessages, Icon, RequiredMark
- Used by: DataTable
