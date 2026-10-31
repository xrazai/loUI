import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Textarea } from './Textarea';
import type { TextareaProps } from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: { label: 'Notes', placeholder: 'Anything the team should know' },
  argTypes: {
    resize: { control: 'inline-radio', options: ['none', 'vertical', 'horizontal', 'both'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<WithLabel<TextareaProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Notes' });
    await userEvent.type(field, 'First line{Enter}Second line');
    await expect(field).toHaveValue('First line\nSecond line');
  },
};

export const WithDescription: Story = {
  args: { description: 'Only visible to your team.' },
};

export const WithAside: Story = {
  args: { aside: 'Optional', description: 'Plain text only.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveAccessibleDescription(
      'Plain text only. Optional',
    );
  },
};

export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toBeRequired();
  },
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    defaultValue: 'x',
    errorMessage: 'Write at least 20 characters so the team has context.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'Locked while the order is shipped.' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'Archived note.' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    await userEvent.type(field, 'x');
    await expect(field).toHaveValue('Archived note.');
  },
};

export const AutoGrow: Story = {
  args: { autoGrow: true, rows: 2 },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox');
    const before = field.getBoundingClientRect().height;
    await userEvent.type(field, '1{Enter}2{Enter}3{Enter}4{Enter}5');
    await waitFor(() => expect(field.getBoundingClientRect().height).toBeGreaterThan(before));
  },
};

export const WithCharacterCount: Story = {
  args: { maxLength: 40, showCount: true, description: 'Short and to the point.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'Hello');
    await expect(canvas.getByText('5 / 40')).toBeVisible();
  },
};

export const NoResize: Story = {
  args: { resize: 'none' },
};

export const LongLabel: Story = {
  args: {
    label:
      'Everything the warehouse team should know before packing this order, including fragile items and gift notes',
    aside: 'Optional',
  },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('textbox')).toHaveFocus();
  },
};
