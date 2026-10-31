import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Checkbox } from './Checkbox';
import type { CheckboxProps } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Email me a weekly summary' },
} satisfies Meta<WithLabel<CheckboxProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox', {
      name: 'Email me a weekly summary',
    });
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(checkbox).not.toBeChecked();
  },
};

export const Checked: Story = {
  args: { defaultSelected: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toBeChecked();
  },
};

export const Indeterminate: Story = {
  args: { isIndeterminate: true },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole<HTMLInputElement>('checkbox');
    await expect(input.indeterminate).toBe(true);
  },
};

export const WithDescription: Story = {
  args: {
    description: 'One email on Monday morning. You can unsubscribe at any time.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toHaveAccessibleDescription(
      'One email on Monday morning. You can unsubscribe at any time.',
    );
  },
};

export const Required: Story = {
  args: { label: 'I accept the terms', isRequired: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toBeRequired();
  },
};

export const Invalid: Story = {
  args: {
    label: 'I accept the terms',
    isInvalid: true,
    errorMessage: 'Accept the terms to continue.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toHaveAccessibleDescription(
      'Accept the terms to continue.',
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultSelected: true, description: 'Managed by your administrator.' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultSelected: true },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

export const LongLabel: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label:
      'I confirm that the shipping address, the billing address and the tax identification number are correct',
    description: 'Orders cannot be edited after they are packed, so check these details twice.',
  },
};

export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Select row' },
};

export const InAGroup: Story = {
  render: () => (
    <CheckboxGroup
      label="Notify me about"
      description="Choose at least one."
      name="topics"
      defaultValue={['orders']}
    >
      <Checkbox value="orders" label="New orders" />
      <Checkbox
        value="stock"
        label="Low stock"
        description="When a fabric drops below its minimum."
      />
      <Checkbox value="payments" label="Failed payments" />
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Notify me about' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Low stock' }));
    await expect(canvas.getByRole('checkbox', { name: 'Low stock' })).toBeChecked();
  },
};

export const GroupHorizontal: Story = {
  render: () => (
    <CheckboxGroup label="Sizes" orientation="horizontal">
      <Checkbox value="s" label="Small" />
      <Checkbox value="m" label="Medium" />
      <Checkbox value="l" label="Large" />
    </CheckboxGroup>
  ),
};

export const GroupInvalid: Story = {
  render: () => (
    <CheckboxGroup label="Notify me about" isInvalid errorMessage="Choose at least one topic.">
      <Checkbox value="orders" label="New orders" />
      <Checkbox value="stock" label="Low stock" />
    </CheckboxGroup>
  ),
};
