# TagInput

> A text field that turns what you type into removable tags: `Enter` or a comma adds the
> tag, pasting `a, b, c` adds three, `Backspace` on the empty input removes the last one.
> Duplicates are ignored with a polite message; `maxTags` and `validateTag` reject with an
> error that is read aloud.

Built from `TagGroup` / `Tag` and React Aria `TextField`. The tags are a keyboard-navigable
list (one tab stop; `Shift+Tab` from the input reaches it, `Backspace` or `Delete` on a tag
removes it), the input is a normal text box. The value is the list of tags; with `name` each
tag is submitted as a hidden field.

For choosing from known options use `Combobox`; for filters that are always visible use
`ToggleGroup`.

A text field that turns what you type into removable tags: `Enter` or a comma adds a tag, pasting `a, b, c` adds three, `Backspace` on the empty input removes the last one. Built from `TagGroup` / `Tag` and React Aria `TextField`. The value is the list of tags; with `name` each tag is submitted as a hidden form field.

- TODO `GAP-005`.

- Import: `import { TagInput } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/TagInput/TagInput.tsx`
- Stories (Storybook title `Components/TagInput`): Default, AddWithKeyboard, WithTags, BackspaceRemovesLast, RemoveWithKeyboard, Duplicate, MaxTags, Validation, Invalid, Required, Disabled, ReadOnly, Small, Large, ManyTagsWrap, LongTag, SemicolonDelimiter, Controlled, InForm, Portuguese, RightToLeft, Focused

## Props

