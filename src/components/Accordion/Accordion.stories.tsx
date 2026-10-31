import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Accordion } from './Accordion';
import { StoryFrame } from '../../test/StoryFrame';

const items = [
  {
    value: 'shipping',
    title: 'How long does shipping take?',
    meta: '2 min',
    content: 'Orders ship within two business days. Delivery takes three to five days.',
  },
  {
    value: 'returns',
    title: 'Can I return an order?',
    content: 'You can return unused fabric within 30 days of delivery.',
  },
  {
    value: 'samples',
    title: 'Do you send fabric samples?',
    content: 'Yes. Samples are free for orders above a minimum of 10 meters.',
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { items, onChange: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['bordered', 'plain'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={520}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    const trigger = canvas.getByRole('button', { name: /How long does shipping take/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Plain: Story = { args: { variant: 'plain' } };

export const InitiallyExpanded: Story = {
  args: { defaultValue: ['returns'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Can I return an order?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByText(/unused fabric/)).toBeVisible();
  },
};

/** Enter and Space toggle the focused header; opening one closes the others. */
export const KeyboardSingle: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /How long/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: /How long/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('button', { name: /How long/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(canvas.getByRole('button', { name: /Can I return/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(args.onChange).toHaveBeenLastCalledWith(['returns']);
  },
};

export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /How long/ }));
    await userEvent.click(canvas.getByRole('button', { name: /Can I return/ }));
    await expect(canvas.getByRole('button', { name: /How long/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByRole('button', { name: /Can I return/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};

export const DisabledItem: Story = {
  args: {
    items: [
      items[0] ?? { value: 'a', title: 'A', content: 'A' },
      { value: 'locked', title: 'Billing details', content: 'Locked.', isDisabled: true },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Billing details' }),
    ).toBeDisabled();
  },
};

export const HeadingLevel2: Story = {
  args: { headingLevel: 2 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('heading', { level: 2 })).toHaveLength(3);
  },
};

function ControlledAccordion() {
  const [value, setValue] = useState<string[]>(['samples']);
  return (
    <>
      <Accordion items={items} value={value} onChange={setValue} multiple />
      <p style={{ margin: 0 }}>Open: {value.join(', ') || 'none'}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledAccordion />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Can I return/ }));
    await expect(canvas.getByText('Open: samples, returns')).toBeInTheDocument();
  },
};

export const LongText: Story = {
  args: {
    items: [
      {
        value: 'long',
        title:
          'A very long question about delivery windows, carriers, customs paperwork and what happens when nobody is home to sign',
        meta: '12 Oct 2026',
        content:
          'A very long answer with an unbroken reference ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048-ORD-1048 that must wrap.',
      },
    ],
    defaultValue: ['long'],
  },
};

export const RightToLeft: Story = {
  args: { defaultValue: ['shipping'] },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};

export const Focused: Story = {
  parameters: { visual: { play: true } },
  play: async () => {
    await userEvent.tab();
  },
};
