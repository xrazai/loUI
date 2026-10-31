import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DSProvider } from '../../providers/DSProvider';
import type { WithLabel } from '../Field';
import { StoryFrame } from '../../test/StoryFrame';
import { TagInput } from './TagInput';
import type { TagInputProps } from './TagInput';

const meta = {
  title: 'Components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  args: { label: 'Products', placeholder: 'Add a product', onChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={360}>
        <Story />
      </StoryFrame>
    ),
  ],
} satisfies Meta<WithLabel<TagInputProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Products' })).toBeInTheDocument();
  },
};

/** Enter and the comma add a tag; the input is cleared each time. */
export const AddWithKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Products' });
    await userEvent.click(input);
    await userEvent.keyboard('notebook{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['notebook']);
    await userEvent.keyboard('headphones,');
    await expect(args.onChange).toHaveBeenLastCalledWith(['notebook', 'headphones']);
    await expect(canvas.getByRole('button', { name: 'Remove headphones' })).toBeInTheDocument();
    await expect(input).toHaveValue('');
  },
};

export const WithTags: Story = {
  args: { defaultValue: ['notebook', 'backpack', 'headphones'] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('grid', { name: 'Products, added tags' }),
    ).toBeInTheDocument();
  },
};

/** `Backspace` on the empty input removes the last tag. */
export const BackspaceRemovesLast: Story = {
  args: { defaultValue: ['notebook', 'backpack', 'headphones'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Products' }));
    await userEvent.keyboard('{Backspace}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['notebook', 'backpack']);
    await expect(canvas.queryByRole('button', { name: 'Remove headphones' })).toBeNull();
  },
};

/** The input is a tab stop of its own; `Shift+Tab` reaches the tags, where `Delete` removes one. */
export const RemoveWithKeyboard: Story = {
  args: { defaultValue: ['notebook', 'backpack'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Products' }));
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{Delete}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['notebook']);
  },
};

/** A duplicate is ignored (case does not matter) and a polite message says so. */
export const Duplicate: Story = {
  args: { defaultValue: ['Notebook'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Products' }));
    await userEvent.keyboard('notebook{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getAllByText('“notebook” is already added.').length).toBeGreaterThan(0);
  },
};

export const MaxTags: Story = {
  args: {
    defaultValue: ['notebook', 'headphones'],
    maxTags: 2,
    description: 'Up to 2 products.',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Products' });
    await userEvent.click(input);
    await userEvent.keyboard('lamp{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('alert')).toHaveTextContent('You can add up to 2 tags.');
    await expect(input).toBeInvalid();
  },
};

export const Validation: Story = {
  args: {
    description: 'One word per product.',
    validateTag: (tag) => (/\s/.test(tag) ? 'Use one word per product.' : undefined),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Products' }));
    await userEvent.keyboard('wireless headphones{Enter}');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Use one word per product.');
  },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Add at least one product.' },
};

export const Required: Story = { args: { isRequired: true } };

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: ['notebook', 'headphones'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Products' })).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: { isReadOnly: true, defaultValue: ['notebook', 'headphones'] },
};

export const Small: Story = { args: { size: 'sm', defaultValue: ['notebook'] } };

export const Large: Story = { args: { size: 'lg', defaultValue: ['notebook'] } };

export const ManyTagsWrap: Story = {
  args: {
    defaultValue: [
      'wireless headphones',
      'leather notebook',
      'canvas backpack',
      'brass desk lamp',
      'ceramic mug',
      'jacquard',
    ],
  },
};

export const LongTag: Story = {
  args: { defaultValue: ['Awaiting supplier confirmation for the previous quarter shipment'] },
  decorators: [
    (Story) => (
      <StoryFrame maxWidth={220}>
        <Story />
      </StoryFrame>
    ),
  ],
};

export const SemicolonDelimiter: Story = {
  args: { delimiters: [';'], description: 'Separate with semicolons.' },
};

function ControlledExample() {
  const [tags, setTags] = useState<string[]>(['notebook']);
  return (
    <>
      <TagInput label="Products" value={tags} onChange={setTags} />
      <p>Tags: {tags.join(', ') || 'none'}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Products' }));
    await userEvent.keyboard('headphones{Enter}');
    await expect(canvas.getByText('Tags: notebook, headphones')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove notebook' }));
    await expect(canvas.getByText('Tags: headphones')).toBeInTheDocument();
  },
};

export const InForm: Story = {
  args: { name: 'products', defaultValue: ['notebook', 'headphones'] },
  render: (args) => (
    <form>
      <TagInput {...args} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    await expect(form ? new FormData(form).getAll('products') : []).toEqual([
      'notebook',
      'headphones',
    ]);
  },
};

export const Portuguese: Story = {
  args: { label: 'Produtos', placeholder: 'Adicione um produto', defaultValue: ['caderno'] },
  render: (args) => (
    <DSProvider locale="pt-BR">
      <TagInput {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Remover caderno' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('textbox', { name: 'Produtos' }));
    await userEvent.keyboard('caderno{Enter}');
    await expect(canvas.getAllByText('“caderno” já foi adicionada.').length).toBeGreaterThan(0);
  },
};

export const RightToLeft: Story = {
  args: { defaultValue: ['notebook', 'headphones'] },
  decorators: [
    (Story) => (
      <DSProvider locale="ar">
        <div dir="rtl">
          <Story />
        </div>
      </DSProvider>
    ),
  ],
};

export const Focused: Story = {
  args: { defaultValue: ['notebook'] },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('textbox', { name: 'Products' }));
  },
};
