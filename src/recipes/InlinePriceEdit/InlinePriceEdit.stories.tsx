import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { recipeDecorator } from '../storybook';
import { InlinePriceEdit } from './InlinePriceEdit';

const meta = {
  title: 'Recipes/InlinePriceEdit',
  component: InlinePriceEdit,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 560, minHeight: 160 })],
  parameters: {
    visual: { width: 592 },
    docs: { story: { inline: false, iframeHeight: 200 } },
  },
} satisfies Meta<typeof InlinePriceEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { initialPrice: 1250 } };

/** No price of its own: the button shows the inherited price. */
export const Inheriting: Story = { args: { initialPrice: null } };

/** Editing an inheriting price: the placeholder shows the inherited price while empty. */
export const EditingEmpty: Story = {
  args: { initialPrice: null },
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Edit price of/ }));
    await expect(canvas.getByRole('textbox')).toHaveAttribute('placeholder', '$49.90');
  },
};

export const EnterConfirms: Story = {
  args: { initialPrice: 1250, onSave: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Edit price of/ }));
    await userEvent.keyboard('{Control>}a{/Control}{Delete}1800{Enter}');
    await expect(args.onSave).toHaveBeenCalledWith(1800);
    await expect(canvas.getByRole('status')).toHaveTextContent('Price saved: $18.00');
  },
};

export const EscapeCancels: Story = {
  args: { initialPrice: 1250, onSave: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Edit price of/ }));
    await userEvent.keyboard('999{Escape}');
    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(canvas.getByRole('button', { name: /\$12\.50/ })).toHaveFocus();
  },
};
