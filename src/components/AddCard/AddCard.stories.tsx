import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Card } from '../Card';
import { Grid } from '../Grid';
import { StoryFrame } from '../../test/StoryFrame';
import { AddCard } from './AddCard';
import type { AddCardProps } from './AddCard';

type ButtonArgs = Extract<AddCardProps, { href?: undefined }>;

const meta = {
  title: 'Components/AddCard',
  component: AddCard,
  tags: ['autodocs'],
  args: { children: 'Create agent', onPress: fn() },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Create agent' });
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

export const AsLink: Story = {
  render: () => <AddCard href="#new-agent">Create agent</AddCard>,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Create agent' });
    await expect(link).toHaveAttribute('href', '#new-agent');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
};

/** Keyboard focus draws the accent border and ring. */
export const Focused: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const LongText: Story = {
  args: { children: 'Create a new agent with a very long label that wraps inside the tile' },
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

/** In a grid the tile stretches to the height of the tallest card in its row. */
export const InGrid: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={760}>
        <Story />
      </StoryFrame>
    ),
  ],
  render: () => (
    <Grid minItemWidth="md" gap={4}>
      <Card title="Support agent">Answers customer reviews. 24 replies this week.</Card>
      <Card title="Sales agent">Drafts quotes for approval.</Card>
      <AddCard onPress={() => undefined}>Create agent</AddCard>
    </Grid>
  ),
};
