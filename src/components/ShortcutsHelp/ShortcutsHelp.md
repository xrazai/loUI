# ShortcutsHelp

Status: experimental

A dialog that lists the keyboard shortcuts registered on the page, one table per group, with the keys drawn by `Kbd`. It opens with `?` by default.

## When to use

- Once per app (or per module), next to the `CommandPalette`, so users can learn the shortcuts without leaving the page.

## When not to use

- To register shortcuts: use `useHotkeys`. This only lists what is registered.
- As the only way to find a command: the `CommandPalette` also searches by name.

## Anatomy

```
Dialog "Keyboard shortcuts"  (size md, Close button)
  table  caption = group
    tr   th[scope=row] description · td Kbd keys
```

## Props

| Prop              | Type                        | Default | Notes                                                                |
| ----------------- | --------------------------- | ------- | -------------------------------------------------------------------- |
| `isOpen`          | `boolean`                   | -       | Controlled open state. Pair with `onOpenChange`                      |
| `defaultOpen`     | `boolean`                   | `false` | Initial state when uncontrolled                                      |
| `onOpenChange`    | `(isOpen: boolean) => void` | -       | Called on open (from the hotkey) and close                           |
| `hotkey`          | `string \| false`           | `'?'`   | Registered in the hotkey registry. Not fired while typing in a field |
| `includeInactive` | `boolean`                   | `false` | Also lists shortcuts whose scope is not active now                   |
| `messages`        | `Partial<messages>`         | -       | Per-instance overrides                                               |

## Behavior

- Lists shortcuts that have a `description` (`useHotkeys`). Groups are sorted with the locale; shortcuts without a `group` go under "Other", last. Rows are sorted by description.
- Updates while it is open: shortcuts that mount or unmount appear or disappear.
- It lists itself ("Show keyboard shortcuts") and the `CommandPalette` shortcut.
- While it is open, page shortcuts do not fire.

## Accessibility

- A modal `dialog` named "Keyboard shortcuts" with a description; focus is trapped and returns on close.
- Each group is a real `<table>` named by its `<caption>`; the description is the row header, the keys are the cell. The column headers exist for screen readers and are visually hidden.
- Keys use `Kbd`, with spoken names for symbols.
- `Escape` and the Close button close it.

## Content rules

- Descriptions are verb plus object in sentence case ("Create order"), as in the command palette.
- Messages: `title`, `description`, `ungrouped`, `empty`, `close`, `action`, `keys`, `openDescription`, `openGroup`. English and pt-BR ship.

## Examples

```tsx
<HotkeyProvider>
  <App />
  <ShortcutsHelp />
</HotkeyProvider>
```

## Differences from the handoff

- The handoff drew a static keyboard card. This list is generated from the registry, so it cannot drift from the real shortcuts.
