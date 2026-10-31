import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Heading } from './Heading';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: { children: 'Recent orders' },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'inline-radio', options: ['display', 'title', 'heading'] },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', { level: 2, name: 'Recent orders' }),
    ).toBeInTheDocument();
  },
};

export const Display: Story = { args: { level: 1, size: 'display' } };

export const Title: Story = { args: { level: 1, size: 'title' } };

export const HeadingSize: Story = { args: { level: 2, size: 'heading' } };

/** The level is the outline, the size is the look: an h2 can be small and an h3 can be big. */
export const LevelIndependentOfSize: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
      <Heading level={2} size="heading">
        h2 with the heading size
      </Heading>
      <Heading level={3} size="display">
        h3 with the display size
      </Heading>
    </div>
  ),
};

export const LongText: Story = {
  args: {
    level: 2,
    size: 'title',
    children:
      'A very long heading that has to wrap onto several lines inside a narrow column without breaking the layout',
  },
  decorators: [
    (Story) => (
      <StoryFrame width={260}>
        <Story />
      </StoryFrame>
    ),
  ],
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
