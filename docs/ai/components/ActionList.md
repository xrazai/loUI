# ActionList

> A vertical list of records, each with a title, optional description, a mono meta value and a
> "more actions" menu. Built on React Aria `GridList`: rows are reached with the arrow keys
> (one tab stop for the list), `Enter` runs `onAction`, and `Tab` or the right arrow moves
> from a row to its menu button.

A vertical list of records. Each row has an optional leading node, a title, an optional description, a mono meta value and an optional "more actions" menu. Built on React Aria `GridList`, so rows are reachable with the arrow keys and can run an action.

- Import: `import { ActionList } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ActionList/ActionList.tsx`
- Stories (Storybook title `Components/ActionList`): Default, Actionable, KeyboardNavigation, RowMenu, Borderless, WithLeadingAndLongText, DisabledRow, Empty, CustomEmpty, PortugueseBrazil

## Props

| Prop              | Type                                                                                                 | Required | Default | Description                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`           | `readonly ActionListItem[]`                                                                          | yes      |         | The rows, in the order given. The list never sorts: lists are alphabetical by default in this design system, so sort with `sortByText` before passing them (tasks by urgency and dated records newest first are the exceptions). |
| `className`       | `string`                                                                                             |          |         | Class name for the list root.                                                                                                                                                                                                    |
| `ref`             | `Ref<HTMLDivElement>`                                                                                |          |         | Ref to the list root element.                                                                                                                                                                                                    |
| `onAction`        | `(item: ActionListItem) => void`                                                                     |          |         | Called when the user activates a row (click, or Enter on the focused row). Makes the whole row a press target with hover and pointer cursor. The menu button does not trigger it.                                                |
| `bordered`        | `boolean`                                                                                            |          | `true`  | Draws the border, surface and radius around the list. Turn off inside a `Card`. Default `true`.                                                                                                                                  |
| `emptyState`      | `ReactNode`                                                                                          |          |         | Content when `items` is empty. Default: an `EmptyState` with built-in text.                                                                                                                                                      |
| `messages`        | `Partial<{ moreActions: (title: string) => string; emptyTitle: string; emptyDescription: string; }>` |          |         | Per-instance overrides of the built-in messages.                                                                                                                                                                                 |
| `aria-label`      | `string`                                                                                             |          |         | Accessible name of the list. Required unless `aria-labelledby` is set.                                                                                                                                                           |
| `aria-labelledby` | `string`                                                                                             |          |         | Id of the element that names the list (a visible heading).                                                                                                                                                                       |

### Inherited props

- From `AriaGridListProps` (react-aria): `escapeKeyBehavior`, `keyboardNavigationBehavior`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`
- From `DOMProps` (@react-types/shared): `id`
- From `GridListProps` (react-aria): `autoFocus`, `disabledBehavior`, `shouldSelectOnPressUp`
- From `GridListProps` (react-aria-components): `disallowTypeAhead`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ActionList: { ... } }}>`.

| Key                          | English default                      | Notes                                                                                                      |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `moreActions(title: string)` | `More actions for {title}`           | Accessible name of the row actions button. `title` is the text of the row ("More actions for Price list"). |
| `emptyTitle`                 | `No items found`                     | Title of the default empty state.                                                                          |
| `emptyDescription`           | `Try another filter or search term.` | Description of the default empty state.                                                                    |

## Design tokens used

`--ds-accent`, `--ds-font-mono`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-label`, `--ds-line`, `--ds-line-subtle`, `--ds-radius-lg`, `--ds-row-h`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-row-hover`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`

## When to use

- Short lists of things with a few actions each: files, saved filters, members, recent items.
- One main line of text per record, with secondary detail.

## When not to use

- Many comparable columns, sorting or selection: use `DataTable`.
- Navigation between pages: use `NavItem` or `Tabs`.
- Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.

## Anatomy

```
div[role=grid]            named by aria-label / aria-labelledby
  div[role=row]           one tab stop for the whole list; arrow keys move between rows
    span  leading         optional (Avatar, Icon)
    span  title / description
    span  meta            mono, text-2
    MoreActionsMenu       IconButton "More actions for {title}" + Menu (optional)
```

## Props (key ones)

| Prop         | Type                | Default | Notes                                                                                 |
| ------------ | ------------------- | ------- | ------------------------------------------------------------------------------------- |
| `items`      | `ActionListItem[]`  | -       | `id`, `title`, `textValue`, `description`, `meta`, `leading`, `actions`, `isDisabled` |
| `aria-label` | `string`            | -       | Required (or `aria-labelledby`)                                                       |
| `onAction`   | `(item) => void`    |         | Row click or Enter. Makes the row a press target                                      |
| `bordered`   | `boolean`           | `true`  | Border, surface and radius. Turn off inside a `Card`                                  |
| `emptyState` | `ReactNode`         |         | Default: compact `EmptyState` with built-in text                                      |
| `messages`   | `Partial<messages>` |         | `moreActions(title)`, `emptyTitle`, `emptyDescription`                                |

`actions` is a node: `MenuItem`, `MenuSection` and `MenuSeparator` elements from `Menu`. Put the handler on the item (`<MenuItem onAction={...}>`). Destructive items use `tone="danger"` and still ask for confirmation in a dialog.

The list renders `items` in the order given. Lists are alphabetical by default in this design system: pass them through `sortByText` first (exceptions: tasks by urgency, dated records newest first).

## Accessibility

- `GridList` gives `role="grid"` with `row` and `gridcell` roles; rows are not a `list`/`listitem` pair because they are focusable and actionable.
- Keyboard: `Tab` enters the list on one row (one tab stop); Arrow Up/Down, Home and End move between rows; Arrow Right moves from the row to its menu button (Arrow Left back); `Enter` on a row runs `onAction`; the menu button follows the Menu contract (`Enter`/`Space`/`Arrow Down` opens, `Escape` closes and focus returns to the button).
- Every menu button has its own name ("More actions for Price list 2026") so a screen reader user can tell them apart.
- Row actions never rely on color; the meta value is text. Disabled rows are dimmed and skipped.
- Known quirk: React Aria moves focus to the row after an overlay inside a row closes. The component hands focus back to the button that was pressed.

## Content rules

- Titles are the record name, not a sentence. Descriptions say who or when ("Updated by Ana").
- Menu items are verb + object ("Download file", "Delete file").

## Examples

```tsx
<ActionList
  aria-label="Files"
  items={sortByText(files, (f) => f.name, locale).map((file) => ({
    id: file.id,
    title: file.name,
    description: `Updated by ${file.author}`,
    meta: formatBytes(file.size),
    actions: (
      <>
        <MenuItem onAction={() => download(file)}>Download file</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onAction={() => askToDelete(file)}>
          Delete file
        </MenuItem>
      </>
    ),
  }))}
  onAction={(item) => openFile(item.id)}
/>
```

## Related components

- Instead, see DataTable: Many comparable columns, sorting or selection: use `DataTable`.
- Instead, see NavItem: Navigation between pages: use `NavItem` or `Tabs`.
- Instead, see Tabs: Navigation between pages: use `NavItem` or `Tabs`.
- Instead, see RadioGroup: Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.
- Instead, see CheckboxGroup: Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.
- Instead, see Select: Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.
- Renders: EmptyState, MoreActionsMenu
