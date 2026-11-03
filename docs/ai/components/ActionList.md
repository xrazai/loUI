# ActionList

> A vertical list of records, each with a title, optional description, a mono meta value and a
> "more actions" menu, with optional row checkboxes (`selectionMode="multiple"`). Built on React Aria `GridList`: rows are reached with the arrow keys
> (one tab stop for the list), `Enter` runs `onAction`, and `Tab` or the right arrow moves
> from a row to its menu button.

A vertical list of records. Each row has an optional leading node, a title, an optional description, a mono meta value and an optional "more actions" menu. Built on React Aria `GridList`, so rows are reachable with the arrow keys and can run an action.

- Import: `import { ActionList } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ActionList/ActionList.tsx`
- Stories (Storybook title `Components/ActionList`): Default, Actionable, KeyboardNavigation, RowMenu, Borderless, WithLeadingAndLongText, DisabledRow, Empty, CustomEmpty, PortugueseBrazil, WithCheckboxes, CheckboxWithRowActionAndMenu, TaskRows, DoneRows, CheckboxesLongText, CheckboxesDisabledRow, ToggleWithUndo

## Props

| Prop                  | Type                                                                                                                               | Required | Default  | Description                                                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`               | `readonly ActionListItem[]`                                                                                                        | yes      |          | The rows, in the order given. The list never sorts: lists are alphabetical by default in this design system, so sort with `sortByText` before passing them (tasks by urgency and dated records newest first are the exceptions).          |
| `className`           | `string`                                                                                                                           |          |          | Class name for the list root.                                                                                                                                                                                                             |
| `ref`                 | `Ref<HTMLDivElement>`                                                                                                              |          |          | Ref to the list root element.                                                                                                                                                                                                             |
| `onAction`            | `(item: ActionListItem) => void`                                                                                                   |          |          | Called when the user activates a row (click, or Enter on the focused row). Makes the whole row a press target with hover and pointer cursor. The menu button does not trigger it.                                                         |
| `selectionMode`       | `'none' \| 'multiple'`                                                                                                             |          | `'none'` | Adds a checkbox at the start of every row. `'multiple'` toggles rows independently (the checkbox toggles, the row still runs `onAction`). Default `'none'`.                                                                               |
| `selectedKeys`        | `"all" \| Iterable<Key>`                                                                                                           |          |          | Controlled selected row ids. Use together with `onSelectionChange`.                                                                                                                                                                       |
| `defaultSelectedKeys` | `"all" \| Iterable<Key>`                                                                                                           |          |          | Initially selected row ids (uncontrolled).                                                                                                                                                                                                |
| `onSelectionChange`   | `(keys: Selection) => void`                                                                                                        |          |          | Called when the checkbox of a row is toggled (click, or `Space` on the focused row or checkbox). The list never shows an Undo toast itself: update your state, then call `toastWithUndo` (reversible toggles never ask for confirmation). |
| `bordered`            | `boolean`                                                                                                                          |          | `true`   | Draws the border, surface and radius around the list. Turn off inside a `Card`. Default `true`.                                                                                                                                           |
| `emptyState`          | `ReactNode`                                                                                                                        |          |          | Content when `items` is empty. Default: an `EmptyState` with built-in text.                                                                                                                                                               |
| `messages`            | `Partial<{ moreActions: (title: string) => string; select: string; done: string; emptyTitle: string; emptyDescription: string; }>` |          |          | Per-instance overrides of the built-in messages.                                                                                                                                                                                          |
| `aria-label`          | `string`                                                                                                                           |          |          | Accessible name of the list. Required unless `aria-labelledby` is set.                                                                                                                                                                    |
| `aria-labelledby`     | `string`                                                                                                                           |          |          | Id of the element that names the list (a visible heading).                                                                                                                                                                                |

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

| Key                          | English default                      | Notes                                                                                                                                          |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `moreActions(title: string)` | `More actions for {title}`           | Accessible name of the row actions button. `title` is the text of the row ("More actions for Price list").                                     |
| `select`                     | `Select`                             | Start of the accessible name of a row checkbox. React Aria appends the text of the row ("Select" + "Price list 2026"), so keep it a bare verb. |
| `done`                       | `Done`                               | Visually hidden text added to a row marked `isDone`, read after the title.                                                                     |
| `emptyTitle`                 | `No items found`                     | Title of the default empty state.                                                                                                              |
| `emptyDescription`           | `Try another filter or search term.` | Description of the default empty state.                                                                                                        |

## Design tokens used

`--ds-accent`, `--ds-font-mono`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-label`, `--ds-line`, `--ds-line-subtle`, `--ds-radius-lg`, `--ds-row-h`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-row-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`

## When to use

- Short lists of things with a few actions each: files, saved filters, members, recent items.
- One main line of text per record, with secondary detail.

## When not to use

- Many comparable columns or sorting: use `DataTable`.
- Navigation between pages: use `NavItem` or `Tabs`.
- Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.

## Anatomy

```
div[role=grid]            named by aria-label / aria-labelledby
  div[role=row]           one tab stop for the whole list; arrow keys move between rows
    Checkbox  selection   optional (selectionMode="multiple"), named "Select {title}"
    span  leading         optional (Avatar, Icon)
    span  title / description
    span  meta            mono, text-2; a node: a module label plus a Badge / DueIndicator
    MoreActionsMenu       IconButton "More actions for {title}" + Menu (optional)
