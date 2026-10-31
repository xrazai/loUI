# RadioGroup

> A labelled `role="radiogroup"` of mutually exclusive options with native radio inputs.
> The group is one tab stop; arrow keys move and select (roving focus is handled by React Aria).
> `value`, `defaultValue` and `onChange(value)` follow React Aria; `name` is shared by every radio.
> A group needs a name: pass `label`, `aria-label` or `aria-labelledby`.

A labelled set of mutually exclusive options with native radio inputs. Built on React Aria `RadioGroup` + `RadioField` + `RadioButton` (the non-deprecated pair that supports a description per option). Shared field behavior is in [Field](../Field/Field.md).

- Import: `import { RadioGroup } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/RadioGroup/RadioGroup.tsx`
- Stories (Storybook title `Components/RadioGroup`): Default, WithSelection, Horizontal, WithDescriptions, Required, Invalid, Disabled, DisabledOption, ReadOnly, LongLabels

## Props

| Prop              | Type                                 | Required | Default      | Description                                                                                                                                                              |
| ----------------- | ------------------------------------ | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `children`        | `ReactNode`                          | yes      |              | The `Radio` elements of the group.                                                                                                                                       |
| `description`     | `ReactNode`                          |          |              | Helper text under the label. Linked with `aria-describedby`.                                                                                                             |
| `errorMessage`    | `FieldErrorMessage`                  |          |              | Error text for the group, shown while it is invalid and the error is displayed (after a submit attempt with the default native validation, or at once with `isInvalid`). |
| `orientation`     | `'vertical' \| 'horizontal'`         |          | `'vertical'` | Layout of the options. Default `vertical`; arrow keys follow the reading direction either way.                                                                           |
| `className`       | `string`                             |          |              | Class name for the group root.                                                                                                                                           |
| `messages`        | `Partial<{ requiredMark: string; }>` |          |              | Message overrides for this instance (`requiredMark`).                                                                                                                    |
| `ref`             | `Ref<HTMLDivElement>`                |          |              | Ref to the group root `<div>`.                                                                                                                                           |
| `label`           | `ReactNode`                          |          |              | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                      |
| `aria-label`      | `string`                             |          |              | Accessible name when there is no visible label (for example a search box with an icon).                                                                                  |
| `aria-labelledby` | `string`                             |          |              | Id of the element that names the field.                                                                                                                                  |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `Validation` (@react-types/shared): `isInvalid`, `isRequired`, `validate`
- From `ValueBase` (@react-types/shared): `defaultValue`, `onChange`, `value`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-danger`, `--ds-duration`, `--ds-ease`, `--ds-field-choice-gap`, `--ds-focus-ring`, `--ds-focus-ring-danger`, `--ds-fs-small`, `--ds-lh-small`, `--ds-line-control`, `--ds-opacity-disabled`, `--ds-radio-dot-size`, `--ds-radio-size`, `--ds-radius-pill`, `--ds-space-1`, `--ds-space-3`, `--ds-space-5`, `--ds-target-min`, `--ds-text`, `--ds-text-3`

## When to use

- Choose exactly one of 2 to 5 options that users want to compare.

## When not to use

- Many options: `Select`.
- Independent choices: `Checkbox`.
- Immediate on/off: `Switch`.

## Props (key ones)

`RadioGroup`:

| Prop                                                  | Notes                                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `label`                                               | Group name. Required: pass `label`, `aria-label` or `aria-labelledby` (type error otherwise; development warning too). |
| `description`, `errorMessage`                         | Linked to the group by `aria-describedby`.                                                                             |
| `orientation`                                         | `vertical` (default) or `horizontal`.                                                                                  |
| `value` / `defaultValue` / `onChange(value)`          | React Aria naming; `value` is a string.                                                                                |
| `name`                                                | Shared by every radio; the selected value is submitted.                                                                |
| `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly` | Standard states.                                                                                                       |

`Radio`: `value` (required), `label`, `description`, `isDisabled`, `className`, `inputRef`.

## Look

- 18px circle (`--ds-radio-size`), `--ds-line-control` border at 3:1 or better in every state, accent border and a 9px accent dot when selected. Hover brightens the border.
- The option row is at least 24px tall and the whole row is clickable.
- A disabled group dims once; a single disabled option uses `--ds-opacity-disabled`.

## Accessibility and keyboard

| Key                        | Behavior                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `Tab`                      | One tab stop: lands on the selected radio, or the first one when nothing is selected            |
| `ArrowDown` / `ArrowRight` | Next radio, selects it, wraps from the last to the first (directions follow the text direction) |
| `ArrowUp` / `ArrowLeft`    | Previous radio, selects it, wraps                                                               |
| `Space`                    | Selects the focused radio                                                                       |

Roving focus is handled by React Aria, so only one radio is in the tab order (the handoff made every radio tabbable). `role="radiogroup"` is named by the label; the description and error belong to the group; `aria-required` and `aria-invalid` are set.

## Example

```tsx
<RadioGroup
  label="Region"
  name="region"
  defaultValue="eu"
  description="You cannot change this later."
>
  <Radio value="eu" label="EU: Frankfurt" />
  <Radio value="us" label="US: Virginia" description="Default for new workspaces." />
</RadioGroup>
```

## Related components

- Instead, see Select: Many options: `Select`.
- Instead, see Checkbox: Independent choices: `Checkbox`.
- Instead, see Switch: Immediate on/off: `Switch`.
- Renders: Description, FieldMessages, Label
