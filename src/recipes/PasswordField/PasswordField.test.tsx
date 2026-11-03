import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { PasswordField } from './PasswordField';

describe('PasswordField', () => {
  it('hides the text by default and names the field', async () => {
    const screen = await renderWithProvider(<PasswordField />);
    await expect.element(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('sets autocomplete for signing in and for a new password, never off', async () => {
    const screen = await renderWithProvider(<PasswordField />);
    await expect
      .element(screen.getByLabelText('Password'))
      .toHaveAttribute('autocomplete', 'current-password');
    await screen.rerender(<PasswordField mode="new" label="New password" />);
    await expect
      .element(screen.getByLabelText('New password'))
      .toHaveAttribute('autocomplete', 'new-password');
  });

  it('turns spell checking off', async () => {
    const screen = await renderWithProvider(<PasswordField />);
    const input = screen.getByLabelText('Password');
    await expect.element(input).toHaveAttribute('spellcheck', 'false');
  });

  it('toggles visibility with the keyboard, changes the name and announces it', async () => {
    const screen = await renderWithProvider(<PasswordField />);
    const input = screen.getByLabelText('Password');
    await userEvent.tab();
    await userEvent.keyboard('secret');
    await userEvent.tab();
    const show = screen.getByRole('button', { name: 'Show password' });
    await expect.element(show).toHaveFocus();
    await expect.element(show).toHaveTextContent('Show');
    await userEvent.keyboard('{Enter}');
    await expect.element(input).toHaveAttribute('type', 'text');
    await expect.element(input).toHaveValue('secret');
    await expect.element(screen.getByRole('button', { name: 'Hide password' })).toHaveFocus();
    await expect.element(screen.getByRole('status')).toHaveTextContent('Password shown');
    await userEvent.keyboard(' ');
    await expect.element(input).toHaveAttribute('type', 'password');
    await expect.element(screen.getByRole('status')).toHaveTextContent('Password hidden');
  });

  it('keeps the visible text inside the accessible name (WCAG 2.5.3)', async () => {
    const screen = await renderWithProvider(<PasswordField />);
    const button = screen.getByRole('button', { name: 'Show password' }).element();
    const name = button.getAttribute('aria-label') ?? '';
    expect(name.toLowerCase()).toContain(button.textContent.toLowerCase());
  });

  it('does not block pasting', async () => {
    const onPaste = vi.fn();
    const screen = await renderWithProvider(<PasswordField onPaste={onPaste} />);
    const input = screen.getByLabelText('Password').element();
    const event = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('takes translated labels', async () => {
    const screen = await renderWithProvider(
      <PasswordField label="Senha" labels={{ show: 'Mostrar', showPassword: 'Mostrar senha' }} />,
    );
    await expect.element(screen.getByRole('button', { name: 'Mostrar senha' })).toBeVisible();
  });

  it('links the description and the error to the field', async () => {
    const screen = await renderWithProvider(
      <PasswordField description="At least 12 characters." isInvalid errorMessage="Too short." />,
    );
    const input = screen.getByLabelText('Password');
    await expect.element(input).toHaveAccessibleDescription(/Too short/);
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no axe violations in either state', async () => {
    const screen = await renderWithProvider(
      <PasswordField description="Use at least 12 characters." />,
    );
    await expectNoA11yViolations(screen.container);
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    await expectNoA11yViolations(screen.container);
  });
});
