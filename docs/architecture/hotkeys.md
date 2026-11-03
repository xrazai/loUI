# Hotkeys (GAP-004)

Status: experimental

Keyboard shortcuts come in two layers. `useHotkey` binds one combo to one handler and knows nothing about the others. The registry (`HotkeyProvider`, `useHotkeys`, `useHotkeyScope`, `useRegisteredHotkeys`) knows every shortcut on the page, which makes scopes, conflict detection and generated help possible. `CommandPalette` and `ShortcutsHelp` are built on it.

| Piece                                | Purpose                                                                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `useHotkey(combo, handler, options)` | Unchanged. One combo, optional element `scope` ref. Not listed anywhere.                                                           |
| `HotkeyProvider`                     | Optional. Owns a registry for its subtree (`platform` pins `Mod`). Without it all `useHotkeys` calls share one page-wide registry. |
| `useHotkeys(definitions)`            | Registers shortcuts while the component is mounted. The latest handler always runs; the array may be inline.                       |
| `useHotkeyScope(name, options)`      | Puts a named scope on top of the scope stack while mounted.                                                                        |
| `useRegisteredHotkeys(options)`      | The described shortcuts (active ones by default) for a help list or a command list.                                                |
| `HotkeyRegistry`                     | The store behind them (framework independent, unit tested). Rarely used directly.                                                  |

## Defining shortcuts

```tsx
useHotkeys([
  {
    keys: 'Mod+K',
    handler: openPalette,
    description: 'Open the command palette',
    group: 'General',
    allowInEditable: true,
  },
  { keys: 'F2', handler: createOrder, description: 'Create order', group: 'Orders' },
  { keys: 'N', handler: createOrder }, // works, but is not listed (no description)
  { keys: '1', handler: () => go('/orders'), description: 'Go to orders', group: 'Navigation' },
]);
```

| Field             | Meaning                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `keys`            | `Mod+K`, `F2`, `N`, `1`, `Shift+/`, `Escape`. Modifiers `Mod`, `Ctrl`, `Meta`/`Cmd`, `Alt`/`Option`, `Shift`; one key last. Case-insensitive. Not hard-coded: any combo works, so an ERP can keep F2/F9/N/Enter/Esc/1-4. |
| `handler`         | `(event?: KeyboardEvent) => void`. `event` is `undefined` when the command palette runs the shortcut from its list.                                                                                                      |
| `description`     | What it does. Required to appear in `useRegisteredHotkeys`, the palette and `ShortcutsHelp`.                                                                                                                             |
| `group`           | Heading it is listed under.                                                                                                                                                                                              |
| `scope`           | Default `'global'`. A name, or `'*'` for every scope.                                                                                                                                                                    |
| `allowInEditable` | Fire while an input, textarea, select or contenteditable has focus. Default `false`.                                                                                                                                     |
| `allowInOverlay`  | Fire while focus is inside an open dialog or menu (page-level shortcuts only). Default `false`.                                                                                                                          |
| `allowRepeat`     | Fire on auto-repeat. Default `false`.                                                                                                                                                                                    |
| `preventDefault`  | Default `true`.                                                                                                                                                                                                          |
| `isDisabled`      | Detach without removing the entry.                                                                                                                                                                                       |

## What never fires

- IME composition (`isComposing` or `keyCode 229`), so confirming a candidate with Enter in Japanese or Chinese never triggers `Enter` shortcuts.
- Events another handler already `preventDefault`ed.
- Editable targets, unless `allowInEditable`. Use it for modified combos (`Mod+K`), not for bare letters.
- Auto-repeat, unless `allowRepeat`.

### Keys and your own `onKeyDown`

`Input`, `CurrencyInput`, `Textarea`, `SearchInput` and `Combobox` compose a consumer `onKeyDown` with React Aria. React Aria stops every key that reaches a handler, which would hide F9, F2 or N from `useHotkeys(..., { allowInEditable: true })` while the field has focus. The design system lets a key keep bubbling **unless your handler called `event.preventDefault()`** on it. So: handle a key and claim it with `preventDefault()`; every other key keeps working as a hotkey.

```tsx
<Input
  label="Name"
  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // claimed: not a hotkey
      save();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
    // F9, F2, N ... fall through to useHotkeys({ allowInEditable: true })
  }}
/>
```

Do not call `event.stopPropagation()` (React Aria disables it and logs an error). On `Combobox`, `Enter` and `Escape` already select and close, so only claim them when you mean to replace that behavior.

## `Mod` and the platform

`Mod` is Command on macOS/iOS and Control elsewhere, resolved when the key is pressed, so SSR output and the first client render are never affected. `Kbd` renders the same combo for the platform (`<Kbd keys={hotkeyKeys('Mod+K')} />` or `keyParts` from `useRegisteredHotkeys`). Pin it with `<HotkeyProvider platform="mac" | "other">` in tests and stories.

## Scopes and modals

Only one scope is active at a time: the top of the stack pushed by `useHotkeyScope`, or `global` when the stack is empty.

- `global` shortcuts (the default) fire only when no named scope is active.
- A shortcut with `scope: 'editor'` fires only while `useHotkeyScope('editor')` is mounted and on top.
- `scope: '*'` fires in every scope (help, palette).
- Scopes stack: a nested panel's scope shadows its parent's until it unmounts.

Dialogs, sheets and menus need no scope for this to work: **page-level shortcuts (`global` and `*`) are ignored when the key event comes from inside an open `role="dialog"`, `role="alertdialog"` or `role="menu"`**. React Aria already traps focus in a modal, so the event target is inside it; that also stops `N` from fighting a menu's typeahead. `allowInOverlay: true` opts a shortcut out (for example `Mod+K` if the palette should open over a dialog). A dialog's own shortcuts use a named scope:

```tsx
function EditCustomerDialog() {
  useHotkeyScope('edit-customer');
  useHotkeys([
    {
      keys: 'Mod+Enter',
      handler: save,
      scope: 'edit-customer',
      description: 'Save customer',
      group: 'Dialog',
    },
  ]);
  // ...
}
```

Because the dialog content only mounts while open, the scope exists exactly as long as the dialog.

## Conflicts

Registering the same combo twice in one scope logs a development warning (once per combo and scope) naming both the combo and the scope; the most recently registered shortcut wins and runs alone. `Mod+K` and `Ctrl+K` count as the same combo where `Mod` is Control. The same combo in different scopes is not a conflict. Nothing is logged in production, and a malformed combo throws in development and is ignored in production (the `useHotkey` rule).

## Listing

`useRegisteredHotkeys()` returns `{ id, keys, keyParts, description, group, scope, isActive, run }` for every described, enabled shortcut. By default only the active ones; `{ includeInactive: true }` returns all. `run()` calls the handler without an event. The list updates when shortcuts mount, unmount or the active scope changes and is empty during server rendering.

## SSR

Nothing touches `document` or `navigator` during render or import. The registry attaches one `keydown` listener to `document` when the first shortcut registers (in an effect) and removes it when the last one goes. `useRegisteredHotkeys` uses `useSyncExternalStore` with an empty server snapshot.

## Not covered

- Key sequences ("G then I"), chords across keystrokes and user-remappable shortcuts.
- Shortcuts inside iframes or shadow roots other than the document's own.
