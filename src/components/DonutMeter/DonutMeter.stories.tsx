import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import type { WithLabel } from '../Field';
import { StoryFrame } from '../../test/StoryFrame';
import { DonutMeter } from './DonutMeter';
import type { DonutMeterProps } from './DonutMeter';

const meta = {
  title: 'Components/DonutMeter',
  component: DonutMeter,
  tags: ['autodocs'],
  args: { label: 'Storage used', value: 62 },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
} satisfies Meta<WithLabel<DonutMeterProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole('meter', { name: 'Storage used' });
    await expect(meter).toHaveAttribute('aria-valuenow', '62');
    await expect(meter).toHaveAttribute('aria-valuetext', '62%');
  },
};

export const Small: Story = { args: { size: 'sm' } };

export const Large: Story = { args: { size: 'lg' } };

export const Neutral: Story = { args: { tone: 'neutral' } };

export const Success: Story = { args: { tone: 'success', label: 'Goal reached', value: 100 } };

export const Warning: Story = { args: { tone: 'warning', label: 'Quota used', value: 85 } };

export const Danger: Story = { args: { tone: 'danger', label: 'Disk used', value: 97 } };

export const Empty: Story = { args: { value: 0, label: 'Not started' } };

export const Full: Story = { args: { value: 100, label: 'Complete', tone: 'success' } };

export const CustomRange: Story = {
  args: { label: 'Budget', value: 6.2, minValue: 0, maxValue: 10, valueLabel: '6.2 of 10 GB' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      '6.2 of 10 GB',
    );
  },
};

export const CustomCenter: Story = {
  args: { label: 'Trial', value: 40, centerLabel: '12 d', valueLabel: '12 days left', size: 'lg' },
};

export const WithoutCenterValue: Story = { args: { showValue: false } };

export const AriaLabelOnly: Story = {
  args: { label: undefined, 'aria-label': 'Disk used', value: 40 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('meter', { name: 'Disk used' })).toBeVisible();
  },
};

export const LongLabel: Story = {
  args: { label: 'Storage used by archived orders and attachments in the current plan' },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={160}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const Portuguese: Story = {
  args: { label: 'Armazenamento usado', value: 25.6 },
  render: (args) => (
    <DSProvider locale="pt-BR">
      <DonutMeter {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      expect.stringMatching(/26\s?%/),
    );
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
