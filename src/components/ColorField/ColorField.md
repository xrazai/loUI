# ColorField

Status: experimental

A hex colour input with a live `Swatch` preview. Built on React Aria `ColorField` (hex mode), styled like [Input](../Input/Input.md). Task: GAP-024.

## When to use

- The user types or pastes a colour as a hex code: fabric colour, tag colour, brand colour in a settings form.

## When not to use

- Choosing from a fixed palette: a hand-built set of options with `Swatch` and labels.
- Exploring colours visually (area, hue slider, eyedropper): a picker is not part of this component yet.
- A colour name or code that is not a hex value: `Input`.

## Anatomy

`[ swatch | #RRGGBB ]` in one box (`sm` 32 / `md` 40 / `lg` 48), then description and error as in `Input`. The text is Geist Mono, shown upper case. The swatch is decorative (`aria-hidden`) and empty (dashed circle) when there is no value.

## Props (key ones)

| Prop                                                          | Notes                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby`                    | One is required.                                                                                |
| `value` / `defaultValue` / `onChange(color)`                  | RAC naming. A `#RRGGBB` string or a `Color`. `onChange` receives a `Color`, or `null` if empty. |
| `validate`                                                    | Receives the `Color \| null`; return a message (or messages) to mark the field invalid.         |
| `size`                                                        | `sm` / `md` (default) / `lg`.                                                                   |
| `fullWidth`                                                   | In a flex row (`Inline`) the field takes the free space and can shrink. Off by default.         |
| `description`, `descriptionTone`, `errorMessage`              | As in `Input`. `errorMessage` defaults to the catalog `invalid` message.                        |
| `placeholder`                                                 | For example `#RRGGBB`. Never a substitute for the label.                                        |
| `name`, `isRequired`, `isInvalid`, `isDisabled`, `isReadOnly` | Standard. `name` submits `#RRGGBB`.                                                             |
| `messages`                                                    | `invalid`, `requiredMark`.                                                                      |

### Getting the hex

`onChange` gives a React Aria `Color`. The normalised string is `color?.toString('hex')`: always `#RRGGBB`, upper case (`null` when the field is empty). To store the value as a string, keep that string and pass it back as `value`.

```tsx
const [hex, setHex] = useState('#C2603E');
<ColorField label="Hex" value={hex} onChange={(color) => setHex(color?.toString('hex') ?? '')} />;
```

## Behaviour

- Typing is free. On blur or `Enter` the text is parsed and normalised: `#abc` and `abc` become `#AABBCC`.
- Text that is not a colour is reverted to the last valid value on blur (React Aria). To flag an empty required field or a rule of your own (`validate`, `isInvalid`), the field shows the `invalid` message "Enter a colour as #RRGGBB." unless you pass `errorMessage`; an app-supplied `validate` message wins.
- An empty field reports `null`; the swatch is then empty.

## Accessibility and keyboard

| Key                     | Behavior                                         |
| ----------------------- | ------------------------------------------------ |
| Typing                  | Any text; parsed and normalised on blur or Enter |
| `ArrowUp` / `ArrowDown` | Step the colour value by 1 (React Aria)          |

The input is a text input named by its label, with description and error linked by `aria-describedby` and `aria-invalid`. The swatch is `aria-hidden`: the hex text next to it carries the meaning, so colour is never the only carrier. Focus ring on the box, also in forced-colors.

## Content rules

Label with the noun ("Hex", "Fabric colour"). Errors say how to fix: "Enter a colour as #RRGGBB."

## Example

```tsx
<ColorField
  label="Hex"
  name="hex"
  defaultValue="#C2603E"
  description="Colour of the fabric as dyed."
/>
```

## Design note (GAP-024)

Decision: wrap React Aria `ColorField` rather than keep a masked `Input` plus `Swatch` in every app. No new ADR: `react-aria-components` is already the behaviour layer (ADR-0001) and this adds no dependency. React Aria gives hex parsing, `#abc` expansion, stepping and form submission for free; the DS adds the field anatomy, the swatch preview, mono type and messages.

Out of scope, a later task: a colour picker (area, hue and channel sliders, eyedropper) as a popover composed with this field, and channel fields (`channel` prop) for HSL or RGB inputs.

## Differences from the consumer workaround

- No hand-built `normalizeHex`, `isHex` or preview row: the field normalises and previews itself.
- The consumer disabled form validation and showed its own error; here the field uses `FieldError` and the catalog message, in en and pt-BR.
