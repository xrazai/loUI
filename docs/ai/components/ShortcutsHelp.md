# ShortcutsHelp

> A dialog that lists the registered keyboard shortcuts (`useHotkeys` with a `description`),
> grouped by their `group`, one table per group with the keys drawn by `Kbd`. Opens with `?` by
> default. Place it once, anywhere under the app, and it stays in sync with what is mounted.

A dialog that lists the keyboard shortcuts registered on the page, one table per group, with the keys drawn by `Kbd`. It opens with `?` by default.

- Import: `import { ShortcutsHelp } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/ShortcutsHelp/ShortcutsHelp.tsx`
- Stories (Storybook title `Components/ShortcutsHelp`): Default, Open, Empty, PortugueseBrazil

## Props

| Prop              | Type                                                                                                                                                                          | Required | Default | Description                                                                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isOpen`          | `boolean`                                                                                                                                                                     |          |         | Controlled open state. Pair with `onOpenChange`.                                                                                                                                                                               |
| `defaultOpen`     | `boolean`                                                                                                                                                                     |          | `false` | Initial open state when uncontrolled.                                                                                                                                                                                          |
| `onOpenChange`    | `((isOpen: boolean) => void)`                                                                                                                                                 |          |         | Called when the dialog opens (from the hotkey) or closes.                                                                                                                                                                      |
| `hotkey`          | `string \| false`                                                                                                                                                             |          | `?`     | The shortcut that opens the dialog, registered in the hotkey registry. Default `'?'`. It does not fire while an input has focus, so typing a question mark still works. Pass `false` to open the dialog only through `isOpen`. |
| `includeInactive` | `boolean`                                                                                                                                                                     |          | `false` | Also list shortcuts whose scope is not active right now. Default `false`.                                                                                                                                                      |
| `messages`        | `Partial<{ title: string; description: string; ungrouped: string; empty: string; close: string; action: string; keys: string; openDescription: string; openGroup: string; }>` |          |         | Message overrides for this instance.                                                                                                                                                                                           |
| `className`       | `string`                                                                                                                                                                      |          |         | Class name for the dialog panel.                                                                                                                                                                                               |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ShortcutsHelp: { ... } }}>`.

| Key               | English default                       | Notes                                              |
| ----------------- | ------------------------------------- | -------------------------------------------------- |
| `title`           | `Keyboard shortcuts`                  | Title of the dialog.                               |
| `description`     | `Shortcuts that work on this page.`   | Description under the title.                       |
| `ungrouped`       | `Other`                               | Heading for shortcuts that have no `group`.        |
| `empty`           | `No keyboard shortcuts on this page.` | Shown when no shortcut is registered.              |
| `close`           | `Close`                               | Label of the button that closes the dialog.        |
| `action`          | `Action`                              | Column header: what the shortcut does.             |
| `keys`            | `Shortcut`                            | Column header: the keys.                           |
| `openDescription` | `Show keyboard shortcuts`             | Description of the shortcut that opens the dialog. |
| `openGroup`       | `General`                             | Group of the shortcut that opens the dialog.       |

## Design tokens used

`--ds-font-mono`, `--ds-fs-caption`, `--ds-lh-caption`, `--ds-line-subtle`, `--ds-space-1`, `--ds-space-2`, `--ds-space-4`, `--ds-text`, `--ds-text-2`, `--ds-tracking-caption`, `--ds-weight-regular`

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

## Related components

- Instead, see CommandPalette: As the only way to find a command: the `CommandPalette` also searches by name.
- Renders: Button, Dialog, Kbd, VisuallyHidden
