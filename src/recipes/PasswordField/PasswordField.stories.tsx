import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { recipeDecorator } from '../storybook';
import { PasswordField } from './PasswordField';

const meta = {
  title: 'Recipes/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
  decorators: [recipeDecorator({ maxWidth: 360, minHeight: 120 })],
  parameters: {
    visual: { width: 392 },
    docs: { story: { inline: false, iframeHeight: 160 } },
  },
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signing in: `autoComplete="current-password"`. */
export const Default: Story = {};

/** Creating or changing a password: `autoComplete="new-password"` and a rule in the description. */
export const NewPassword: Story = {
  args: {
    mode: 'new',
    label: 'New password',
    description: 'Use at least 12 characters. Pasting is allowed.',
  },
};

export const Invalid: Story = {
  args: { isInvalid: true, errorMessage: 'Enter your password.' },
};

export const Disabled: Story = { args: { isDisabled: true } };

/** The toggle reveals the text; its name changes with it. */
export const Revealed: Story = {
  parameters: { visual: { play: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Password'), 'correct horse');
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
    await expect(canvas.getByLabelText('Password')).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', { name: 'Hide password' })).toBeVisible();
  },
};

/** Strings come from the consumer's catalog. */
export const Portuguese: Story = {
  args: {
    label: 'Senha',
    labels: {
      show: 'Mostrar',
      hide: 'Ocultar',
      showPassword: 'Mostrar senha',
      hidePassword: 'Ocultar senha',
      shown: 'Senha visível',
      hidden: 'Senha oculta',
    },
  },
};
