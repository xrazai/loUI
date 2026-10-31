import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Switch } from './Switch';
import type { SwitchProps } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: 'Email notifications' },
  argTypes: {
    labelPlacement: { control: 'inline-radio', options: ['start', 'end'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<WithLabel<SwitchProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch', { name: 'Email notifications' });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
  },
};

export const On: Story = {
  args: { defaultSelected: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch')).toBeChecked();
  },
};

export const WithDescription: Story = {
  args: {
    description: 'We send a summary of new orders every morning.',
    defaultSelected: true,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch')).toHaveAccessibleDescription(
      'We send a summary of new orders every morning.',
    );
  },
};

export const LabelAtEnd: Story = {
  args: { labelPlacement: 'end', description: 'The track comes first.' },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultSelected: true, description: 'Managed by your administrator.' },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultSelected: true },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('switch');
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};

export const Required: Story = {
  args: { label: 'I accept the terms', isRequired: true },
};

export const Invalid: Story = {
  args: {
    label: 'I accept the terms',
    isInvalid: true,
    errorMessage: 'Accept the terms to continue.',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('switch')).toHaveAccessibleDescription(
      'Accept the terms to continue.',
    );
  },
};

export const LongLabel: Story = {
  args: {
    label:
      'Automatically archive every order that has been delivered, paid and left untouched for ninety days',
    description: 'Archived orders stay searchable and can be restored at any time.',
  },
};

export const WithoutVisibleLabel: Story = {
  args: { label: undefined, 'aria-label': 'Dark mode' },
};
