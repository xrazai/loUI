# CommandPalette

> A command palette: a modal with a search field and a grouped list of commands, opened with
> `Mod+K` (configurable). Built on React Aria `Autocomplete`, `SearchField` and `ListBox` inside a
> `ModalOverlay`: the search field is a combobox that keeps focus while the arrow keys move
> through the commands (`aria-activedescendant`), `Enter` runs the highlighted command and
> closes, `Escape` closes and focus returns to where it was.

Search ignores case and accents and matches label, keywords and group. With `includeHotkeys`
it also lists the shortcuts registered through `useHotkeys`.

A modal search box that finds and runs commands from the keyboard. It opens with `Mod+K` (Command K on Apple platforms, Control K elsewhere), filters a grouped list as you type and runs the chosen command. It is the "⌘K for everything" of AGENTS.md section 5.

- Import: `import { CommandPalette } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/CommandPalette/CommandPalette.tsx`
- Stories (Storybook title `Components/CommandPalette`): Default, Open, Filtered, Empty, WithRecent, GivenOrder, LongLabels, WithRegisteredHotkeys, Controlled, PortugueseBrazil, RightToLeft

## Props

| Prop             | Type                                                                                                                                                                                                                                                 | Required | Default          | Description                                                                                                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commands`       | `readonly Command[]`                                                                                                                                                                                                                                 | yes      |                  | The commands. Search covers the label, the keywords and the group.                                                                                                                                                                                                              |
| `isOpen`         | `boolean`                                                                                                                                                                                                                                            |          |                  | Controlled open state. Pair with `onOpenChange`.                                                                                                                                                                                                                                |
| `defaultOpen`    | `boolean`                                                                                                                                                                                                                                            |          | `false`          | Initial open state when uncontrolled.                                                                                                                                                                                                                                           |
| `onOpenChange`   | `((isOpen: boolean) => void)`                                                                                                                                                                                                                        |          |                  | Called when the palette opens (from the hotkey) or closes (Escape, outside press, a command ran).                                                                                                                                                                               |
| `hotkey`         | `string \| false`                                                                                                                                                                                                                                    |          | `Mod+K`          | The shortcut that opens the palette, registered in the hotkey registry. Default `'Mod+K'`. It works while an input has focus. Pass `false` to open the palette only through `isOpen`.                                                                                           |
| `includeHotkeys` | `boolean`                                                                                                                                                                                                                                            |          | `false`          | Also list every shortcut registered with `useHotkeys` that has a `description`, as a command that runs its handler (grouped by the shortcut's `group`, or under "Shortcuts"). A registered shortcut whose description equals a command's label is listed once. Default `false`. |
| `recentIds`      | `readonly string[]`                                                                                                                                                                                                                                  |          |                  | Ids of recently run commands, most recent first, shown under "Recent" while the search is empty. Persisting them is up to the app: collect them in `onRun`.                                                                                                                     |
| `maxRecent`      | `number`                                                                                                                                                                                                                                             |          | `5`              | Most recent commands shown. Default `5`.                                                                                                                                                                                                                                        |
| `onRun`          | `((commandId: string) => void)`                                                                                                                                                                                                                      |          |                  | Called after a command was chosen, with its id, so the app can update `recentIds`.                                                                                                                                                                                              |
| `sort`           | `'alphabetical' \| 'given'`                                                                                                                                                                                                                          |          | `'alphabetical'` | Order of groups and commands. `alphabetical` (default) sorts both with the active locale, ignoring accents; `given` keeps the order of `commands` and lists groups in order of first use.                                                                                       |
| `placeholder`    | `string`                                                                                                                                                                                                                                             |          |                  | Placeholder and accessible name of the search field. Default from messages: "Search or run a command".                                                                                                                                                                          |
| `messages`       | `Partial<{ title: string; placeholder: string; commands: string; recent: string; ungrouped: string; shortcuts: string; noResults: string; noResultsHint: string; openDescription: string; openGroup: string; resultCount: (n: number) => string; }>` |          |                  | Message overrides for this instance.                                                                                                                                                                                                                                            |
| `className`      | `string`                                                                                                                                                                                                                                             |          |                  | Class name for the palette panel.                                                                                                                                                                                                                                               |
| `ref`            | `Ref<HTMLElement>`                                                                                                                                                                                                                                   |          |                  | Ref to the panel (`role="dialog"`).                                                                                                                                                                                                                                             |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ CommandPalette: { ... } }}>`.

| Key                      | English default            | Notes                                                                                 |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------- |
| `title`                  | `Command palette`          | Accessible name of the palette dialog.                                                |
| `placeholder`            | `Search or run a command`  | Placeholder and accessible name of the search field.                                  |
| `commands`               | `Commands`                 | Accessible name of the list of commands.                                              |
| `recent`                 | `Recent`                   | Heading of the group of recently run commands.                                        |
| `ungrouped`              | `Commands`                 | Heading for commands that have no `group`.                                            |
| `shortcuts`              | `Shortcuts`                | Heading for registered shortcuts that have no `group` (when `includeHotkeys` is set). |
| `noResults`              | `No commands found`        | Shown when no command matches the search.                                             |
| `noResultsHint`          | `Try another search term.` | Second line of the empty state: what to do next.                                      |
| `openDescription`        | `Open the command palette` | Description of the shortcut that opens the palette, listed by `ShortcutsHelp`.        |
| `openGroup`              | `General`                  | Group of the shortcut that opens the palette.                                         |
| `resultCount(n: number)` | `2 commands`               | Spoken after each search: how many commands match.                                    |

## Design tokens used

`--ds-accent`, `--ds-command-palette-list-max-height`, `--ds-command-palette-offset-top`, `--ds-command-palette-width`, `--ds-control-h-lg`, `--ds-dialog-gutter`, `--ds-dialog-padding`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-body`, `--ds-fs-caption`, `--ds-fs-small`, `--ds-item-h`, `--ds-lh-body`, `--ds-lh-caption`, `--ds-lh-small`, `--ds-line`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-overlay`, `--ds-radius-lg`, `--ds-radius-sm`, `--ds-shadow-dialog`, `--ds-space-1`, `--ds-space-2`, `--ds-space-4`, `--ds-space-5`, `--ds-surface-hover`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-weight-medium`

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

## Related components

- Instead, see SearchInput: Searching data (orders, customers): use `SearchInput` with suggestions, or a results page. The palette runs commands; a command may open that search.
- Instead, see Combobox: Choosing a value in a form: use `Combobox` or `Select`.
- Instead, see Select: Choosing a value in a form: use `Combobox` or `Select`.
- Instead, see Menu: A short list of actions on one object: use `Menu`.
- Renders: Icon, Kbd, VisuallyHidden
