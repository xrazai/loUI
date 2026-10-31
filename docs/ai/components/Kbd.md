# Kbd

> A keyboard shortcut hint in mono type. With `keys` it renders `Mod` as the command symbol
> on Apple platforms and as Ctrl elsewhere, and gives screen readers the spoken key names.

A keyboard shortcut hint in mono type. It renders a real `<kbd>` element.

- Import: `import { Kbd } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Kbd/Kbd.tsx`
- Stories (Storybook title `Components/Kbd`): Default, Apple, Windows, SingleKey, Arrows, WithChildren, InText, PortugueseLocale, RightToLeft

## Props

| Prop       | Type                                                                              | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keys`     | `readonly string[]`                                                               |          |         | The keys of one shortcut, in order: `['Mod', 'K']`, `['Shift', 'Enter']`, `['Esc']`. Recognized names (case-insensitive): `Mod` (Command on Apple, Control elsewhere), `Cmd`, `Meta`, `Ctrl`, `Shift`, `Alt`, `Option`, `Enter`, `Esc`, `Tab`, `Backspace`, `Delete`, `Space`, arrows (`Up`, `ArrowUp`, ...), `Home`, `End`, `PageUp`, `PageDown`. Anything else is shown as typed (`K`, `/`, `1`). Symbols are hidden from assistive technology and replaced by the spoken name. |
| `children` | `ReactNode`                                                                       |          |         | Free content shown as is (for example `⌘K`). Prefer `keys`, which is accessible and platform-aware.                                                                                                                                                                                                                                                                                                                                                                               |
| `platform` | `'apple' \| 'other'`                                                              |          |         | Forces the platform used to render `Mod` and the modifier symbols. By default it is detected in the browser; during server rendering and the first client render it is `other` (Ctrl), then switches to `apple` (the command symbol) after hydration.                                                                                                                                                                                                                             |
| `messages` | `Partial<{ name: (key: KbdKeyId) => string; label: (key: KbdKeyId) => string; }>` |          |         | Per-instance overrides of the spoken key names and short key labels.                                                                                                                                                                                                                                                                                                                                                                                                              |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Kbd: { ... } }}>`.

| Key                    | English default | Notes |
| ---------------------- | --------------- | ----- |
| `name(key: KbdKeyId)`  |                 |       |
| `label(key: KbdKeyId)` |                 |       |

## Design tokens used

`--ds-font-mono`, `--ds-fs-caption`, `--ds-kbd-height`, `--ds-kbd-padding-inline`, `--ds-lh-caption`, `--ds-line-strong`, `--ds-radius-sm`, `--ds-space-1`, `--ds-text-2`, `--ds-weight-medium`

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

## Platform awareness

`Mod` is Command on Apple platforms and Control elsewhere. The server and the first client render use `other` (Ctrl) so hydration matches; the component then reads the real platform (`useSyncExternalStore`) and re-renders with the command symbol on Apple devices. Pass `platform` to pin it. The same detection backs `useHotkey`, so the hint always matches the key that works.

On Apple platforms modifiers use symbols (`⌘ ⌃ ⇧ ⌥ ↵ ⎋ ⇥ ⌫ ⌦`); elsewhere they are short text (`Ctrl`, `Shift`, `Alt`, `Esc`, `Del`). Command and the arrows use their symbol everywhere.

## Accessibility

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

## Related components

- Renders: VisuallyHidden
