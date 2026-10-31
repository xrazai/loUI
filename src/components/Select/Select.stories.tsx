import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Select } from './Select';
import type { SelectProps } from './Select';
import { StoryFrame } from '../../test/StoryFrame';

const regions = [
  { value: 'eu', label: 'EU: Frankfurt' },
  { value: 'us', label: 'US: Virginia' },
  { value: 'sa', label: 'SA: Sao Paulo' },
  { value: 'ap', label: 'AP: Singapore' },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: { label: 'Region', options: regions },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={320} minHeight={280}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<SelectProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /Region/ });
    await expect(trigger).toHaveTextContent('Select an option');
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByRole('option', { name: 'US: Virginia' }));
    await waitFor(() => expect(trigger).toHaveTextContent('US: Virginia'));
  },
};

export const KeyboardAndTypeahead: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /Region/ });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = await screen.findByRole('listbox');
    await expect(listbox).toBeVisible();
    await userEvent.keyboard('s');
    await waitFor(() =>
      expect(within(listbox).getByRole('option', { name: 'SA: Sao Paulo' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveTextContent('SA: Sao Paulo'));
    await expect(trigger).toHaveFocus();
  },
};

export const EscapeClosesAndRestoresFocus: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /Region/ });
    await userEvent.click(trigger);
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** The listbox open under the trigger, for the visual review (TEST-020). */
export const Open: Story = {
  args: { defaultValue: 'us' },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Region/ }));
    await screen.findByRole('listbox');
  },
};

export const WithSelection: Story = {
  args: { defaultValue: 'sa' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /Region/ })).toHaveTextContent(
      'SA: Sao Paulo',
    );
  },
};

export const WithDescription: Story = {
  args: { description: 'Where your data is stored.' },
};

export const Required: Story = {
  args: { isRequired: true },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose a region to continue.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: /Region/ })).toHaveAttribute(
      'aria-describedby',
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'eu' },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <Select {...args} size="sm" label="Small" />
      <Select {...args} size="md" label="Medium" />
      <Select {...args} size="lg" label="Large" />
    </div>
  ),
};

export const DisabledOptions: Story = {
  args: {
    options: [
      { value: 'eu', label: 'EU: Frankfurt' },
      { value: 'us', label: 'US: Virginia', isDisabled: true },
      { value: 'sa', label: 'SA: Sao Paulo' },
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Region/ }));
    const listbox = await screen.findByRole('listbox');
    await expect(within(listbox).getByRole('option', { name: 'US: Virginia' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const Sections: Story = {
  args: {
    options: [
      {
        id: 'europe',
        label: 'Europe',
        options: [
          { value: 'eu-fra', label: 'Frankfurt' },
          { value: 'eu-par', label: 'Paris' },
        ],
      },
      {
        id: 'americas',
        label: 'Americas',
        options: [
          { value: 'us-va', label: 'Virginia' },
          { value: 'sa-sp', label: 'Sao Paulo' },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Region/ }));
    const listbox = await screen.findByRole('listbox');
    await expect(within(listbox).getByRole('group', { name: 'Europe' })).toBeInTheDocument();
    await expect(within(listbox).getByRole('group', { name: 'Americas' })).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  args: {
    label: 'Which warehouse should this order be shipped from by default?',
    defaultValue: 'long',
    options: [
      {
        value: 'long',
        label: 'Central distribution warehouse for the whole of northern and eastern Europe',
      },
      { value: 'short', label: 'Local pickup' },
    ],
  },
};
