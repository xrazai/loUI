import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { HotkeyProvider } from '../../hooks/HotkeyProvider';
import { useHotkeys } from '../../hooks/useHotkeys';
import { DSProvider } from '../../providers/DSProvider';
import { Button } from '../Button';
import { CalendarIcon, PlusIcon, SearchIcon, StarIcon } from '../Icon/icons';
import { Kbd } from '../Kbd';
import { CommandPalette } from './CommandPalette';
import type { Command, CommandPaletteProps } from './CommandPalette';

const onAction = fn<(id: string) => void>();

const commands: Command[] = [
  {
    id: 'orders',
    label: 'Go to orders',
    group: 'Navigation',
    keywords: ['sales', 'pedidos'],
    shortcut: '1',
    icon: CalendarIcon,
    onAction: () => {
      onAction('orders');
    },
  },
  {
    id: 'customers',
    label: 'Go to customers',
    group: 'Navigation',
    keywords: ['clients', 'clientes'],
    shortcut: '2',
    onAction: () => {
      onAction('customers');
    },
  },
  {
    id: 'create-order',
    label: 'Create order',
    group: 'Orders',
    keywords: ['new', 'invoice'],
    shortcut: 'F2',
    icon: PlusIcon,
    onAction: () => {
      onAction('create-order');
    },
  },
  {
    id: 'find-order',
    label: 'Find order by number',
    group: 'Orders',
    shortcut: 'Mod+Shift+F',
    icon: SearchIcon,
    onAction: () => {
      onAction('find-order');
    },
  },
  {
    id: 'archive-order',
    label: 'Archive order',
    group: 'Orders',
    isDisabled: true,
    onAction: () => {
      onAction('archive-order');
    },
  },
  {
    id: 'cafe-report',
    label: 'Open café report',
    group: 'Reports',
    icon: StarIcon,
    onAction: () => {
      onAction('cafe-report');
    },
  },
];

/** The page the palette lives on: the palette opens from anywhere, here from a button too. */
function Page({ children }: { children?: ReactNode }) {
  return (
    <HotkeyProvider platform="other">
      <main style={{ display: 'flex', gap: 'var(--ds-space-3)', alignItems: 'center' }}>
        <Button>Orders</Button>
        <span>
          Press <Kbd keys={['Ctrl', 'K']} /> for commands
        </span>
        {children}
      </main>
    </HotkeyProvider>
  );
}

const meta = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  args: { commands },
  argTypes: {
    sort: { control: 'inline-radio', options: ['alphabetical', 'given'] },
  },
  decorators: [
    (Story) => (
      <Page>
        <Story />
      </Page>
    ),
  ],
  // Open dialogs cover the page, so the docs page renders each story in its own frame.
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const palette = () => screen.findByRole('dialog', { name: 'Command palette' });

/** The keyboard contract: open with Ctrl+K, type, arrows move, Enter runs and closes, focus returns. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    onAction.mockClear();
    const trigger = within(canvasElement).getByRole('button', { name: 'Orders' });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Control>}k{/Control}');
    const dialog = await palette();
    const search = within(dialog).getByRole('combobox', { name: 'Search or run a command' });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard('order');
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(search.getAttribute('aria-activedescendant')).toBeTruthy());
    await expect(search).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Open for the visual review. */
export const Open: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true },
};

/** Typing filters by label, keywords and group, ignoring case and accents; the match is highlighted. */
export const Filtered: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const dialog = await palette();
    await userEvent.keyboard('CAFE');
    await waitFor(() => expect(within(dialog).getAllByRole('option')).toHaveLength(1));
    await expect(dialog.querySelector('mark')?.textContent).toBe('café');
    await userEvent.clear(within(dialog).getByRole('combobox'));
    await userEvent.keyboard('clientes');
    await waitFor(() => expect(within(dialog).getAllByRole('option')).toHaveLength(1));
    await expect(within(dialog).getByRole('option', { name: /Go to customers/ })).toBeVisible();
  },
};

