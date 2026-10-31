import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { Input } from '../Input';
import { Popover } from './Popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    label: 'Filters',
    trigger: <Button>Filters</Button>,
    children: (
      <div style={{ display: 'grid', gap: 'var(--ds-space-3)' }}>
        <Input label="Customer" />
        <Button variant="primary">Apply filters</Button>
      </div>
    ),
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom start', 'bottom end', 'top start', 'top end', 'start', 'end'],
    },
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--ds-space-12)', minBlockSize: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Filters' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    await waitFor(() => expect(dialog).toBeVisible());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Open for the visual review. */
export const Open: Story = { args: { defaultOpen: true } };

export const WithArrow: Story = { args: { defaultOpen: true, showArrow: true } };
export const AboveTrigger: Story = { args: { defaultOpen: true, placement: 'top start' } };
export const AlignedToEnd: Story = { args: { defaultOpen: true, placement: 'bottom end' } };

export const KeyboardOpenAndRestoreFocus: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Filters' });
    await userEvent.tab();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const CloseFromInside: Story = {
  args: {
    children: ({ close }) => (
      <Button variant="primary" onPress={close}>
        Done
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filters' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};
