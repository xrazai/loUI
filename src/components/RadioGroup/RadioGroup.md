# RadioGroup

A labelled set of mutually exclusive options with native radio inputs. Built on React Aria `RadioGroup` + `RadioField` + `RadioButton` (the non-deprecated pair that supports a description per option). Shared field behavior is in [Field](../Field/Field.md).

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

## Differences from the handoff

- Native radios with roving focus replace `div role="radio"` with a tab stop each; the group is labelled, can be required or invalid, and has a description and error.
- Options are `Radio` children instead of an `options` array (a description per option is possible); `direction="row"` is `orientation="horizontal"`, and the default is vertical.
- `onChange(value)` and `value` follow React Aria.
