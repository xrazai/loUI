import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers';
import { StoryFrame } from '../../test/StoryFrame';
import { ColorOption } from './ColorOption';
import { ColorOptionGroup } from './ColorOptionGroup';
import type { ColorOptionGroupProps } from './ColorOptionGroup';
import type { WithLabel } from '../../components/Field';

const colors = [
  { id: 'brick', color: '#c0392b', label: 'Brick red' },
  { id: 'green', color: '#27ae60', label: 'Green' },
  { id: 'mustard', color: '#f1c40f', label: 'Mustard' },
  { id: 'navy', color: '#1f3a93', label: 'Navy' },
];

/** Options are listed alphabetically by label (AGENTS.md 5b). */
function options(disabled?: string) {
  return colors.map((c) => <ColorOption key={c.id} {...c} isDisabled={c.id === disabled} />);
}

const meta = {
  title: 'Patterns/ColorOptionGroup',
  component: ColorOptionGroup,
  tags: ['autodocs'],
  args: { label: 'Available colors', onChange: fn(), children: options() },
  argTypes: { selectionMode: { control: 'inline-radio', options: ['multiple', 'single'] } },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<ColorOptionGroupProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Green' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['green']);
    await userEvent.click(canvas.getByRole('button', { name: 'Navy' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(['green', 'navy']);
  },
};

export const Preselected: Story = { args: { defaultValue: ['green', 'navy'] } };

export const WithDescription: Story = {
  args: { description: 'Customers can choose from the colors you tick.' },
};

export const DisabledItem: Story = {
  args: { defaultValue: ['green'], children: options('mustard') },
};

export const DisabledGroup: Story = { args: { isDisabled: true, defaultValue: ['green'] } };

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Choose at least one color.' },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('toolbar');
    const message = within(canvasElement).getByText('Choose at least one color.');
    await expect(group).toHaveAttribute('aria-describedby', message.id);
  },
};

export const SingleSelection: Story = {
  args: { selectionMode: 'single', defaultValue: ['navy'], label: 'Main color' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Green' }));
    await expect(canvas.getByRole('radio', { name: 'Green' })).toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Navy' })).not.toBeChecked();
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<string[]>(['brick']);
    return (
      <ColorOptionGroup {...args} value={value} onChange={setValue}>
        {options()}
      </ColorOptionGroup>
    );
  },
};

export const LongLabels: Story = {
  args: {
    defaultValue: ['a'],
    children: [
      <ColorOption
        key="a"
        id="a"
        color="#1f3a93"
        label="Midnight navy blue with a very long marketing name"
      />,
      <ColorOption
        key="b"
        id="b"
        color="#c0392b"
        label="Brick red, discontinued in the 2024 collection"
      />,
    ],
  },
};

export const SingleColumn: Story = { args: { columns: 1 } };

export const Portuguese: Story = {
  render: (args) => (
    <DSProvider locale="pt-BR">
      <ColorOptionGroup
        {...args}
        label="Cores disponíveis"
        description="O cliente escolhe entre as cores marcadas."
        isInvalid
        errorMessage="Escolha pelo menos uma cor."
      >
        <ColorOption id="azul" color="#1f3a93" label="Azul-marinho" />
        <ColorOption id="verde" color="#27ae60" label="Verde" />
        <ColorOption id="vermelho" color="#c0392b" label="Vermelho tijolo" />
      </ColorOptionGroup>
    </DSProvider>
  ),
};

export const RightToLeft: Story = {
  args: { defaultValue: ['green'] },
  decorators: [
    (Story) => (
      <StoryFrame dir="rtl" maxWidth={420}>
        <Story />
      </StoryFrame>
    ),
  ],
};

/** Arrow keys move between options and stop at the ends; Space toggles. */
export const KeyboardRoving: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Brick red' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Green' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.onChange).toHaveBeenLastCalledWith(['green']);
  },
};
