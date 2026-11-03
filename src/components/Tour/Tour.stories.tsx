import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { StoryFrame } from '../../test/StoryFrame';
import { Button } from '../Button';
import { Tour } from './Tour';
import type { TourProps } from './Tour';

const meta = {
  title: 'Components/Tour',
  component: Tour,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom start', 'bottom end', 'top start', 'top end', 'start', 'end'],
    },
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 360 } } },
  decorators: [
    (Story) => (
      <StoryFrame padding={12} minHeight={320}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Tour>;

export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = Partial<Omit<TourProps, 'steps'>> & { startOpen?: boolean };

/** A small toolbar with three anchors and a button that starts the tour. */
function Demo({ startOpen = false, ...props }: DemoProps) {
  const [open, setOpen] = useState(startOpen);
  const search = useRef<HTMLButtonElement>(null);
  const filters = useRef<HTMLButtonElement>(null);
  const create = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ display: 'flex', gap: 'var(--ds-space-3)', flexWrap: 'wrap' }}>
      <Button
        onPress={() => {
          setOpen(true);
        }}
      >
        Start tour
      </Button>
      <Button ref={search}>Search</Button>
      <Button ref={filters}>Filters</Button>
      <Button ref={create} variant="primary">
        Create item
      </Button>
      <Tour
        {...props}
        steps={[
          { target: search, title: 'Search', content: 'Find any item by name or code.' },
          { target: filters, title: 'Filters', content: 'Narrow the list by status or date.' },
          { target: create, title: 'Create item', content: 'Add a new item to the list.' },
        ]}
        isOpen={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}

export const Default: Story = {
  args: { steps: [] },
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByRole('button', { name: 'Start tour' });
    await userEvent.click(start);
    const first = await screen.findByRole('dialog', { name: 'Search' });
    await waitFor(() => expect(first).toHaveFocus());
    await waitFor(() => expect(screen.getByText('Step 1 of 3')).toBeVisible());
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('dialog', { name: 'Filters' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(start).toHaveFocus());
  },
};

/** Open on the first step for the visual review. */
export const FirstStep: Story = {
  args: { steps: [] },
  render: (args) => <Demo {...args} startOpen />,
};

export const MiddleStep: Story = {
  args: { steps: [], defaultStep: 1 },
  render: (args) => <Demo {...args} startOpen />,
};

export const LastStep: Story = {
  args: { steps: [], defaultStep: 2 },
  render: (args) => <Demo {...args} startOpen />,
};

export const AboveTarget: Story = {
  args: { steps: [], placement: 'top start' },
  render: (args) => <Demo {...args} startOpen />,
};

export const KeyboardOnly: Story = {
  args: { steps: [] },
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByRole('button', { name: 'Start tour' });
    await userEvent.tab();
    await waitFor(() => expect(start).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('dialog', { name: 'Search' });
    await userEvent.tab();
    await expect(screen.getByRole('button', { name: 'Skip tour' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('dialog', { name: 'Filters' });
  },
};
