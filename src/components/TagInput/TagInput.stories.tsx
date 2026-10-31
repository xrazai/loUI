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
  args: { label: 'Fabrics', placeholder: 'Add a fabric', onChange: fn() },
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
    await expect(canvas.getByRole('textbox', { name: 'Fabrics' })).toBeInTheDocument();
  },
};

/** Enter and the comma add a tag; the input is cleared each time. */
export const AddWithKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Fabrics' });
    await userEvent.click(input);
    await userEvent.keyboard('linen{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['linen']);
    await userEvent.keyboard('silk,');
    await expect(args.onChange).toHaveBeenLastCalledWith(['linen', 'silk']);
    await expect(canvas.getByRole('button', { name: 'Remove silk' })).toBeInTheDocument();
    await expect(input).toHaveValue('');
  },
};

export const WithTags: Story = {
  args: { defaultValue: ['linen', 'cotton', 'silk'] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('grid', { name: 'Fabrics, added tags' }),
    ).toBeInTheDocument();
  },
};

/** `Backspace` on the empty input removes the last tag. */
export const BackspaceRemovesLast: Story = {
  args: { defaultValue: ['linen', 'cotton', 'silk'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Fabrics' }));
    await userEvent.keyboard('{Backspace}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['linen', 'cotton']);
    await expect(canvas.queryByRole('button', { name: 'Remove silk' })).toBeNull();
  },
};

/** The input is a tab stop of its own; `Shift+Tab` reaches the tags, where `Delete` removes one. */
export const RemoveWithKeyboard: Story = {
  args: { defaultValue: ['linen', 'cotton'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Fabrics' }));
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{Delete}');
    await expect(args.onChange).toHaveBeenLastCalledWith(['linen']);
  },
};

/** A duplicate is ignored (case does not matter) and a polite message says so. */
export const Duplicate: Story = {
  args: { defaultValue: ['Linen'] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Fabrics' }));
    await userEvent.keyboard('linen{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getAllByText('“linen” is already added.').length).toBeGreaterThan(0);
  },
};

export const MaxTags: Story = {
  args: {
    defaultValue: ['linen', 'silk'],
    maxTags: 2,
    description: 'Up to 2 fabrics.',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Fabrics' });
    await userEvent.click(input);
    await userEvent.keyboard('wool{Enter}');
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('alert')).toHaveTextContent('You can add up to 2 tags.');
    await expect(input).toBeInvalid();
  },
};

export const Validation: Story = {
  args: {
    description: 'One word per fabric.',
    validateTag: (tag) => (/\s/.test(tag) ? 'Use one word per fabric.' : undefined),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Fabrics' }));
    await userEvent.keyboard('organic cotton{Enter}');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Use one word per fabric.');
  },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Add at least one fabric.' },
};

export const Required: Story = { args: { isRequired: true } };

export const Disabled: Story = {
  args: { isDisabled: true, defaultValue: ['linen', 'silk'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Fabrics' })).toBeDisabled();
  },
};

export const ReadOnly: Story = { args: { isReadOnly: true, defaultValue: ['linen', 'silk'] } };

export const Small: Story = { args: { size: 'sm', defaultValue: ['linen'] } };

export const Large: Story = { args: { size: 'lg', defaultValue: ['linen'] } };

export const ManyTagsWrap: Story = {
  args: {
    defaultValue: [
      'organic cotton',
      'washed linen',
      'raw silk',
      'brushed wool',
      'viscose twill',
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
  const [tags, setTags] = useState<string[]>(['linen']);
  return (
    <>
      <TagInput label="Fabrics" value={tags} onChange={setTags} />
      <p>Tags: {tags.join(', ') || 'none'}</p>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox', { name: 'Fabrics' }));
    await userEvent.keyboard('silk{Enter}');
    await expect(canvas.getByText('Tags: linen, silk')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove linen' }));
    await expect(canvas.getByText('Tags: silk')).toBeInTheDocument();
  },
};

export const InForm: Story = {
  args: { name: 'fabrics', defaultValue: ['linen', 'silk'] },
  render: (args) => (
    <form>
      <TagInput {...args} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    await expect(form ? new FormData(form).getAll('fabrics') : []).toEqual(['linen', 'silk']);
  },
};

export const Portuguese: Story = {
  args: { label: 'Tecidos', placeholder: 'Adicione um tecido', defaultValue: ['linho'] },
  render: (args) => (
    <DSProvider locale="pt-BR">
      <TagInput {...args} />
    </DSProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Remover linho' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('textbox', { name: 'Tecidos' }));
    await userEvent.keyboard('linho{Enter}');
    await expect(canvas.getAllByText('“linho” já foi adicionada.').length).toBeGreaterThan(0);
  },
};

export const RightToLeft: Story = {
  args: { defaultValue: ['linen', 'silk'] },
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
  args: { defaultValue: ['linen'] },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('textbox', { name: 'Fabrics' }));
  },
};
