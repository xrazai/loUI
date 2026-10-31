# Switch

An on/off setting that takes effect immediately. A native checkbox with `role="switch"`, a 36x20 track and a 16px knob. Built on React Aria `SwitchField` + `SwitchButton` (the non-deprecated pair that supports a description and an error outside the label). Shared field behavior is in [Field](../Field/Field.md).

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

## Differences from the handoff

- A native checkbox with `role="switch"` replaces `role="switch"` on a span inside a clickable row: there is no double toggle, and the control has an accessible name and description.
- The off track meets 3:1 (`--ds-line-control` instead of `--line-strong`).
- Layout is `labelPlacement`; the text-left, switch-right layout of the handoff is the default.
- Dimensions are component tokens; controlled props follow React Aria.
