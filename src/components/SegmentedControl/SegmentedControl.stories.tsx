import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { SegmentedControl } from './SegmentedControl';
import { StoryFrame } from '../../test/StoryFrame';

const options = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board' },
  { value: 'calendar', label: 'Calendar' },
];

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: { 'aria-label': 'View', options, onChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument();
    await expect(canvas.getByRole('radio', { name: 'List' })).toBeChecked();
  },
};

export const Small: Story = { args: { size: 'sm' } };

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const WithCounts: Story = {
  args: {
    'aria-label': 'Order status',
    options: [
      { value: 'all', label: 'All', count: 1248 },
      { value: 'open', label: 'Open', count: 12, countLabel: '12 open' },
      { value: 'closed', label: 'Closed', count: 1236, countLabel: '1,236 closed' },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('radio', { name: 'Open 12 open' }),
    ).toBeInTheDocument();
  },
};

export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'list', label: 'List' },
      { value: 'board', label: 'Board', isDisabled: true },
      { value: 'calendar', label: 'Calendar' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Calendar' })).toHaveFocus();
  },
};

export const DisabledGroup: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'List' })).toBeDisabled();
  },
};

/** One tab stop. Arrows move focus, Space selects, the selection can never be empty. */
export const KeyboardSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'List' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Board' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('radio', { name: 'Board' })).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith('board');
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('radio', { name: 'Board' })).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('radio', { name: 'List' })).toHaveFocus();
  },
};

function ControlledExample() {
  const [value, setValue] = useState('board');
  return (
    <>
      <SegmentedControl aria-label="View" options={options} value={value} onChange={setValue} />
      <p style={{ margin: 0 }}>Value: {value}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Calendar' }));
    await expect(canvas.getByText('Value: calendar')).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  args: {
    options: [
      { value: 'a', label: 'Awaiting supplier confirmation' },
      { value: 'b', label: 'Ready to ship' },
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={260}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const PortugueseCounts: Story = {
  args: {
    'aria-label': 'Situação',
    options: [
      { value: 'all', label: 'Todos', count: 1248 },
      { value: 'open', label: 'Abertos', count: 12 },
    ],
  },
  render: (args) => (
    <DSProvider locale="pt-BR">
      <SegmentedControl {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio', { name: 'Todos 1.248' })).toBeChecked();
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <DSProvider locale="ar">
        <div dir="rtl">
          <Story />
        </div>
      </DSProvider>
    ),
  ],
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
