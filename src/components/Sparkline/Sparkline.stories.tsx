import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import { StoryFrame } from '../../test/StoryFrame';
import { Sparkline } from './Sparkline';

const data = [3, 5, 4, 8, 6, 9, 7, 11, 10, 14];

const meta = {
  title: 'Components/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  args: { data, 'aria-label': 'Orders, last 10 days: up 367%' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'area'] },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: 'Orders, last 10 days: up 367%' }),
    ).toBeInTheDocument();
  },
};

export const Area: Story = { args: { variant: 'area' } };

export const Accent: Story = { args: { tone: 'accent', variant: 'area' } };

export const Success: Story = { args: { tone: 'success', variant: 'area' } };

export const Warning: Story = { args: { tone: 'warning' } };

export const Danger: Story = {
  args: {
    tone: 'danger',
    data: [14, 12, 13, 9, 10, 6, 7, 3],
    'aria-label': 'Stock, last 8 days: down 79%',
  },
};

export const LastValue: Story = { args: { showLast: true, tone: 'accent' } };

export const MinMax: Story = { args: { showMinMax: true, showLast: true } };

export const Larger: Story = {
  args: { width: 240, height: 56, variant: 'area', showMinMax: true, showLast: true },
};

export const IncludeZero: Story = { args: { includeZero: true, data: [90, 92, 91, 95] } };

export const FlatSeries: Story = {
  args: { data: [5, 5, 5, 5], 'aria-label': 'Stock level, unchanged' },
};

export const WithGaps: Story = {
  args: { data: [3, 5, 4, null, null, 9, 7, 11], 'aria-label': 'Orders, two days missing' },
};

export const SinglePoint: Story = { args: { data: [4], 'aria-label': 'One day of data' } };

export const Empty: Story = { args: { data: [], 'aria-label': 'No data yet' } };

export const Decorative: Story = {
  args: { decorative: true, 'aria-label': undefined },
  render: (args) => (
    <p>
      Orders 1,248 <Sparkline {...args} /> +12%
    </p>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('img')).toBeNull();
  },
};

export const NarrowContainer: Story = {
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={48}>
        <Story />
      </StoryFrame>
    ),
  ],
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
