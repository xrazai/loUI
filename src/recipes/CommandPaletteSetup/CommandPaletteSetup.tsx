import { useState } from 'react';
import {
  Button,
  CommandPalette,
  Heading,
  HotkeyProvider,
  Inline,
  Kbd,
  SegmentedControl,
  ShortcutsHelp,
  Stack,
  Text,
  hotkeyKeys,
  toast,
  useHotkeys,
} from '../../index';
import type { Command } from '../../index';

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