| Prop                | Type                                                                                                                                                                                                                                                                                          | Required | Default | Description                                                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`             | `readonly string[]`                                                                                                                                                                                                                                                                           |          |         | The tags (controlled). Pair with `onChange`.                                                                                                                                                                           |
| `defaultValue`      | `readonly string[]`                                                                                                                                                                                                                                                                           |          |         | The initial tags (uncontrolled).                                                                                                                                                                                       |
| `onChange`          | `((tags: string[]) => void)`                                                                                                                                                                                                                                                                  |          |         | Called with the full list of tags whenever a tag is added or removed.                                                                                                                                                  |
| `name`              | `string`                                                                                                                                                                                                                                                                                      |          |         | Name used to submit the tags with a form. Each tag is submitted as its own hidden field with this name (read them with `formData.getAll(name)`). The text being typed is never submitted.                              |
| `form`              | `string`                                                                                                                                                                                                                                                                                      |          |         | The `id` of the `<form>` the hidden fields belong to, when the field is outside it.                                                                                                                                    |
| `inputValue`        | `string`                                                                                                                                                                                                                                                                                      |          |         | The text in the input, not yet a tag (controlled). Pair with `onInputChange`.                                                                                                                                          |
| `defaultInputValue` | `string`                                                                                                                                                                                                                                                                                      |          |         | The initial text in the input (uncontrolled).                                                                                                                                                                          |
| `onInputChange`     | `((text: string) => void)`                                                                                                                                                                                                                                                                    |          |         | Called with the text of the input as the user types.                                                                                                                                                                   |
| `delimiters`        | `readonly string[]`                                                                                                                                                                                                                                                                           |          | `[',']` | Characters that end a tag while typing and split pasted text. `Enter` always adds the tag, and line breaks always split pasted text. Default `[',']`. Pass `[]` to use only `Enter`.                                   |
| `maxTags`           | `number`                                                                                                                                                                                                                                                                                      |          |         | Maximum number of tags. Trying to add another shows an error and keeps the text.                                                                                                                                       |
| `validateTag`       | `((tag: string) => string \| null)`                                                                                                                                                                                                                                                           |          |         | Decides whether a tag may be added. Return a message to reject it ("Use letters and digits only."); return nothing to accept it. The message is shown as the field error and read aloud. It receives the trimmed text. |
| `caseSensitive`     | `boolean`                                                                                                                                                                                                                                                                                     |          | `false` | Treat "Linen" and "linen" as different tags. Default: they are the same, and the second is ignored.                                                                                                                    |
| `addOnBlur`         | `boolean`                                                                                                                                                                                                                                                                                     |          | `true`  | Turns the text left in the input into a tag when the input loses focus. Default `true`.                                                                                                                                |
| `description`       | `ReactNode`                                                                                                                                                                                                                                                                                   |          |         | Helper text under the control. Linked with `aria-describedby`.                                                                                                                                                         |
| `errorMessage`      | `FieldErrorMessage`                                                                                                                                                                                                                                                                           |          |         | Error text from your own validation, shown while the field is invalid (`isInvalid`). The messages of `validateTag` and `maxTags` take its place while they apply.                                                      |
| `placeholder`       | `string`                                                                                                                                                                                                                                                                                      |          |         | Text shown while the field has no tags and no text. Never a substitute for the label.                                                                                                                                  |
| `size`              | `'sm' \| 'md' \| 'lg'`                                                                                                                                                                                                                                                                        |          | `'md'`  | Control height: `sm` 32px, `md` 40px (default), `lg` 48px. The box grows when tags wrap.                                                                                                                               |
| `className`         | `string`                                                                                                                                                                                                                                                                                      |          |         | Class name for the field root.                                                                                                                                                                                         |
| `inputClassName`    | `string`                                                                                                                                                                                                                                                                                      |          |         | Class name for the text `<input>`.                                                                                                                                                                                     |
| `inputRef`          | `Ref<HTMLInputElement>`                                                                                                                                                                                                                                                                       |          |         | Ref to the text `<input>`. The `ref` prop points at the field root.                                                                                                                                                    |
| `messages`          | `Partial<{ tagsLabel: (fieldLabel?: string) => string; added: (tag: string) => string; addedMany: (count: number) => string; removed: (tag: string) => string; duplicate: (tag: string) => string; duplicates: (count: number) => string; maxReached: (max: number) => string; } & { ...; }>` |          |         | Message overrides for this instance: `tagsLabel`, `added`, `addedMany`, `removed`, `duplicate`, `duplicates`, `maxReached`, `requiredMark`. The remove button of a tag uses the `Tag` messages.                        |
| `ref`               | `Ref<HTMLDivElement>`                                                                                                                                                                                                                                                                         |          |         | Ref to the field root `<div>`.                                                                                                                                                                                         |
| `label`             | `ReactNode`                                                                                                                                                                                                                                                                                   |          |         | Visible label. Prefer it: sighted and assistive technology users see the same name.                                                                                                                                    |
| `aria-label`        | `string`                                                                                                                                                                                                                                                                                      |          |         | Accessible name when there is no visible label (for example a search box with an icon).                                                                                                                                |
| `aria-labelledby`   | `string`                                                                                                                                                                                                                                                                                      |          |         | Id of the element that names the field.                                                                                                                                                                                |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `AriaTextFieldProps` (react-aria): `aria-activedescendant`, `aria-autocomplete`, `aria-controls`, `aria-haspopup`, `enterKeyHint`
- From `AriaValidationProps` (@react-types/shared): `aria-errormessage`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `InputBase` (@react-types/shared): `isDisabled`, `isReadOnly`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `RACValidation` (react-aria-components): `validationBehavior`
- From `TextFieldProps` (react-aria-components): `isInvalid`
- From `TextInputDOMEvents` (@react-types/shared): `onBeforeInput`, `onCompositionEnd`, `onCompositionStart`, `onCompositionUpdate`, `onCopy`, `onCut`, `onInput`, `onPaste`, `onSelect`
- From `TextInputDOMProps` (@react-types/shared): `autoComplete`, `autoCorrect`, `spellCheck`
- From `Validation` (@react-types/shared): `isRequired`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ TagInput: { ... } }}>`.

| Key                              | English default                  | Notes                                                                                         |
| -------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| `tagsLabel(fieldLabel?: string)` | `{fieldLabel?}, added tags`      | Name of the list of added tags. `fieldLabel` is the text label of the field, when it has one. |
| `added(tag: string)`             | `Added “{tag}”.`                 | Announced (polite) after one tag is added.                                                    |
| `addedMany(count: number)`       | `Added 2 tags.`                  | Announced (polite) after several tags are added at once (paste).                              |
| `removed(tag: string)`           | `Removed “{tag}”.`               | Announced (polite) after a tag is removed with Backspace on the empty input.                  |
| `duplicate(tag: string)`         | `“{tag}” is already added.`      | Shown and announced (polite) when a typed tag is already in the list and was ignored.         |
| `duplicates(count: number)`      | `2 duplicate tags were skipped.` | Shown and announced (polite) when several pasted tags were ignored as duplicates.             |
| `maxReached(max: number)`        | `You can add up to 2 tags.`      | Error shown when the user tries to add a tag beyond the maximum.                              |