```

In a list 480 px wide or narrower (a container query on the list, not the viewport), `meta` moves under the title and description, so a long title keeps its width instead of shrinking to a few characters next to a due chip.

## Props (key ones)

| Prop                                   | Type                        | Default  | Notes                                                                                           |
| -------------------------------------- | --------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `items`                                | `ActionListItem[]`          | -        | `id`, `title`, `textValue`, `description`, `meta`, `leading`, `actions`, `isDisabled`, `isDone` |
| `aria-label`                           | `string`                    | -        | Required (or `aria-labelledby`)                                                                 |
| `onAction`                             | `(item) => void`            |          | Row click or Enter. Makes the row a press target                                                |
| `selectionMode`                        | `'none' \| 'multiple'`      | `'none'` | `'multiple'` adds a checkbox to every row (toggle behavior)                                     |
| `selectedKeys` / `defaultSelectedKeys` | `'all' \| Iterable<Key>`    |          | Controlled / initial selected row ids                                                           |
| `onSelectionChange`                    | `(keys: Selection) => void` |          | Called when a checkbox is toggled. The consumer owns Undo                                       |
| `bordered`                             | `boolean`                   | `true`   | Border, surface and radius. Turn off inside a `Card`                                            |
| `emptyState`                           | `ReactNode`                 |          | Default: compact `EmptyState` with built-in text                                                |
| `messages`                             | `Partial<messages>`         |          | `moreActions(title)`, `select`, `done`, `emptyTitle`, `emptyDescription`                        |

`actions` is a node: `MenuItem`, `MenuSection` and `MenuSeparator` elements from `Menu`. Put the handler on the item (`<MenuItem onAction={...}>`). Destructive items use `tone="danger"` and still ask for confirmation in a dialog.

The list renders `items` in the order given. Lists are alphabetical by default in this design system: pass them through `sortByText` first (exceptions: tasks by urgency, dated records newest first).

## Checkbox rows and done state

```tsx
const [done, setDone] = useState<Set<string>>(new Set());

<ActionList
  aria-label="Tasks"
  selectionMode="multiple"
  selectedKeys={done}
  onSelectionChange={(keys) => {
    if (keys === 'all') return;
    const before = done;
    setDone(new Set([...keys].map(String)));
    toastWithUndo('Task updated', { onUndo: () => setDone(before) });
  }}
  onAction={(task) => openTask(task.id)}
  items={tasks.map((task) => ({
    id: task.id,
    title: task.name,
    isDone: done.has(task.id),
    meta: (
      <>
        <span>{task.module}</span>
        <DueIndicator date={task.due} />
      </>
    ),
    actions: <MenuItem onAction={() => edit(task)}>Edit task</MenuItem>,
  }))}
/>;
```

- `isDone` and the checkbox are independent: the list does not derive one from the other. A to-do usually passes `isDone: selected` as above.
- `isDone` sets the title to `text-3` with a line-through (also in forced colors) and adds a visually hidden "Done" after the title (`messages.done`), so the state is never color or decoration alone.
- Toggling is reversible, so it never asks for confirmation. The list does not toggle silently with undo built in: show `toastWithUndo` from `onSelectionChange` as above.

## Design note (GAP-017, GAP-015)

Decision: extend `ActionList`; no separate `CheckList`. A checkbox list is the same anatomy (title, description, meta, menu) plus a leading control, and consumers need both the checkbox and the row action, which is what `GridList` models. Only `selectionMode: 'none' | 'multiple'` is exposed with `selectionBehavior="toggle"` fixed; `single` is a different pattern (`RadioGroup`, `ListBox`). The "control, module label, due chip, actions" row is built with the existing slots: the checkbox is the selection control, `meta` accepts nodes (module label plus `Badge` or `DueIndicator`), `actions` is the menu. No new slot was needed.

React Aria turns a row into a pure selection toggle as soon as one row is selected, which would silence `onAction`. With `selectionMode="multiple"` the list therefore handles the row action itself (click on the row content, `Enter` on the focused row), so it works whether or not rows are selected. Only the checkbox and `Space` toggle selection.

## Accessibility

- `GridList` gives `role="grid"` with `row` and `gridcell` roles; rows are not a `list`/`listitem` pair because they are focusable and actionable.
- Keyboard: `Tab` enters the list on one row (one tab stop); Arrow Up/Down, Home and End move between rows; Arrow Right moves from the row to its menu button (Arrow Left back); `Enter` on a row runs `onAction`; the menu button follows the Menu contract (`Enter`/`Space`/`Arrow Down` opens, `Escape` closes and focus returns to the button).
- With `selectionMode="multiple"`: `Space` on the focused row (or on its checkbox) toggles it, `Enter` and a click on the row content run `onAction`, a click on the checkbox toggles. Each checkbox is named "Select {title}" (React Aria composes the message `select` with the row text). `Tab`/`ArrowRight` moves from the row to its checkbox and menu button.
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

- Instead, see DataTable: Many comparable columns or sorting: use `DataTable`.
- Instead, see NavItem: Navigation between pages: use `NavItem` or `Tabs`.
- Instead, see Tabs: Navigation between pages: use `NavItem` or `Tabs`.
- Instead, see RadioGroup: Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.
- Instead, see CheckboxGroup: Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.
- Instead, see Select: Choosing options in a form: use `RadioGroup`, `CheckboxGroup` or `Select`.
- Renders: Checkbox, EmptyState, MoreActionsMenu, VisuallyHidden
