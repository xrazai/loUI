import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { clearToastsAfterStory, recipeDecorator } from '../storybook';
import { FormWithValidation } from './FormWithValidation';
import type { ServerErrors } from './FormWithValidation';

const saved = (): Promise<ServerErrors | undefined> => Promise.resolve(undefined);

const meta = {
  title: 'Recipes/FormWithValidation',
  component: FormWithValidation,
  tags: ['autodocs'],
  args: { saveCustomer: fn(saved) },
  decorators: [recipeDecorator({ maxWidth: 560 })],
  beforeEach: clearToastsAfterStory,
} satisfies Meta<typeof FormWithValidation>;

export default meta;

/** The country is required; its options render in a popover outside the canvas. */
async function chooseCountry(canvasElement: HTMLElement) {
  await userEvent.click(within(canvasElement).getByRole('button', { name: /Country/ }));
  await userEvent.click(await within(document.body).findByRole('option', { name: 'Brazil' }));
}

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Saving an empty form lists every problem and moves focus to the summary. */
export const SubmitEmpty: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    const summary = (await canvas.findAllByRole('alert')).find((node) =>
      node.textContent.includes('before saving'),
    );
    await expect(summary).toHaveFocus();
    await expect(canvas.getAllByText("Enter the customer's full name.").length).toBeGreaterThan(0);
    await expect(args.saveCustomer).not.toHaveBeenCalled();
  },
};

/** A valid form saves and says "Saved". */
export const Saved: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /Full name/ }), 'Ana Souza');
    await userEvent.type(canvas.getByRole('textbox', { name: /Email/ }), 'ana@example.com');
    await chooseCountry(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Saved'));
    await expect(args.saveCustomer).toHaveBeenCalledTimes(1);
  },
};

/** The server rejects the email: its message appears on the field and in the summary. */
export const ServerError: Story = {
  args: {
    saveCustomer: fn(() =>
      Promise.resolve<ServerErrors>({
        email: 'This email belongs to another customer. Enter a different email.',
      }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: /Full name/ }), 'Ana Souza');
    await userEvent.type(canvas.getByRole('textbox', { name: /Email/ }), 'taken@example.com');
    await chooseCountry(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save customer' }));
    await waitFor(() =>
      expect(
        canvas.getAllByText('This email belongs to another customer. Enter a different email.')
          .length,
      ).toBeGreaterThan(0),
    );
  },
};
