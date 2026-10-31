import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Menu, MenuItem, MenuSection, MenuSeparator, MoreActionsMenu, SubMenu } from './Menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  args: {
    trigger: <Button>Actions</Button>,
    onAction: fn(),
    children: [
      <MenuItem key="edit" id="edit" shortcut="Ctrl+E">
        Edit order
      </MenuItem>,
      <MenuItem key="duplicate" id="duplicate">
        Duplicate order
      </MenuItem>,
      <MenuItem key="archive" id="archive" isDisabled>
        Archive order
      </MenuItem>,
      <MenuSeparator key="sep" />,
      <MenuItem key="delete" id="delete" tone="danger">
        Delete order
      </MenuItem>,
    ],
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--ds-space-12)', minBlockSize: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Enter, Space or Arrow Down opens it and focuses the first item; Escape closes and restores focus. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Actions' });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu', { name: 'Actions' });
    await waitFor(() =>
      expect(within(menu).getByRole('menuitem', { name: /Edit order/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    const calls = (args.onAction as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    await waitFor(() => expect(calls.at(-1)?.[0]).toBe('duplicate'));
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const EscapeRestoresFocus: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await screen.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const TypeaheadAndHomeEnd: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    await userEvent.keyboard('{End}');
    await waitFor(() =>
      expect(within(menu).getByRole('menuitem', { name: 'Delete order' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Home}');
    await userEvent.keyboard('dup');
    await waitFor(() =>
      expect(within(menu).getByRole('menuitem', { name: 'Duplicate order' })).toHaveFocus(),
    );
  },
};

/** Open for the visual review: shortcut hint, disabled item, danger item. */
export const Open: Story = { args: { defaultOpen: true } };

export const CheckboxItems: Story = {
  args: {
    trigger: <Button>View</Button>,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['id'],
    defaultOpen: true,
    children: [
      <MenuItem key="id" id="id">
        Show ID
      </MenuItem>,
      <MenuItem key="status" id="status">
        Show status
      </MenuItem>,
      <MenuItem key="date" id="date">
        Show date
      </MenuItem>,
    ],
  },
};

export const RadioItems: Story = {
  args: {
    trigger: <Button>Sort</Button>,
    selectionMode: 'single',
    defaultSelectedKeys: ['new'],
    defaultOpen: true,
    children: [
      <MenuItem key="new" id="new">
        Newest first
      </MenuItem>,
      <MenuItem key="old" id="old">
        Oldest first
      </MenuItem>,
    ],
  },
};

export const WithSections: Story = {
  args: {
    trigger: <Button>Options</Button>,
    defaultOpen: true,
    children: [
      <MenuSection key="a" title="Order">
        <MenuItem id="edit">Edit order</MenuItem>
        <MenuItem id="duplicate">Duplicate order</MenuItem>
      </MenuSection>,
      <MenuSection key="b" title="Density" selectionMode="single" defaultSelectedKeys={['compact']}>
        <MenuItem id="comfortable">Comfortable</MenuItem>
        <MenuItem id="compact">Compact</MenuItem>
      </MenuSection>,
    ],
  },
};

export const WithSubmenu: Story = {
  args: {
    children: [
      <MenuItem key="edit" id="edit">
        Edit order
      </MenuItem>,
      <SubMenu key="move" label="Move to…" textValue="Move to">
        <MenuItem id="ready">Ready</MenuItem>
        <MenuItem id="shipped">Shipped</MenuItem>
      </SubMenu>,
    ],
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Actions' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu');
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Ready' })).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Move to…' })).toHaveFocus());
  },
};

export const LongLabels: Story = {
  args: {
    defaultOpen: true,
    children: [
      <MenuItem key="a" id="a" shortcut="Ctrl+Shift+E">
        Export the selected orders with all of their line items as a spreadsheet
      </MenuItem>,
      <MenuItem key="b" id="b">
        Edit order
      </MenuItem>,
    ],
  },
};

/** The `···` overflow trigger: an icon button named from the message catalog ("More actions"). */
export const MoreActions: StoryObj<typeof MoreActionsMenu> = {
  render: () => (
    <MoreActionsMenu>
      <MenuItem id="edit">Edit order</MenuItem>
      <MenuItem id="duplicate">Duplicate order</MenuItem>
      <MenuSeparator />
      <MenuItem id="delete" tone="danger">
        Delete order
      </MenuItem>
    </MoreActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'More actions' });
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu', { name: 'More actions' });
    await waitFor(() => expect(menu).toBeVisible());
  },
};
