import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { HotkeyProvider } from '../../hooks/HotkeyProvider';
import { useHotkeys } from '../../hooks/useHotkeys';
import { DSProvider } from '../../providers/DSProvider';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { ShortcutsHelp } from './ShortcutsHelp';

function PageShortcuts() {
  const [count, setCount] = useState(0);
  useHotkeys([
    {
      keys: 'N',
      handler: () => {
        setCount((value) => value + 1);
      },
      description: 'Create order',
      group: 'Orders',
    },
    { keys: 'F9', handler: () => undefined, description: 'Mark order as paid', group: 'Orders' },
    { keys: '1', handler: () => undefined, description: 'Go to orders', group: 'Navigation' },
    { keys: '2', handler: () => undefined, description: 'Go to customers', group: 'Navigation' },
    { keys: 'Mod+K', handler: () => undefined, description: 'Open the command palette' },
    { keys: 'Escape', handler: () => undefined },
  ]);
  return <output aria-label="Orders created">{count}</output>;
}

function Page({ children }: { children?: ReactNode }) {
  return (
    <HotkeyProvider platform="other">
      <main style={{ display: 'flex', gap: 'var(--ds-space-3)', alignItems: 'center' }}>
        <Button>Orders</Button>
        <span>
          Press <Kbd keys={['?']} /> for shortcuts
        </span>
        <PageShortcuts />
        {children}
      </main>
    </HotkeyProvider>
  );
}

const meta = {
  title: 'Components/ShortcutsHelp',
  component: ShortcutsHelp,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Page>
        <Story />
      </Page>
    ),
  ],
  // Open dialogs cover the page, so the docs page renders each story in its own frame.
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
} satisfies Meta<typeof ShortcutsHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `?` opens the dialog from anywhere outside an input; the page shortcuts stay quiet while it is open. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Orders' });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('?');
    const dialog = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect(within(dialog).getAllByRole('table')).toHaveLength(4);
    await waitFor(() =>
      expect(within(dialog).getByRole('table', { name: 'Orders' })).toBeVisible(),
    );
    await expect(within(dialog).getByRole('rowheader', { name: 'Create order' })).toBeVisible();
    // A page shortcut does nothing behind the dialog.
    await userEvent.keyboard('n');
    await expect(within(canvasElement).getByLabelText('Orders created')).toHaveTextContent('0');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('n');
    await expect(within(canvasElement).getByLabelText('Orders created')).toHaveTextContent('1');
  },
};

/** Open for the visual review. */
export const Open: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true },
};

/** No shortcut is registered. */
export const Empty: Story = {
  parameters: { visual: { selector: '[role="dialog"]' } },
  args: { defaultOpen: true, hotkey: false },
  decorators: [
    (Story) => (
      <HotkeyProvider platform="other">
        <Story />
      </HotkeyProvider>
    ),
  ],
};

/** Brazilian Portuguese: title, group fallback, column headers (hidden) and the spoken key names. */
export const PortugueseBrazil: Story = {
  args: { defaultOpen: true },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Atalhos de teclado' });
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Fechar' })).toBeVisible(),
    );
    await expect(within(dialog).getByText('Geral')).toBeVisible();
  },
};
