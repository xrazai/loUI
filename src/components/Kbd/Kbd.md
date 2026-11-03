# Kbd

Status: experimental

A keyboard shortcut hint in mono type. It renders a real `<kbd>` element.

## When to use

- Next to a command, menu item or button to show its shortcut: "Search `Ctrl K`".
- In help text and tooltips that name a key.

## When not to use

- To register the shortcut: use `useHotkey`. `Kbd` only displays it.
- For code or file names: use `<code>`.

## Anatomy

```
kbd.root (border, mono)
  kbd.key   symbol or text   (aria-hidden when a spoken name replaces it)
            VisuallyHidden   spoken name ("Command")
  kbd.key   K
```

## Props

| Prop       | Type                       | Default  | Notes                                                                     |
| ---------- | -------------------------- | -------- | ------------------------------------------------------------------------- |
| `keys`     | `readonly string[]`        | -        | The keys of one shortcut, in order (`['Mod', 'K']`). Use this or children |
| `children` | `ReactNode`                | -        | Free content shown as is. No accessible expansion                         |
| `platform` | `'apple' \| 'other'`       | detected | Forces how `Mod` and the modifier symbols render (tests, docs)            |
| `messages` | `Partial<{ name; label }>` |          | Overrides the spoken names (`name(key)`) and short labels (`label(key)`)  |

Recognized names in `keys` (case-insensitive): `Mod`, `Cmd`/`Meta`, `Ctrl`, `Shift`, `Alt`/`Option`, `Enter`, `Esc`, `Tab`, `Backspace`, `Delete`, `Space`, `Up`/`ArrowUp` (and Down, Left, Right), `Home`, `End`, `PageUp`, `PageDown`. Anything else (`K`, `/`, `1`) is shown as typed; single letters are upper-cased with the active locale.

## Platform awareness

`Mod` is Command on Apple platforms and Control elsewhere. The server and the first client render use `other` (Ctrl) so hydration matches; the component then reads the real platform (`useSyncExternalStore`) and re-renders with the command symbol on Apple devices. Pass `platform` to pin it. The same detection backs `useHotkey`, so the hint always matches the key that works.

On Apple platforms modifiers use symbols (`⌘ ⌃ ⇧ ⌥ ↵ ⎋ ⇥ ⌫ ⌦`); elsewhere they are short text (`Ctrl`, `Shift`, `Alt`, `Esc`, `Del`). Command and the arrows use their symbol everywhere.

## Accessibility

Inside a `Button` the `Kbd` is `aria-hidden` (the button's `shortcut` prop exposes the keys once through `aria-keyshortcuts`), so the shortcut never doubles the accessible name.

- Screen readers do not reliably read symbols such as `⌘`. Every symbol or abbreviation is `aria-hidden` and followed by a visually hidden spoken name from the message catalog: "Command K", "Control Shift Escape".
- When the visible text already is the name (`Enter`, `Tab`) nothing is duplicated.
- The element has no role and is not focusable: it is text. The shortcut itself must be announced where it works (for example `aria-keyshortcuts` on the control, which is the control's responsibility).
- Text is `--ds-text-2`, which keeps at least 4.5:1 on the surface (the handoff used `--ds-text-3`).

## Content rules

- Write the logical key (`Mod`), not the platform one.
- One `Kbd` per shortcut. A sequence ("G then I") is two `Kbd`s with the word between them from your own copy; sequences are not a built-in prop.

## Examples

```tsx
<Kbd keys={['Mod', 'K']} />
<Kbd keys={['Shift', 'Enter']} />
<Kbd keys={['Esc']} />
```

## Differences from the handoff

- `keys` replaces hand-typed `⌘K`; the platform decides the modifier.
- Symbols are expanded for assistive technology with messages (English and pt-BR shipped).
- Height and padding are tokens (`--ds-kbd-*`). No `style` prop.
