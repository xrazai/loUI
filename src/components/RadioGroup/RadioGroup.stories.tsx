import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { Radio, RadioGroup } from './RadioGroup';
import type { RadioGroupProps } from './RadioGroup';

const options = [
  <Radio key="eu" value="eu" label="EU: Frankfurt" />,
  <Radio key="us" value="us" label="US: Virginia" />,
  <Radio key="sa" value="sa" label="SA: Sao Paulo" />,
];

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { label: 'Region', children: options },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
  },
} satisfies Meta<WithLabel<RadioGroupProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', { name: 'Region' })).toBeInTheDocument();
    // One tab stop: Tab lands on the first radio, arrows move and select, the last wraps to the first.
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'EU: Frankfurt' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'US: Virginia' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'EU: Frankfurt' })).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('radio', { name: 'SA: Sao Paulo' })).toBeChecked();
  },
};

export const WithSelection: Story = {
  args: { defaultValue: 'us' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio', { name: 'US: Virginia' })).toBeChecked();
  },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal', defaultValue: 'eu' },
};

export const WithDescriptions: Story = {
  args: {
    description: 'Where your data is stored. You cannot change this later.',
    children: [
      <Radio key="eu" value="eu" label="EU: Frankfurt" description="Lowest latency for Europe." />,
      <Radio key="us" value="us" label="US: Virginia" description="Default for new workspaces." />,
    ],
  },
};

export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radiogroup')).toBeRequired();
  },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose a region to continue.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radiogroup')).toHaveAccessibleDescription(
      'Choose a region to continue.',
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: 'eu' },
};

export const DisabledOption: Story = {
  args: {
    children: [
      <Radio key="eu" value="eu" label="EU: Frankfurt" />,
      <Radio key="us" value="us" label="US: Virginia" isDisabled />,
      <Radio key="sa" value="sa" label="SA: Sao Paulo" />,
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio', { name: 'US: Virginia' })).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: 'eu' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'US: Virginia' }));
    await expect(canvas.getByRole('radio', { name: 'EU: Frankfurt' })).toBeChecked();
  },
};

export const LongLabels: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Which delivery option should the customer see by default at checkout?',
    children: [
      <Radio
        key="a"
        value="a"
        label="Standard delivery within five to seven working days, tracked end to end"
      />,
      <Radio key="b" value="b" label="Express delivery" />,
    ],
  },
};
