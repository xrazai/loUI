import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon } from '../Icon';
import { SearchIcon } from '../Icon/icons';
import type { WithLabel } from '../Field';
import { Input } from './Input';
import type { InputProps } from './Input';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: { label: 'Workspace name', placeholder: 'e.g. Northwind' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<InputProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Workspace name' });
    await userEvent.type(input, 'Acme');
    await expect(input).toHaveValue('Acme');
  },
};

export const WithDescription: Story = {
  args: { description: 'Visible to everyone on the team.' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await expect(input).toHaveAccessibleDescription('Visible to everyone on the team.');
  },
};

export const Required: Story = {
  args: { isRequired: true, description: 'Used in invoices.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toBeRequired();
  },
};

export const Invalid: Story = {
  args: {
    label: 'Email',
    placeholder: 'name@company.com',
    defaultValue: 'name@',
    isInvalid: true,
    errorMessage: 'Enter a complete email address.',
    description: 'We send the receipt here.',
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'We send the receipt here. Enter a complete email address.',
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'Northwind' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'ORD-1048' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.type(input, 'x');
    await expect(input).toHaveValue('ORD-1048');
  },
};

export const Mono: Story = {
  args: { label: 'Order code', mono: true, defaultValue: 'ORD-1048' },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <Input {...args} size="sm" label="Small" />
      <Input {...args} size="md" label="Medium" />
      <Input {...args} size="lg" label="Large" />
    </div>
  ),
};

export const WithAdornments: Story = {
  args: {
    label: 'Search orders',
    placeholder: 'Search orders',
    leading: <Icon icon={SearchIcon} />,
    trailing: <span aria-hidden="true">kg</span>,
  },
};

export const LongLabel: Story = {
  args: {
    label:
      'Name of the workspace that will be shown to every member of the team and on every invoice',
    description:
      'A long description wraps onto several lines and stays associated with the field, even in a narrow column.',
  },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const FocusKeepsRingWithConsumerHandlers: Story = {
  args: { onFocus: fn(), onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.click(input);
    await expect(args.onFocus).toHaveBeenCalledTimes(1);
    await expect(input).toHaveAttribute('data-focused', 'true');
  },
};
