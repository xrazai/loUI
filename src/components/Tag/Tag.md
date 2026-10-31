# Tag

Status: experimental

A mono outlined label for versions, SKUs and filters. `Tag` is static text on its own (with an optional remove button); inside a `TagGroup` it is an item with keyboard navigation, selection and removal. `TagGroup` is built on React Aria `TagGroup`, `TagList` and `Tag`.

## When to use

- Show an attribute or identifier: `v2.4.0`, `ORD-1048`, `linen`.
- Show applied filters that the user can remove (`TagGroup` with `onRemove`).
- Let the user toggle filters (`TagGroup` with `selectionMode`).

## When not to use

- For a status (Shipped, Failed): use `Badge`.
- For a command: use `Button`.
- For choosing one option from a list: use `Select` or `RadioGroup`.

## Anatomy

```
TagGroup           (grid; optional visible label)
  Label
  TagList          (flex wrap)
    Tag            (row)
      text
      remove button  only when the group has onRemove (24x24 target)
```

## Props

`Tag`

| Prop         | Type                | Notes                                                                         |
| ------------ | ------------------- | ----------------------------------------------------------------------------- |
| `children`   | `ReactNode`         | The text                                                                      |
| `textValue`  | `string`            | Required when `children` is not a string: names the tag and its remove button |
| `id`         | `Key`               | In a group: the key. Standalone: the DOM id                                   |
| `isDisabled` | `boolean`           | Dashed border and reduced opacity; not removable or selectable                |
| `onRemove`   | `() => void`        | Standalone only: shows a remove button. In a group use the group's `onRemove` |
| `messages`   | `{ remove(label) }` | Per-instance override of the remove button name                               |

`TagGroup`

| Prop                                                                                        | Notes                                                            |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `label`                                                                                     | Visible label. Without it set `aria-label` or `aria-labelledby`  |
| `onRemove(keys: Set<Key>)`                                                                  | Enables removal: Backspace, Delete and the remove button call it |
| `selectionMode`, `selectedKeys`, `defaultSelectedKeys`, `onSelectionChange`, `disabledKeys` | React Aria selection API                                         |
| `items`, `children` (function)                                                              | Dynamic collections, as in React Aria                            |
| `renderEmptyState`                                                                          | Content shown when no tag is left ("No filters applied")         |

## Accessibility

- A group is a `grid` with one `row` per tag. Arrow keys move between tags (roving focus); the focused tag is the only one in the tab order.
- **Backspace and Delete remove the focused tag** (or all selected tags) when the group has `onRemove`. Keyboard users are told so by a description that React Aria adds to the focused tag.
- **The remove button is named "Remove {text}"** from the message catalog (pt-BR: "Remover {text}"), not just "Remove". The button is also a tab stop after its tag, and is a 24 by 24 pixel target (WCAG 2.5.8).
- After a removal, focus moves to a neighbouring tag (React Aria); handle the empty state with `renderEmptyState` and move focus to something sensible yourself if the whole group disappears.
- Selection is exposed as `aria-selected`, and shown with the accent border and tint (a permitted use of the accent). Selection is never signalled by color alone: the state is announced.
- A standalone `Tag` is plain text. With `onRemove` it contains a real `<button>` (Enter or Space); Backspace and Delete do nothing there because the tag itself is not focusable. Use a `TagGroup` when keyboard removal matters.
- Text is `--ds-text-2` on the page surface; disabled tags are exempt from contrast and carry `aria-disabled`.

## Content rules

- Short, lowercase or code-like values are fine (`v2.4.0`, `ORD-1048`); filters use the user's own words.
- Write a `textValue` that reads well after "Remove": "Remove linen".

## Examples

```tsx
<Tag>v2.4.0</Tag>

<TagGroup label="Fabric" onRemove={(keys) => setTags((t) => t.filter((x) => !keys.has(x)))}>
  {tags.map((tag) => <Tag key={tag} id={tag}>{tag}</Tag>)}
</TagGroup>
```

## Differences from the handoff

- The remove button name includes the tag text (it was a bare "Remover").
- 24 px target for the remove button; height, padding and button size are tokens (`--ds-tag-*`).
- `TagGroup` adds keyboard removal, roving focus, selection and an empty state.
- The "×" glyph is the bundled `X` icon, hidden from assistive technology.
- No `style` prop.
