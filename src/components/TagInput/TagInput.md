# TagInput

Status: experimental

A text field that turns what you type into removable tags: `Enter` or a comma adds a tag, pasting `a, b, c` adds three, `Backspace` on the empty input removes the last one. Built from `TagGroup` / `Tag` and React Aria `TextField`. The value is the list of tags; with `name` each tag is submitted as a hidden form field.

- TODO `GAP-005`.

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

## Props

| Prop                                                     | Type                           | Default      | Notes                                                                                                |
| -------------------------------------------------------- | ------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------- |
| `label` / `aria-label` / `aria-labelledby`               | `ReactNode` / `string`         | one required | Names the field. Enforced by the types.                                                              |
| `value` / `defaultValue`                                 | `readonly string[]`            | `[]`         | Controlled / uncontrolled tags.                                                                      |
| `onChange`                                               | `(tags: string[]) => void`     | none         | Called with the full list after each addition or removal.                                            |
| `inputValue` / `defaultInputValue` / `onInputChange`     | `string`                       | `''`         | The text being typed, when you need to own it.                                                       |
| `name` / `form`                                          | `string`                       | none         | Each tag is submitted as its own field (`formData.getAll(name)`). The draft text is never submitted. |
| `delimiters`                                             | `readonly string[]`            | `[',']`      | End a tag while typing and split pasted text. `Enter` always adds; line breaks always split a paste. |
| `maxTags`                                                | `number`                       | none         | Error "You can add up to N tags." when exceeded; the text is kept.                                   |
| `validateTag`                                            | `(tag) => string \| undefined` | none         | Return a message to reject a tag. Shown as the field error and read aloud.                           |
| `caseSensitive`                                          | `boolean`                      | `false`      | By default `Notebook` and `notebook` are the same tag.                                               |
| `addOnBlur`                                              | `boolean`                      | `true`       | Turns the text left in the input into a tag on blur.                                                 |
| `description` / `errorMessage`                           | `ReactNode`                    | none         | Helper text; your own error while `isInvalid`.                                                       |
| `placeholder`                                            | `string`                       | none         | Shown only while there are no tags.                                                                  |
| `size`                                                   | `'sm' \| 'md' \| 'lg'`         | `'md'`       | Minimum height 32 / 40 / 48px; the box grows when tags wrap.                                         |
| `isDisabled` / `isReadOnly` / `isRequired` / `isInvalid` | `boolean`                      | `false`      | `isRequired` is satisfied by one tag. Read-only and disabled fields show no remove buttons.          |
| `messages`                                               | see below                      | none         | Per-instance message overrides.                                                                      |

## Behavior

| Input                                        | Result                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Enter` with text                            | Adds the tag (trimmed), clears the input. Does not submit the form. `Enter` on an empty input submits as usual. |
| A delimiter key (`,`)                        | Same as `Enter`; the character is never typed.                                                                  |
| Paste with delimiters or line breaks         | Adds every piece. Duplicates are skipped; a message counts them. A paste without delimiters is a normal paste.  |
| `Backspace` on an empty input                | Removes the last tag (announced: "Removed “headphones”.").                                                      |
| Duplicate                                    | Ignored, input cleared, polite message "“notebook” is already added." Not an error.                             |
| Beyond `maxTags` / rejected by `validateTag` | Error (`role="alert"`, field invalid), nothing is added, the text stays so it can be fixed.                     |
| Blur with text                               | Adds it (`addOnBlur`).                                                                                          |

## Accessibility

- The input is a normal `textbox` named by the label. The tags are a `grid` named "Products, added tags" with one `row` per tag (React Aria `TagGroup`): `Shift+Tab` from the input reaches the tags; a row, then its remove button, are tab stops; `←` / `→` move between tags; `Backspace` or `Delete` on a focused tag removes it. After the last tag is removed focus returns to the input.
- Remove buttons are 24x24 and named "Remove notebook" (message `Tag.remove`).
- Additions, removals and duplicates are announced in one polite `role="status"` region; errors are in the field's `role="alert"` message, linked with `aria-describedby`. Only duplicates are also shown as text below the box, so the notice is not color-only; the error is text and the box border turns danger.
- The click target of the whole box focuses the input.
- Contrast: the box border is `--ds-line-control` (3:1) in every state, as in the other fields.

## Content rules

- Label as a noun phrase ("Products", "Recipients"). Placeholder: an example or an action ("Add a product"), never the label.
- `validateTag` messages say how to fix it: "Enter a complete email address."
- Tags are shown as typed (trimmed); sorting is up to you.

## Messages (`messages` prop, or `DSProvider messages={{ TagInput: … }}`)

`tagsLabel(fieldLabel?)`, `added(tag)`, `addedMany(count)`, `removed(tag)`, `duplicate(tag)`, `duplicates(count)`, `maxReached(max)`, `requiredMark`. English and `pt-BR` ship with the library. The remove button uses the `Tag` messages.

## Examples

```tsx
<TagInput label="Products" name="products" value={products} onChange={setProducts} maxTags={10} />

<TagInput
  label="Recipients"
  delimiters={[',', ';']}
  validateTag={(tag) => (tag.includes('@') ? undefined : 'Enter a complete email address.')}
/>
```
