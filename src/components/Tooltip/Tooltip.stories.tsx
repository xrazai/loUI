import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { PlusIcon } from '../Icon';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Create a new order', children: <Button>New order</Button> },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'start', 'end'] },
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 160 } } },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--ds-space-12)', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Keyboard focus opens the tooltip at once; `Escape` dismisses it while the trigger keeps focus. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'New order' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tip = await screen.findByRole('tooltip');
    await expect(tip).toHaveTextContent('Create a new order');
    await expect(trigger).toHaveAccessibleDescription('Create a new order');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** Open for the visual review. */
export const Open: Story = { args: { defaultOpen: true } };

export const WithShortcut: Story = {
  args: { shortcut: 'Ctrl+K', content: 'Search', defaultOpen: true },
};

export const Bottom: Story = { args: { placement: 'bottom', defaultOpen: true } };
export const Start: Story = { args: { placement: 'start', defaultOpen: true } };
export const End: Story = { args: { placement: 'end', defaultOpen: true } };

export const LongText: Story = {
  args: {
    defaultOpen: true,
    content: 'Creates a draft order for the selected customer and opens it for editing',
  },
};

/** An icon-only control already has its name; the tooltip repeats it and can add the shortcut. */
export const OnIconButton: Story = {
  args: {
    defaultOpen: true,
    content: 'Add order',
    shortcut: 'N',
    children: <IconButton label="Add order" icon={PlusIcon} />,
  },
};

/** Never opens while disabled. */
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async () => {
    await userEvent.tab();
    await expect(screen.queryByRole('tooltip')).toBeNull();
  },
};
