# Textarea

> Multi-line text field built on React Aria `TextField` + `TextArea`. Same contract as `Input`.

Multi-line text field. Same contract as [Input](../Input/Input.md) (label, description, error, states, validation timing from [Field](../Field/Field.md)), plus an aside, auto-growing height and a character count. Built on React Aria `TextField` + `TextArea`.

- Import: `import { Textarea } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Textarea/Textarea.tsx`
- Stories (Storybook title `Components/Textarea`): Default, WithDescription, WithAside, Required, Invalid, Disabled, ReadOnly, AutoGrow, WithCharacterCount, NoResize, LongLabel, Focused

## Props

| Prop                | Type                                                                                                                                                    | Required | Default      | Description                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description`       | `ReactNode`                                                                                                                                             |          |              | Helper text under the control. Linked with `aria-describedby`.                                                                                                                   |
| `descriptionTone`   | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'`                                                                                           |          |              | Tone of the description: `success`, `warning`, `danger` or `accent` for a live check such as "Matches" or "Over by $5". The text carries the meaning; colour only reinforces it. |
| `errorMessage`      | `FieldErrorMessage`                                                                                                                                     |          |              | Error text, shown while the field is invalid and the error is displayed. See `Input`.                                                                                            |
| `aside`             | `ReactNode`                                                                                                                                             |          |              | Text on the label line, aligned to the end (for example "Optional" or "Markdown supported"). It is part of the field's description for assistive technology, not of its name.    |
| `placeholder`       | `string`                                                                                                                                                |          |              | Text shown while the field is empty. Never a substitute for the label.                                                                                                           |
| `rows`              | `number`                                                                                                                                                |          | `3`          | Visible lines before the user types. Default 3.                                                                                                                                  |
| `resize`            | `'none' \| 'vertical' \| 'horizontal' \| 'both'`                                                                                                        |          | `'vertical'` | Whether the user can drag the corner to resize. Default `vertical`. Ignored with `autoGrow`.                                                                                     |
| `autoGrow`          | `boolean`                                                                                                                                               |          | `false`      | Grows with its content instead of scrolling.                                                                                                                                     |
| `showCount`         | `boolean`                                                                                                                                               |          | `false`      | Shows "used / max" on the label line and announces the remaining characters politely once typing pauses. Needs `maxLength`.                                                      |
| `className`         | `string`                                                                                                                                                |          |              | Class name for the field root.                                                                                                                                                   |
| `textareaClassName` | `string`                                                                                                                                                |          |              | Class name for the `<textarea>` element.                                                                                                                                         |
| `textareaRef`       | `Ref<HTMLTextAreaElement>`                                                                                                                              |          |              | Ref to the `<textarea>` element. The `ref` prop points at the field root.                                                                                                        |
| `messages`          | `Partial<{ count: (used: string, max: string) => string; remaining: (n: number) => string; over: (n: number) => string; } & { requiredMark: string; }>` |          |              | Message overrides for this instance: `count`, `remaining`, `over`, `requiredMark`.                                                                                               |
| `ref`               | `Ref<HTMLDivElement>`                                                                                                                                   |          |              | Ref to the field root `<div>`.                                                                                                                                                   |
| `label`             | `ReactNode`                                                                                                                                             |          |              | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                              |
| `aria-label`        | `string`                                                                                                                                                |          |              | Accessible name when there is no visible label (for example a search box with an icon).                                                                                          |
| `aria-labelledby`   | `string`                                                                                                                                                |          |              | Id of the element that names the field.                                                                                                                                          |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaTextFieldProps` (react-aria): `aria-activedescendant`, `aria-autocomplete`, `aria-controls`, `aria-haspopup`, `enterKeyHint`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `InputDOMProps` (@react-types/shared): `form`, `name`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `SlotProps` (react-aria-components): `slot`
- From `TextFieldProps` (react-aria-components): `isInvalid`
- From `TextInputDOMEvents` (@react-types/shared): `onBeforeInput`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onCopy`, `onCut`, `onInput`, `onPaste`, `onSelect`
- From `TextInputDOMProps` (@react-types/shared): `autoComplete`, `autoCorrect`, `maxLength`, `minLength`, `pattern`, `spellCheck`
- From `Validation` (@react-types/shared): `isRequired`, `validate`
- From `ValueBase` (@react-types/shared): `defaultValue`, `onChange`, `value`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Textarea: { ... } }}>`.

| Key                                | English default               | Notes                                                                                       |
| ---------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| `count(used: string, max: string)` | `{used} / {max}`              | Visible counter next to the label, for example "12 / 200". Arguments are already formatted. |
| `remaining(n: number)`             | `2 characters remaining`      | Polite announcement, made once typing pauses.                                               |
| `over(n: number)`                  | `2 characters over the limit` | Announcement when a controlled value exceeds `maxLength`.                                   |

## Design tokens used

`--ds-danger`, `--ds-font-mono`, `--ds-fs-meta`, `--ds-lh-meta`, `--ds-space-2`, `--ds-text-3`, `--ds-textarea-padding-block`, `--ds-textarea-padding-inline`

## When to use

- Notes, comments, descriptions, messages longer than a line.

## When not to use

- One line of text: `Input`.
- Rich text or Markdown editing: a dedicated editor.

## Props (key ones)

| Prop                                                      | Notes                                                                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `label`, `description`, `descriptionTone`, `errorMessage` | As in `Input`.                                                                                                           |
| `aside`                                                   | Text on the label line, aligned to the end ("Optional", "Markdown supported"). Part of the description, not of the name. |
| `rows`                                                    | Visible lines. Default 3.                                                                                                |
| `resize`                                                  | `none`, `vertical` (default), `horizontal`, `both`.                                                                      |
| `autoGrow`                                                | Grows with its content; the manual resize handle is off.                                                                 |
| `maxLength` + `showCount`                                 | Shows "used / max" on the label line and announces the remaining characters politely.                                    |
| `value` / `defaultValue` / `onChange(value)`              | React Aria naming; `onChange` receives the string.                                                                       |
| `textareaRef` / `ref`                                     | `textareaRef` is the `<textarea>`, `ref` the field root.                                                                 |
| `messages`                                                | `count`, `remaining`, `over`, `requiredMark`.                                                                            |

## Character count

- The visible counter ("12 / 200", formatted for the locale) is `aria-hidden`: announcing it on every keystroke would drown the user.
- A separate visually hidden `role="status"` (polite) region announces "N characters remaining" once typing has paused for one second. It stays silent until the value changes, and says "N characters over the limit" when a controlled value exceeds `maxLength`.
- Plural forms and the pt-BR text come from `Textarea.messages.ts`. Override `count`, `remaining` and `over` per instance or via `DSProvider messages={{ Textarea: { ... } }}`.
- `showCount` has no effect without `maxLength`. The native `maxLength` stops typing at the limit.

## Accessibility

- Native `<textarea>` named by its label; `aside` and `description` are in `aria-describedby` (description first, then aside).
- Keyboard: standard text editing; `Enter` inserts a newline; `Tab` leaves the field.
- Auto-grow keeps all content visible (no inner scrollbar), which helps zoom and reflow.

## Example

```tsx
<Textarea label="Notes" aside="Optional" description="Plain text only." maxLength={500} showCount />
<Textarea label="Message" autoGrow rows={2} isRequired errorMessage="Write a message." />
```

## Related components

- Instead, see Input: One line of text: `Input`.
- Renders: FieldMessages, Label, VisuallyHidden
- Used by: ApprovalCard, ChatPanel