/** Nothing matches: say so and what to do. Escape still closes, even with text in the field. */
export const Empty: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const dialog = await palette();
    await userEvent.keyboard('zzzz');
    await expect((await within(dialog).findAllByText('No commands found'))[0]).toBeVisible();
    await expect(within(dialog).getByText('Try another search term.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

/** Recently run commands lead the list while the search is empty. The app stores the ids. */
export const WithRecent: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, recentIds: ['create-order', 'orders', 'archive-order'] },
};

/** Commands in the order you give them, groups in order of first use. */
export const GivenOrder: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, sort: 'given' },
};

/** A command whose label is long wraps instead of pushing the shortcut out. */
export const LongLabels: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: {
    defaultOpen: true,
    commands: [
      {
        id: 'long',
        label:
          'Export every order of the selected customers, including archived ones, as a spreadsheet for the accountant',
        group: 'Reports',
        shortcut: 'Mod+Shift+E',
        icon: CalendarIcon,
        onAction: () => undefined,
      },
      { id: 'short', label: 'Open report', group: 'Reports', onAction: () => undefined },
    ],
  },
};

function RegisteredShortcuts() {
  useHotkeys([
    {
      keys: 'F9',
      handler: () => {
        onAction('mark-paid');
      },
      description: 'Mark order as paid',
      group: 'Billing',
    },
    {
      keys: 'N',
      handler: () => {
        onAction('new-note');
      },
      description: 'Add a note',
      group: 'Billing',
    },
    { keys: 'Shift+/', handler: () => undefined, description: 'Show keyboard shortcuts' },
  ]);
  return null;
}

/** `includeHotkeys` lists every described shortcut registered with `useHotkeys` and runs its handler. */
export const WithRegisteredHotkeys: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, includeHotkeys: true },
  decorators: [
    (Story) => (
      <>
        <RegisteredShortcuts />
        <Story />
      </>
    ),
  ],
  play: async () => {
    onAction.mockClear();
    const dialog = await palette();
    await within(dialog).findByRole('option', { name: /Mark order as paid/ });
    await userEvent.keyboard('paid{Enter}');
    await waitFor(() => expect(onAction).toHaveBeenCalledWith('mark-paid'));
  },
};

/** Controlled: the app owns the open state, for example to open it from a toolbar button. */
export const Controlled: Story = {
  render: (args) => {
    function Demo(props: CommandPaletteProps) {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button
            onPress={() => {
              setOpen(true);
            }}
          >
            Open commands
          </Button>
          <CommandPalette {...props} isOpen={open} onOpenChange={setOpen} hotkey={false} />
        </>
      );
    }
    return <Demo {...args} />;
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Open commands' });
    await userEvent.click(button);
    await palette();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(button).toHaveFocus());
  },
};

/** Brazilian Portuguese: placeholder, headings, empty state and the spoken key names. */
export const PortugueseBrazil: Story = {
  args: { defaultOpen: true, recentIds: ['orders'] },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Paleta de comandos' });
    await waitFor(() =>
      expect(
        within(dialog).getByRole('combobox', { name: 'Buscar ou executar um comando' }),
      ).toBeVisible(),
    );
    await expect(within(dialog).getByText('Recentes')).toBeVisible();
    await userEvent.keyboard('zzzz');
    await expect(
      (await within(dialog).findAllByText('Nenhum comando encontrado'))[0],
    ).toBeVisible();
  },
};

function RtlDocument({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previous = document.documentElement.dir;
    document.documentElement.dir = 'rtl';
    return () => {
      document.documentElement.dir = previous;
    };
  }, []);
  return <div dir="rtl">{children}</div>;
}

/** Right to left: the icon, the label and the shortcut mirror; the arrow keys keep moving up and down. */
export const RightToLeft: Story = {
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <RtlDocument>
        <Story />
      </RtlDocument>
    ),
  ],
};
