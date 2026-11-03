import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { parseColor } from 'react-aria-components';
import type { Color } from 'react-aria-components';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { WithLabel } from '../Field';
import { DSProvider } from '../../providers/DSProvider';
import { ColorField } from './ColorField';
import type { ColorFieldProps } from './ColorField';
import { StoryFrame } from '../../test/StoryFrame';

const meta = {
  title: 'Components/ColorField',
  component: ColorField,
  tags: ['autodocs'],
  args: { label: 'Hex', defaultValue: '#C2603E' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={280}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<ColorFieldProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Hex' });
    await expect(field).toHaveValue('#C2603E');
  },
};

export const WithValue: Story = {
  args: { description: 'Colour of the fabric as dyed.', defaultValue: '#336699' },
};

export const Empty: Story = {
  args: { defaultValue: null, placeholder: '#RRGGBB' },
};

export const NormalisesOnBlur: Story = {
  args: { defaultValue: null },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Hex' });
    await userEvent.type(field, '#abc');
    await userEvent.tab();
    await expect(field).toHaveValue('#AABBCC');
  },
};

export const KeyboardContract: Story = {
  args: { defaultValue: '#000010' },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Hex' });
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(field).toHaveValue('#000011');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(field).toHaveValue('#00000F');
  },
};

export const Required: Story = {
  args: { isRequired: true },
};

export const Invalid: Story = {
  args: { isInvalid: true, defaultValue: '#336699' },
};

export const CustomError: Story = {
  args: { isInvalid: true, errorMessage: 'This colour is already in the catalogue.' },
};

export const DescriptionTone: Story = {
  args: { description: 'Close to an existing colour.', descriptionTone: 'warning' },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--ds-space-4)' }}>
      <ColorField {...args} size="sm" label="Small" />
      <ColorField {...args} size="md" label="Medium" />
      <ColorField {...args} size="lg" label="Large" />
    </div>
  ),
};

function ControlledField(args: ColorFieldProps) {
  const [value, setValue] = useState<Color | null>(parseColor('#112233'));
  return (
    <>
      <ColorField {...args} value={value} onChange={setValue} />
      <p>
        <output data-testid="mirror">{value ? value.toString('hex') : 'none'}</output>
      </p>
    </>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox');
    await userEvent.clear(field);
    await userEvent.type(field, '445566');
    await userEvent.tab();
    await expect(canvas.getByTestId('mirror')).toHaveTextContent('#445566');
  },
};

export const Brazilian: Story = {
  args: { label: 'Cor', isInvalid: true },
  decorators: [
    (Story) => (
      <DSProvider locale="pt-BR">
        <Story />
      </DSProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox')).toHaveAccessibleDescription(
      'Informe uma cor no formato #RRGGBB.',
    );
  },
};
