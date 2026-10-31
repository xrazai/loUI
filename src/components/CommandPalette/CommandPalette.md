# CommandPalette

Status: experimental

A modal search box that finds and runs commands from the keyboard. It opens with `Mod+K` (Command K on Apple platforms, Control K elsewhere), filters a grouped list as you type and runs the chosen command. It is the "⌘K for everything" of AGENTS.md section 5.

## When to use

- An app with many actions or destinations that should all be reachable without the mouse: navigate, create, filter, switch.
- Together with `useHotkeys`, so every shortcut is also discoverable by name (`includeHotkeys`).

## When not to use

- Searching data (orders, customers): use `SearchInput` with suggestions, or a results page. The palette runs commands; a command may open that search.
- Choosing a value in a form: use `Combobox` or `Select`.
- A short list of actions on one object: use `Menu`.

## Anatomy

```
ModalOverlay (dims the page, dialog layer)
  Modal
    Dialog  role="dialog"  aria-label="Command palette"
      SearchField / Input  role="combobox"  (focus stays here)
      ListBox  role="listbox"  aria-label="Commands"
        Section "Recent"                (only while the search is empty)
        Section <group>
          Option  icon · label (match highlighted) · shortcut (Kbd)
      status    "3 commands"            (visually hidden live region)
```

## Props

| Prop             | Type                          | Default          | Notes                                                                                      |
| ---------------- | ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| `commands`       | `Command[]`                   | required         | `id`, `label`, `group`, `keywords`, `shortcut`, `icon`, `onAction`, `isDisabled`           |
| `isOpen`         | `boolean`                     | -                | Controlled open state. Pair with `onOpenChange`                                            |
| `defaultOpen`    | `boolean`                     | `false`          | Initial state when uncontrolled                                                            |
| `onOpenChange`   | `(isOpen: boolean) => void`   | -                | Opens from the hotkey; closes on Escape, outside press or after a command                  |
| `hotkey`         | `string \| false`             | `'Mod+K'`        | Registered in the hotkey registry. Works from inside inputs. `false`: no hotkey            |
| `includeHotkeys` | `boolean`                     | `false`          | Also lists described shortcuts registered with `useHotkeys`; running one calls its handler |
| `recentIds`      | `string[]`                    | -                | Most recent first. The app stores them (collect with `onRun`)                              |
| `maxRecent`      | `number`                      | `5`              | Most recent commands shown                                                                 |
| `onRun`          | `(commandId: string) => void` | -                | Called when a command is chosen                                                            |
| `sort`           | `'alphabetical' \| 'given'`   | `'alphabetical'` | Groups and commands sorted with the locale, ignoring accents, or as given                  |
| `placeholder`    | `string`                      | message          | "Search or run a command"                                                                  |
| `messages`       | `Partial<messages>`           | -                | Per-instance overrides (see below)                                                         |

`Command.shortcut` is display only: a combo (`'Mod+Shift+P'`, `'F2'`) or `Kbd` keys (`['Mod', 'K']`). It does not bind the key.

## Behavior

- Search matches the label, the `keywords` and the group, ignoring case and accents (`cafe` finds "Open café report"). The matching part of the label is highlighted. Disabled commands stay searchable but cannot run.
- The first command is highlighted when the palette opens and after each typed character, so `Enter` runs it at once. `ArrowUp` / `ArrowDown` move the highlight; focus stays in the field.
- `Enter` (or a click) runs the command and closes the palette. The command runs once the palette has unmounted, so a dialog it opens is not fought over by focus restoration.
- `Escape` always closes, even when the field has text (no "clear first" step), and focus returns to the element that had it.
- The search text resets every time the palette opens.
- Shortcuts of the page do not fire while the palette is open (see `docs/architecture/hotkeys.md`).
- `includeHotkeys`: a registered shortcut whose description equals a command's label is listed once (the command wins); the palette's own shortcut is not listed.

## Accessibility

- A modal `dialog` named "Command palette". Focus is trapped, the page behind is inert, focus returns on close (React Aria).
- The field follows the WAI-ARIA combobox pattern with a listbox popup: `role="combobox"`, `aria-controls`, `aria-expanded="true"` and `aria-activedescendant` for the highlighted option. React Aria delays moving `aria-activedescendant` by about 500 ms while typing so screen readers are not interrupted by the highlight change.
- Groups are `role="group"` named by their heading. Disabled options are `aria-disabled`.
- After each search a visually hidden `role="status"` says how many commands match ("3 commands", "No commands found").
- Shortcuts are drawn with `Kbd`, which adds spoken key names ("Control Shift O") to the option's name.
- Keyboard: `Mod+K` opens, `↑ ↓` move, `Enter` runs, `Esc` closes. Hover highlights like the keyboard does.
- Motion honors `prefers-reduced-motion`; `forced-colors` gets a system border and highlight outline.

## Content rules

- Labels are a verb plus an object in sentence case: "Create order", "Go to customers".
- Group names are nouns: "Navigation", "Orders". Use `keywords` for synonyms and other languages instead of long labels.
- Messages: `title`, `placeholder`, `commands`, `recent`, `ungrouped`, `shortcuts`, `noResults`, `noResultsHint`, `openDescription`, `openGroup`, `resultCount(n)`. English and pt-BR ship; override any of them per instance or through `DSProvider messages={{ CommandPalette: { ... } }}`.

## Examples

```tsx
<HotkeyProvider>
  <CommandPalette
    commands={[
      {
        id: 'orders',
        label: 'Go to orders',
        group: 'Navigation',
        shortcut: '1',
        onAction: () => navigate('/orders'),
      },
      {
        id: 'new',
        label: 'Create order',
        group: 'Orders',
        keywords: ['invoice'],
        shortcut: 'F2',
        onAction: createOrder,
      },
    ]}
    includeHotkeys
    recentIds={recent}
    onRun={(id) => setRecent((ids) => [id, ...ids.filter((x) => x !== id)].slice(0, 5))}
  />
</HotkeyProvider>
```

Open it from a button instead of (or as well as) the hotkey:

```tsx
const [open, setOpen] = useState(false);
<Button onPress={() => setOpen(true)}>Commands</Button>
<CommandPalette commands={commands} isOpen={open} onOpenChange={setOpen} />
```

## Differences from the handoff

- The handoff had no command palette; the ERP bound F2/F9/N/Enter/Esc/1-4 directly. Here those keys are ordinary `useHotkeys` registrations and the palette lists them.
- Size, list height and offset are tokens (`--ds-command-palette-*`).
