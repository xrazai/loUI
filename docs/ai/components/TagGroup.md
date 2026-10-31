# TagGroup

> A group of tags with one tab stop and arrow-key navigation. With `onRemove`, Backspace and
> Delete remove the focused tag (or the selected tags) and every tag gets a remove button.
> Built on React Aria `TagGroup`.

A mono outlined label for versions, SKUs and filters. `Tag` is static text on its own (with an optional remove button); inside a `TagGroup` it is an item with keyboard navigation, selection and removal. `TagGroup` is built on React Aria `TagGroup`, `TagList` and `Tag`.

- Import: `import { TagGroup } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Tag/Tag.tsx`
- Stories (Storybook title `Components/Tag`): Default, Removable, Disabled, LongText, RightToLeft, RemovableGroupStory, GroupStatic, GroupSelectable, GroupWithDisabledTag, GroupEmpty

## Props

| Prop               | Type                                    | Required | Default | Description                                                                                                    |
| ------------------ | --------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `children`         | `ReactNode \| ((item: T) => ReactNode)` | yes      |         | Static `Tag` children, or a render function when `items` is given.                                             |
| `label`            | `ReactNode`                             |          |         | Visible label of the group. Without it, give the group an `aria-label` or `aria-labelledby`.                   |
| `onRemove`         | `(keys: Set<Key>) => void`              |          |         | Called with the keys of the tags to remove (Backspace, Delete or the remove button). Makes the tags removable. |
| `items`            | `Iterable<T>`                           |          |         | Data for the render function. Each item needs an `id` (or pass `id` to the rendered `Tag`).                    |
| `renderEmptyState` | `() => ReactNode`                       |          |         | Content shown when there are no tags (for example "No filters applied").                                       |
| `className`        | `string`                                |          |         |                                                                                                                |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `AriaTagGroupProps` (react-aria): `escapeKeyBehavior`, `selectionBehavior`, `shouldSelectOnPressUp`
- From `CollectionBase` (@react-types/shared): `disabledKeys`
- From `DOMProps` (@react-types/shared): `id`
- From `GridListProps` (react-aria): `onAction`
- From `MultipleSelection` (@react-types/shared): `defaultSelectedKeys`, `disallowEmptySelection`, `onSelectionChange`, `selectedKeys`, `selectionMode`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-accent-soft`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-sm`, `--ds-space-1`, `--ds-space-2`, `--ds-surface-hover`, `--ds-tag-height`, `--ds-tag-padding-inline`, `--ds-tag-remove-size`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`

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

## Related components

- Instead, see Badge: For a status (Shipped, Failed): use `Badge`.
- Instead, see Button: For a command: use `Button`.
- Instead, see Select: For choosing one option from a list: use `Select` or `RadioGroup`.
- Instead, see RadioGroup: For choosing one option from a list: use `Select` or `RadioGroup`.
- Renders: Icon
