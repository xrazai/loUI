# SubMenu

> An item that opens a nested menu. Arrow Right (Arrow Left in right-to-left) opens it and
> Arrow Left closes it; Escape closes the submenu first, then the menu.

A menu of commands that opens from a trigger. Built on React Aria `MenuTrigger`, `Popover` and `Menu`. Exports `Menu`, `MenuItem`, `MenuSection`, `MenuSeparator`, `SubMenu` and `MoreActionsMenu`.

- Handoff source: `components/navigation/Menu` (CMP-NAV-02).

- Import: `import { SubMenu } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Menu/Menu.tsx`
- Stories (Storybook title `Components/Menu`): Default, EscapeRestoresFocus, TypeaheadAndHomeEnd, Open, CheckboxItems, RadioItems, WithSections, WithSubmenu, LongLabels, MoreActions

## Props

| Prop         | Type        | Required | Default | Description                                                                                                |
| ------------ | ----------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `label`      | `ReactNode` | yes      |         | Label of the item that opens the submenu; end it with an ellipsis when it opens more choices ("Move to…"). |
| `children`   | `ReactNode` | yes      |         | `MenuItem`, `MenuSection` and `MenuSeparator` elements of the submenu.                                     |
| `textValue`  | `string`    |          |         | Used for typeahead and as the item's name when `label` is not a string.                                    |
| `isDisabled` | `boolean`   |          |         | Disables the item: it cannot be opened or focused by typeahead.                                            |
| `delay`      | `number`    |          |         | Milliseconds the pointer must rest on the item before the submenu opens. Default 200.                      |
| `className`  | `string`    |          |         | Class name for the submenu list.                                                                           |

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-danger-soft-hover`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-menu-indicator-size`, `--ds-menu-min-width`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-pill`, `--ds-radius-sm`, `--ds-select-popover-max-height`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-4`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-tracking-caption`

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
- The shortcut hint is visual; bind the key yourself. It uses `--ds-text-2` because `--ds-text-3` fails 4.5:1 on the raised surface.
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

## Related components

- Instead, see Select: Choosing a value for a field: use `Select` or `Combobox`.
- Instead, see Combobox: Choosing a value for a field: use `Select` or `Combobox`.
- Instead, see Popover: Content the user types into or operates (filters, forms): use `Popover`.
- Instead, see Tabs: Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- Instead, see Sidebar: Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- Instead, see Breadcrumb: Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- Renders: Icon, IconButton
