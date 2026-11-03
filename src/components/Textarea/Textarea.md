# Textarea

Multi-line text field. Same contract as [Input](../Input/Input.md) (label, description, error, states, validation timing from [Field](../Field/Field.md)), plus an aside, auto-growing height and a character count. Built on React Aria `TextField` + `TextArea`.

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

## Differences from the handoff

- `aside` is associated with the field; it was a floating span.
- New: `autoGrow`, character count with a debounced polite announcement, read-only, shared validation timing.
- Focus styling is CSS and survives consumer `onFocus`/`onBlur`.
- `resize` accepts four values and is ignored with `autoGrow`.
