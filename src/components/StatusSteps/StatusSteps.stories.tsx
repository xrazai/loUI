import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { StatusSteps } from './StatusSteps';
import type { StatusStepsProps } from './StatusSteps';
import { StoryFrame } from '../../test/StoryFrame';

const steps = [
  { id: 'draft', label: 'Draft' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
];

const meta = {
  title: 'Components/StatusSteps',
  component: StatusSteps,
  tags: ['autodocs'],
  args: { 'aria-label': 'Order status', steps, current: 1 },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={560}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<Extract<StatusStepsProps, { 'aria-label': string }>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list', { name: 'Order status' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(canvas.getByText('Current')).toBeInTheDocument();
  },
};

export const FirstStep: Story = { args: { current: 0 } };

export const Complete: Story = { args: { current: 3, complete: true } };

export const ManySteps: Story = {
  args: {
    current: 4,
    steps: [
      { id: 'a', label: 'Quote' },
      { id: 'b', label: 'Approved' },
      { id: 'c', label: 'In production' },
      { id: 'd', label: 'Quality check' },
      { id: 'e', label: 'Packed' },
      { id: 'f', label: 'Shipped' },
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={760}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const LongLabels: Story = {
  args: {
    steps: [
      { id: 'a', label: 'Awaiting supplier confirmation' },
      { id: 'b', label: 'Ready for shipment' },
      { id: 'c', label: 'Out for delivery' },
    ],
    current: 1,
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360}>
        <Story />
      </StoryFrame>
    ),
  ],
};

/** Steps are buttons. Tab moves between them; Enter and Space select. */
export const Interactive: Story = {
  args: { onSelect: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /Draft/ })).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelect).toHaveBeenLastCalledWith(2, steps[2]);
  },
};

function ControlledExample() {
  const [current, setCurrent] = useState(1);
  return (
    <StatusSteps aria-label="Order status" steps={steps} current={current} onSelect={setCurrent} />
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Delivered/ }));
    await expect(canvas.getByRole('button', { name: 'Delivered Current' })).toBeInTheDocument();
  },
};

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <StatusSteps {...args} aria-label="Situação do pedido" />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Atual')).toBeInTheDocument();
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Focused: Story = {
  args: { onSelect: fn() },
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
