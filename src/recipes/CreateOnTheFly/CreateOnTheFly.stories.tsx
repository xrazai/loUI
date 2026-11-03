import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, expectToast, recipeDecorator } from '../storybook';
import { CreateOnTheFly } from './CreateOnTheFly';

const meta = {
  title: 'Recipes/CreateOnTheFly',
  component: CreateOnTheFly,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 420, minHeight: 360 })],
  beforeEach: clearToastsAfterStory,
  parameters: {
    visual: { width: 452 },
    docs: { story: { inline: false, iframeHeight: 400 } },
  },
} satisfies Meta<typeof CreateOnTheFly>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The typed name matches no label: the list ends with a Create row. */
export const CreateRow: Story = {
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Label' });
    await userEvent.click(input);
    await userEvent.keyboard('Teal');
    await expect(await screen.findByRole('option', { name: 'Create “Teal”' })).toBeVisible();
  },
};

/** Create, then the new label is selected and a toast offers Undo. */
export const CreateSelectAndUndo: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Label' });
    await userEvent.click(input);
    await userEvent.keyboard('Teal');
    await userEvent.click(await screen.findByRole('option', { name: 'Create “Teal”' }));
    await expectToast(/Label “Teal” created/);
    await waitFor(() => expect(input).toHaveValue('Teal'));
    await expect(canvas.getByText('Selected: Teal')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect(await canvas.findByText('No label selected')).toBeVisible();
  },
};
