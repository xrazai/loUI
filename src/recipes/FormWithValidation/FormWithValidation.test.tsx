import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { FormWithValidation } from './FormWithValidation';
import type { FormWithValidationProps } from './FormWithValidation';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup(props: FormWithValidationProps = {}) {
  return renderWithProvider(
    <RecipeHost>
      <FormWithValidation {...props} />
    </RecipeHost>,
  );
}

const summary = (screen: Screen) => screen.getByRole('alert').filter({ hasText: /before saving/ });
const save = (screen: Screen) => screen.getByRole('button', { name: 'Save customer' });

async function fillValid(screen: Screen, email = 'ana@example.com') {
  await userEvent.fill(screen.getByRole('textbox', { name: /Full name/ }), 'Ana Souza');
  await userEvent.fill(screen.getByRole('textbox', { name: /Email/ }), email);
  await userEvent.click(screen.getByRole('button', { name: /Country/ }));
  await userEvent.click(screen.getByRole('option', { name: 'Brazil' }));
}

describe('FormWithValidation', () => {
  it('shows a summary and a message per field when saved empty, and focuses the summary', async () => {
    const saveCustomer = vi.fn();
    const screen = await setup({ saveCustomer });
    await userEvent.click(save(screen));
    await expect
      .poll(() => summary(screen).element().textContent)
      .toMatch(/Fix 3 fields before saving/);
    await expect.element(summary(screen)).toHaveFocus();
    await expect.element(screen.getByText("Enter the customer's full name.").first()).toBeVisible();
    await expect.element(screen.getByText('Enter a complete email address.').first()).toBeVisible();
    // The required Select is listed under its label, not under its options.
    await expect.element(summary(screen).getByRole('link', { name: 'Country' })).toBeVisible();
    expect(saveCustomer).not.toHaveBeenCalled();
    // Save stays enabled so the user can always learn what is wrong.
    await expect.element(save(screen)).toBeEnabled();
  });

  it('explains how to fix a malformed email', async () => {
    const screen = await setup();
    await userEvent.fill(screen.getByRole('textbox', { name: /Email/ }), 'ana@');
    await userEvent.click(save(screen));
    await expect.element(screen.getByText('Enter a complete email address.').first()).toBeVisible();
  });

  it('saves a valid form and shows Saved, which goes away when the user edits again', async () => {
    const saveCustomer = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ saveCustomer });
    await fillValid(screen);
    await userEvent.click(save(screen));
    await expect.element(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(saveCustomer).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@example.com',
      street: '',
      country: 'br',
    });
    await userEvent.type(screen.getByRole('textbox', { name: /Street/ }), 'Rua A');
    await expect.element(screen.getByRole('status')).toHaveTextContent('');
  });

  it('puts a server error on its field, lists it in the summary and clears it on the next try', async () => {
    const saveCustomer = vi
      .fn()
      .mockResolvedValueOnce({
        email: 'This email belongs to another customer. Enter a different email.',
      })
      .mockResolvedValueOnce(undefined);
    const screen = await setup({ saveCustomer });
    await fillValid(screen, 'taken@example.com');
    await userEvent.click(save(screen));
    await expect
      .poll(() => summary(screen).element().textContent)
      .toMatch(/Fix 1 field before saving/);
    await expect
      .element(
        screen
          .getByText('This email belongs to another customer. Enter a different email.')
          .first(),
      )
      .toBeVisible();
    // Enter submits; clicking Save would race the summary disappearing on blur (layout shift).
    await userEvent.fill(screen.getByRole('textbox', { name: /Email/ }), 'other@example.com');
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('status')).toHaveTextContent('Saved');
    await expect.element(summary(screen)).not.toBeInTheDocument();
  });

  it('submits with Enter from a field', async () => {
    const saveCustomer = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ saveCustomer });
    await fillValid(screen);
    screen
      .getByRole('textbox', { name: /Street/ })
      .element()
      .focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('keeps the fields in reading order for the keyboard', async () => {
    const screen = await setup();
    await userEvent.tab();
    await expect.element(screen.getByRole('textbox', { name: /Full name/ })).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('textbox', { name: /Email/ })).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('textbox', { name: /Street/ })).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: /Country/ })).toHaveFocus();
    await userEvent.tab();
    await expect.element(save(screen)).toHaveFocus();
  });

  it('has no axe violations: empty, with errors and after saving', async () => {
    const screen = await setup({ saveCustomer: vi.fn().mockResolvedValue(undefined) });
    await expectNoViolationsOnceSettled();
    await userEvent.click(save(screen));
    await expect.element(summary(screen)).toBeVisible();
    await expectNoViolationsOnceSettled();
    await fillValid(screen);
    await userEvent.click(save(screen));
    await expect.element(screen.getByRole('status')).toHaveTextContent('Saved');
    await expectNoViolationsOnceSettled();
  });
});