## Design tokens used

`--ds-control-h-lg`, `--ds-control-h-md`, `--ds-control-h-sm`, `--ds-fs-label`, `--ds-lh-label`, `--ds-tag-height`, `--ds-tag-input-gap`, `--ds-tag-input-input-min-width`, `--ds-tag-input-padding-block`, `--ds-tag-input-padding-inline`, `--ds-text-2`, `--ds-text-3`

## When to use

- Free-form lists the user types: keywords, e-mail recipients, labels, SKUs.
- When the list can grow beyond what you want to show as checkboxes.

## When not to use

- Choosing from known options: use `Combobox` (or `Select`).
- A fixed set of filters that are always visible: use `ToggleGroup`.
- Showing tags the user cannot edit: use `TagGroup`.

## Anatomy

```
div (field root)
  Label
  div.control                     (the bordered box, wraps over several rows)
    TagGroup[role=grid] aria-label    (only while there are tags; one row per tag)
      Tag > text + remove button (24x24)
    input[type=text]              (the textbox; named by the Label)
  Description
  FieldError                      (role=alert: validation and maximum)
  div[role=status]                (polite: added, removed, duplicate; visible for a duplicate)
  input[type=hidden] x N          (only with `name`)
```

## Behavior

| Input                                        | Result                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Enter` with text                            | Adds the tag (trimmed), clears the input. Does not submit the form. `Enter` on an empty input submits as usual. |
| A delimiter key (`,`)                        | Same as `Enter`; the character is never typed.                                                                  |
| Paste with delimiters or line breaks         | Adds every piece. Duplicates are skipped; a message counts them. A paste without delimiters is a normal paste.  |
| `Backspace` on an empty input                | Removes the last tag (announced: "Removed “silk”.").                                                            |
| Duplicate                                    | Ignored, input cleared, polite message "“linen” is already added." Not an error.                                |
| Beyond `maxTags` / rejected by `validateTag` | Error (`role="alert"`, field invalid), nothing is added, the text stays so it can be fixed.                     |
| Blur with text                               | Adds it (`addOnBlur`).                                                                                          |

## Accessibility

- The input is a normal `textbox` named by the label. The tags are a `grid` named "Fabrics, added tags" with one `row` per tag (React Aria `TagGroup`): `Shift+Tab` from the input reaches the tags; a row, then its remove button, are tab stops; `←` / `→` move between tags; `Backspace` or `Delete` on a focused tag removes it. After the last tag is removed focus returns to the input.
- Remove buttons are 24x24 and named "Remove linen" (message `Tag.remove`).
- Additions, removals and duplicates are announced in one polite `role="status"` region; errors are in the field's `role="alert"` message, linked with `aria-describedby`. Only duplicates are also shown as text below the box, so the notice is not color-only; the error is text and the box border turns danger.
- The click target of the whole box focuses the input.
- Contrast: the box border is `--ds-line-control` (3:1) in every state, as in the other fields.

## Content rules

- Label as a noun phrase ("Fabrics", "Recipients"). Placeholder: an example or an action ("Add a fabric"), never the label.
- `validateTag` messages say how to fix it: "Enter a complete email address."
- Tags are shown as typed (trimmed); sorting is up to you.

## Messages (`messages` prop, or `DSProvider messages={{ TagInput: … }}`)

`tagsLabel(fieldLabel?)`, `added(tag)`, `addedMany(count)`, `removed(tag)`, `duplicate(tag)`, `duplicates(count)`, `maxReached(max)`, `requiredMark`. English and `pt-BR` ship with the library. The remove button uses the `Tag` messages.

## Examples

```tsx
<TagInput label="Fabrics" name="fabrics" value={fabrics} onChange={setFabrics} maxTags={10} />

<TagInput
  label="Recipients"
  delimiters={[',', ';']}
  validateTag={(tag) => (tag.includes('@') ? undefined : 'Enter a complete email address.')}
/>
```

## Related components

- Instead, see Combobox: Choosing from known options: use `Combobox` (or `Select`).
- Instead, see Select: Choosing from known options: use `Combobox` (or `Select`).
- Instead, see ToggleGroup: A fixed set of filters that are always visible: use `ToggleGroup`.
- Instead, see TagGroup: Showing tags the user cannot edit: use `TagGroup`.
- Renders: FieldMessages, Label, Tag, TagGroup
