import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Input } from '../Input';
import { Radio, RadioGroup } from '../RadioGroup';
import { FieldSet } from './FieldSet';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/FieldSet',
  component: FieldSet,
  tags: ['autodocs'],
  args: {
    legend: 'Billing address',
    children: [
      <Input key="street" label="Street" name="street" />,
      <Input key="city" label="City" name="city" />,
    ],
  },
  decorators: [
    (Story) => (
      <StoryFrame width={360}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<typeof FieldSet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('group', { name: 'Billing address' }),
    ).toBeInTheDocument();
  },
};

export const WithDescription: Story = {
  args: { description: 'Shown on every invoice you send.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('group')).toHaveAccessibleDescription(
      'Shown on every invoice you send.',
    );
  },
};

/** Every native control inside is disabled together. */
export const Disabled: Story = {
  args: {
    isDisabled: true,
    description: 'Managed by your administrator.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Street' })).toBeDisabled();
  },
};

export const WithRadioGroup: Story = {
  args: {
    legend: 'Notifications',
    children: (
      <RadioGroup label="Frequency" defaultValue="daily">
        <Radio value="daily" label="Daily summary" />
        <Radio value="instant" label="Instantly" />
      </RadioGroup>
    ),
  },
};

export const LongText: Story = {
  args: {
    legend: 'A very long group caption that has to wrap inside a narrow column',
    description:
      'A long description that explains the group in more words than fit on one line of a narrow column.',
  },
  decorators: [
    (Story) => (
      <StoryFrame width={240}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" width={360}>
        <Story />
      </StoryFrame>
    ),
  ],
};
