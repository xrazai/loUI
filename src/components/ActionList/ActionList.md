# ActionList

Status: experimental

A vertical list of records. Each row has an optional leading node, a title, an optional description, a mono meta value and an optional "more actions" menu. Built on React Aria `GridList`, so rows are reachable with the arrow keys and can run an action.

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

## Differences from the handoff

- Real list semantics and keyboard support (`GridList`) instead of clickable `div`s; rows can be activated with `Enter`.
- The `···` button is the shared `MoreActionsMenu` (label from messages, names the row, `Menu` keyboard model) instead of a hand-made popover.
- `actions` is a `MenuItem` node (composition) instead of an array of `{ label, danger, separator }`; `onItemClick` is `onAction`; `title`/`description`/`meta` accept nodes.
- Text uses `text-2` for descriptions (contrast stays above 4.5:1 on hover and raised surfaces).
- Empty state and disabled rows added. Drag handle is not included.
