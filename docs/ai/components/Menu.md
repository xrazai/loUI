# Menu

> A menu of commands that opens from a trigger, built on React Aria `MenuTrigger`, `Popover`
> and `Menu`.

Keys: the trigger opens it with Enter, Space or Arrow Down (focus goes to the first item;
Arrow Up focuses the last); Arrow Up/Down, Home/End and typeahead move; Enter or Space
activates; Escape closes and focus returns to the trigger. Selection modes
(`selectionMode="single"` or `"multiple"`) turn items into radio or checkbox items.

A menu of commands that opens from a trigger. Built on React Aria `MenuTrigger`, `Popover` and `Menu`. Exports `Menu`, `MenuItem`, `MenuSection`, `MenuSeparator`, `SubMenu` and `MoreActionsMenu`.

- Handoff source: `components/navigation/Menu` (CMP-NAV-02).

- Import: `import { Menu } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Menu/Menu.tsx`
- Stories (Storybook title `Components/Menu`): Default, EscapeRestoresFocus, TypeaheadAndHomeEnd, Open, CheckboxItems, RadioItems, WithSections, WithSubmenu, LongLabels, MoreActions

## Props

| Prop               | Type                                                                                                                                                                                                                                                                                                                     | Required | Default          | Description                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger`          | `ReactElement<unknown, string \| JSXElementConstructor<any>>`                                                                                                                                                                                                                                                            | yes      |                  | The element that opens the menu: a `Button` or `IconButton`. It receives `aria-haspopup`, `aria-expanded` and names the menu (`aria-labelledby`), so give it a clear name. |
| `children`         | `ReactNode`                                                                                                                                                                                                                                                                                                              | yes      |                  | `MenuItem`, `MenuSection`, `MenuSeparator` and `SubMenu` elements.                                                                                                         |
| `placement`        | `'bottom' \| 'bottom left' \| 'bottom right' \| 'bottom start' \| 'bottom end' \| 'top' \| 'top left' \| 'top right' \| 'top start' \| 'top end' \| 'left' \| 'left top' \| 'left bottom' \| 'start' \| 'start top' \| 'start bottom' \| 'right' \| 'right top' \| 'right bottom' \| 'end' \| 'end top' \| 'end bottom'` |          | `'bottom start'` | Side and alignment relative to the trigger. Default `bottom start`. Flips on collision.                                                                                    |
| `isOpen`           | `boolean`                                                                                                                                                                                                                                                                                                                |          |                  | Controlled open state. Pair with `onOpenChange`.                                                                                                                           |
| `defaultOpen`      | `boolean`                                                                                                                                                                                                                                                                                                                |          |                  | Initial open state when uncontrolled.                                                                                                                                      |
| `onOpenChange`     | `(isOpen: boolean) => void`                                                                                                                                                                                                                                                                                              |          |                  | Called when the menu opens or closes.                                                                                                                                      |
| `className`        | `string`                                                                                                                                                                                                                                                                                                                 |          |                  | Class name for the menu list.                                                                                                                                              |
| `popoverClassName` | `string`                                                                                                                                                                                                                                                                                                                 |          |                  | Class name for the popover that holds the menu.                                                                                                                            |
| `ref`              | `Ref<HTMLDivElement>`                                                                                                                                                                                                                                                                                                    |          |                  | Ref to the menu list element.                                                                                                                                              |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `AriaMenuProps` (react-aria): `escapeKeyBehavior`
- From `CollectionBase` (@react-types/shared): `disabledKeys`, `items`
- From `CollectionProps` (react-aria-components): `dependencies`
- From `DOMProps` (@react-types/shared): `id`
- From `MenuProps` (react-aria): `autoFocus`, `onAction`, `onClose`, `shouldFocusWrap`
- From `MenuProps` (react-aria-components): `renderEmptyState`, `shouldCloseOnSelect`
- From `MultipleSelection` (@react-types/shared): `defaultSelectedKeys`, `disallowEmptySelection`, `onSelectionChange`, `selectedKeys`, `selectionMode`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Menu: { ... } }}>`.

| Key           | English default | Notes                                             |
| ------------- | --------------- | ------------------------------------------------- |
| `moreActions` | `More actions`  | Name of the overflow button of `MoreActionsMenu`. |

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-danger-soft-hover`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-menu-indicator-size`, `--ds-menu-max-width`, `--ds-menu-min-width`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-radius-pill`, `--ds-radius-sm`, `--ds-select-popover-max-height`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-4`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-tracking-caption`

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

## Related components

- Instead, see Select: Choosing a value for a field: use `Select` or `Combobox`.
- Instead, see Combobox: Choosing a value for a field: use `Select` or `Combobox`.
- Instead, see Popover: Content the user types into or operates (filters, forms): use `Popover`.
- Instead, see Tabs: Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- Instead, see Sidebar: Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- Instead, see Breadcrumb: Navigation between pages: use `Tabs`, `Sidebar` or `Breadcrumb`.
- Renders: Icon, IconButton
