# CommandPaletteSetup

Status: experimental

Keyboard first, wired end to end: one list of destinations and actions feeds the bare-key shortcuts, the command palette (`Mod+K`) and the shortcuts help (`?`).

Components: `HotkeyProvider`, `useHotkeys`, `CommandPalette`, `ShortcutsHelp`, `SegmentedControl`, `Kbd`, `Toast`.

## When to use

- Any app with more than a few destinations or actions. "`⌘K` for everything" (AGENTS.md section 5, rule 8).
- Together with a primary action that has a shortcut (see `settings-page`).

## When not to use

- Searching data (orders, customers): use `SearchInput` with suggestions or a results page. A command can open that search.
- A short list of actions on one object: use a `Menu`.

## What it does

- `HotkeyProvider` owns the shortcut registry for the subtree. `useHotkeys` registers `1`, `2`, `3` (go to a section) and `F2` (create an order), each with a description and a group.
- `CommandPalette` lists the same destinations and actions with their shortcuts, searchable by label, group and keywords (typing "add" finds "Create order"). Enter runs the highlighted command; Esc closes and focus returns to where it was. Recent commands come first the next time it opens (`recentIds`, `onRun`).
- `ShortcutsHelp` opens with `?` and lists every described shortcut by group.
- A visible "Open commands" button, with the shortcut hint, opens the palette for people who do not know the key.
- Commands are a verb plus an object in sentence case ("Go to customers", "Create order").

## Things to keep when you adapt it

- Bare-key shortcuts never fire while the user types in a field, or while a dialog or menu is open; `Mod+K` is the exception, so it works from inputs.
- Keep one definition per action. Build `commands` and `useHotkeys` from the same array in a real app so labels cannot drift.
- Shortcuts shown in the palette are display only; the hotkey registration is what binds them.
- `platform` pins what `Mod` means for tests and docs; leave it out in an app.

## Code

<!-- recipe-source:start -->

```tsx
import { useState } from 'react';
import {
  Button,
  CommandPalette,
  Heading,
  hotkeyKeys,
  HotkeyProvider,
  Inline,
  Kbd,
  SegmentedControl,
  ShortcutsHelp,
  Stack,
  Text,
  toast,
  useHotkeys,
} from 'loui-ds';
import type { Command } from 'loui-ds';

type Page = 'orders' | 'customers' | 'invoices';

const PAGES: { id: Page; label: string; key: string }[] = [
  { id: 'orders', label: 'Orders', key: '1' },
  { id: 'customers', label: 'Customers', key: '2' },
  { id: 'invoices', label: 'Invoices', key: '3' },
];

function Workspace() {
  const [page, setPage] = useState<Page>('orders');
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const createOrder = () => {
    toast.success('Order #1052 created');
  };

  // One definition feeds the shortcut, the palette and the help list.
  useHotkeys([
    ...PAGES.map(({ id, label, key }) => ({
      keys: key,
      handler: () => {
        setPage(id);
      },
      description: `Go to ${label.toLowerCase()}`,
      group: 'Navigation',
    })),
    { keys: 'F2', handler: createOrder, description: 'Create order', group: 'Orders' },
  ]);

  const commands: Command[] = [
    ...PAGES.map(({ id, label, key }) => ({
      id: `go-${id}`,
      label: `Go to ${label.toLowerCase()}`,
      group: 'Navigation',
      shortcut: key,
      onAction: () => {
        setPage(id);
      },
    })),
    {
      id: 'create-order',
      label: 'Create order',
      group: 'Orders',
      keywords: ['new', 'add'],
      shortcut: 'F2',
      onAction: createOrder,
    },
  ];

  return (
    <Stack gap={4}>
      <Inline justify="between">
        <Heading level={2}>{PAGES.find((item) => item.id === page)?.label ?? ''}</Heading>
        <Button
          trailing={<Kbd keys={hotkeyKeys('Mod+K')} />}
          onPress={() => {
            setPaletteOpen(true);
          }}
        >
          Open commands
        </Button>
      </Inline>
      <SegmentedControl
        aria-label="Section"
        value={page}
        onChange={(value) => {
          setPage(value as Page);
        }}
        options={PAGES.map(({ id, label }) => ({ value: id, label }))}
      />
      <Text tone="secondary" as="p">
        Press ? to list every shortcut.
      </Text>
      <CommandPalette
        commands={commands}
        isOpen={isPaletteOpen}
        onOpenChange={setPaletteOpen}
        recentIds={recent}
        onRun={(id) => {
          setRecent((ids) => [id, ...ids.filter((item) => item !== id)].slice(0, 5));
        }}
      />
      <ShortcutsHelp />
    </Stack>
  );
}

export interface CommandPaletteSetupProps {
  /** Pins what Mod means (tests and docs). By default the browser decides. */
  platform?: 'mac' | 'other';
}

/**
 * Keyboard first: Mod+K runs anything, `?` lists the shortcuts, and the same definitions
 * work as bare keys. `HotkeyProvider` owns the registry; the palette lists commands and recent
 * ones, and `ShortcutsHelp` reads whatever `useHotkeys` registered.
 */
export function CommandPaletteSetup({ platform }: CommandPaletteSetupProps) {
  return (
    <HotkeyProvider {...(platform ? { platform } : {})}>
      <Workspace />
    </HotkeyProvider>
  );
}
```

<!-- recipe-source:end -->

## Verified by

`src/recipes/CommandPaletteSetup/CommandPaletteSetup.test.tsx` (number keys, open with `Mod+K`, run by label and by keyword, open from the button and Esc, `F2`, the shortcuts help, recent commands, axe with the palette and the help open) and the `Recipes/CommandPaletteSetup` stories.
