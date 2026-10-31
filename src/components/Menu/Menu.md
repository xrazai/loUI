# Menu

Status: experimental

A menu of commands that opens from a trigger. Built on React Aria `MenuTrigger`, `Popover` and `Menu`. Exports `Menu`, `MenuItem`, `MenuSection`, `MenuSeparator`, `SubMenu` and `MoreActionsMenu`.

- Handoff source: `components/navigation/Menu` (CMP-NAV-02).

## When to use

- Row, card or toolbar actions that do not deserve their own button.
- View options with check or radio items (columns shown, sort order, density).

## When not to use

- Choosing a value for a field: use `Select` or `Combobox`.
- Content the user types into or operates (filters, forms): use `Popover`.
- Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- The only way to reach an important action: keep primary actions visible.

## Anatomy

```
MenuTrigger
  trigger            Button | IconButton    aria-haspopup=true, aria-expanded
  Popover            raised surface, radius lg, overlay shadow, z popover
    Menu             role=menu, named by the trigger (aria-labelledby)
      MenuItem       role=menuitem | menuitemcheckbox | menuitemradio, height --ds-item-h
        indicator    check / dot (selectable menus)
        label
        shortcut     mono hint, optional
        chevron      when it opens a SubMenu
      MenuSection    role=group, caption optional (mono uppercase)
      MenuSeparator  1px line
```

## Props

`Menu`

| Prop                                      | Type                               | Default        | Notes                                                    |
| ----------------------------------------- | ---------------------------------- | -------------- | -------------------------------------------------------- |
| `trigger`                                 | `ReactElement`                     | none           | A `Button` or `IconButton`. Its name becomes the menu's. |
| `children`                                | `ReactNode`                        | none           | Items, sections, separators, submenus.                   |
| `placement`                               | React Aria `Placement`             | `bottom start` | Flips on collision.                                      |
| `onAction`                                | `(key) => void`                    |                | Called for plain items with their `id`.                  |
| `selectionMode`                           | `'none' \| 'single' \| 'multiple'` | `none`         | `single` = radio items, `multiple` = checkbox items.     |
| `selectedKeys` / `defaultSelectedKeys`    | `Selection`                        |                | Controlled / uncontrolled selection.                     |
| `onSelectionChange`                       | `(keys) => void`                   |                |                                                          |
| `isOpen` / `defaultOpen` / `onOpenChange` |                                    |                | Controlled / uncontrolled open state.                    |

`MenuItem`: `id`, `children` (label), `tone` (`neutral` | `danger`), `shortcut`, `isDisabled`, `onAction`, `href`, `textValue`.
`MenuSection`: `title` (caption and accessible name), own `selectionMode` for a radio group inside a command menu.
`SubMenu`: `label`, `children`, `textValue`, `isDisabled`, `delay`.
`MoreActionsMenu`: a `Menu` with an `IconButton` (ellipsis) trigger named "More actions" from the catalog; `size`, `messages`, default placement `bottom end`.

## Accessibility

Keyboard contract (AGENTS.md section 8):

| Key                                     | Behavior                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| `Enter`, `Space`, `ArrowDown` (trigger) | Opens the menu and focuses the first item                       |
| `ArrowUp` (trigger)                     | Opens the menu and focuses the last item                        |
| `ArrowUp` / `ArrowDown`                 | Move between items; disabled items are skipped                  |
| `Home` / `End`                          | First / last item                                               |
| Typing                                  | Typeahead: focus moves to the item whose label starts with it   |
| `Enter` / `Space`                       | Activates the item (checkbox and radio items toggle) and closes |
| `ArrowRight` / `ArrowLeft`              | Open / close a submenu (mirrored in right-to-left)              |
| `Escape`                                | Closes one level; focus returns to the trigger                  |

- Items are real `menuitem`, `menuitemcheckbox` or `menuitemradio` elements with `aria-checked`; the handoff used `tabIndex=0` divs with no keyboard activation.
- Danger is red text plus the item's own label ("Delete order"); the colour is never the only signal. `tone="danger"` does not confirm: open a `ConfirmDialog` from `onAction`.
- The shortcut hint is visual; bind the key yourself. It uses `--ds-text-2` so the hint stays legible next to the label.
- Focus is shown with the accent ring; forced colors use a `Highlight` outline.
- Layer: `--ds-z-popover` (see Dialog doc, "Layers", for menus opened inside a Dialog or Sheet).
- The `MoreActionsMenu` trigger has a tooltip that repeats its name.

## Content rules

- Items are a verb plus object in sentence case ("Duplicate order"). End with an ellipsis only when the item opens something that needs more input ("Move to…").
- Order: most common first, destructive last, separated by a `MenuSeparator`.

## Examples

```tsx
<MoreActionsMenu onAction={(key) => run(String(key))}>
  <MenuItem id="edit" shortcut="Ctrl+E">Edit order</MenuItem>
  <MenuItem id="duplicate">Duplicate order</MenuItem>
  <MenuSeparator />
  <MenuItem id="delete" tone="danger">Delete order</MenuItem>
</MoreActionsMenu>

<Menu trigger={<Button>View</Button>} selectionMode="multiple" defaultSelectedKeys={['id']}>
  <MenuItem id="id">Show ID</MenuItem>
  <MenuItem id="status">Show status</MenuItem>
</Menu>
```

## Differences from the handoff

- React Aria provides roving focus, typeahead, activation, selection and focus restore; the handoff menu was a list of divs with click handlers.
- The trigger is part of the component (`trigger` prop); the handoff `Menu` was a bare list placed by the caller.
- New: selection modes, sections, submenus, disabled items, `MoreActionsMenu`.
- The handoff `width` prop is replaced by `--ds-menu-min-width` (grows with content, at least the trigger width).
