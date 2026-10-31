import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter, Progress } from './Progress';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 62, label: 'Storage', meta: '6.2 / 10 GB', valueLabel: '6.2 of 10 GB' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['accent', 'success', 'warning', 'danger'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  args: { label: undefined, meta: undefined, valueLabel: undefined, 'aria-label': 'Upload' },
};

export const ShowValue: Story = {
  args: { label: 'Upload', meta: undefined, valueLabel: undefined, showValue: true, value: 40 },
};

export const Empty: Story = {
  args: { value: 0, label: 'Not started', meta: undefined, valueLabel: undefined },
};

export const Complete: Story = {
  args: { value: 100, tone: 'success', label: 'Backup', meta: 'Done', valueLabel: 'Done' },
};

export const Warning: Story = { args: { value: 82, tone: 'warning', label: 'Quota' } };

export const Danger: Story = { args: { value: 97, tone: 'danger', label: 'Errors' } };

export const Indeterminate: Story = {
  args: {
    isIndeterminate: true,
    label: 'Importing orders',
    meta: undefined,
    valueLabel: undefined,
  },
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-4)' }}>
      <Progress value={62} label="Accent" showValue />
      <Progress value={100} tone="success" label="Success" showValue />
      <Progress value={82} tone="warning" label="Warning" showValue />
      <Progress value={97} tone="danger" label="Danger" showValue />
    </div>
  ),
};

export const AsMeter: Story = {
  name: 'Meter',
  render: () => (
    <Meter
      value={62}
      label="Disk used"
      meta="6.2 / 10 GB"
      valueLabel="6.2 of 10 GB"
      tone="warning"
    />
  ),
};

export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <Progress {...args} />
    </div>
  ),
};
