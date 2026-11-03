import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { CreateOnTheFly } from './CreateOnTheFly';
import type { CreateOnTheFlyProps } from './CreateOnTheFly';

async function setup(props: CreateOnTheFlyProps = {}) {
  return renderWithProvider(
    <RecipeHost>
      <CreateOnTheFly {...props} />
    </RecipeHost>,
  );
}

afterEach(() => {
  vi.useRealTimers();
  act(() => {
    toast.clear();
  });
});

describe('CreateOnTheFly', () => {
  it('lists the labels alphabetically, each with a decorative swatch', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
    const names = [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent);
    expect(names).toEqual(['Fragile', 'Gift', 'Priority']);
    expect(document.querySelectorAll('[role="option"] > [aria-hidden="true"]')).toHaveLength(3);
  });

  it('offers Create only for a name that matches no label', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('combobox', { name: 'Label' }));
    await userEvent.keyboard('gift');
    await expect.element(screen.getByRole('option', { name: 'Gift' })).toBeVisible();
    expect(document.body.textContent).not.toContain('Create “');
    await userEvent.keyboard('s');
    await expect.element(screen.getByRole('option', { name: 'Create “gifts”' })).toBeVisible();
  });

  it('creates from the keyboard, selects the new label and shows a toast with Undo', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('combobox', { name: 'Label' }));
    await userEvent.keyboard('Teal{ArrowDown}{Enter}');
    await expect.element(screen.getByText(/Label “Teal” created/)).toBeVisible();
    await expect.element(screen.getByText('Selected: Teal')).toBeVisible();
    await expect
      .poll(() => (screen.getByRole('combobox').element() as HTMLInputElement).value)
      .toBe('Teal');
  });

  it('removes the label and restores the selection on Undo', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('combobox', { name: 'Label' }));
    await userEvent.keyboard('Teal{ArrowDown}{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect.element(screen.getByText('No label selected')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
    expect(
      [...document.querySelectorAll('[role="option"]')].map((option) => option.textContent),
    ).toEqual(['Fragile', 'Gift', 'Priority']);
  });

  it('saves only when the Undo window closes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    const saveLabel = vi.fn().mockResolvedValue(undefined);
    const screen = await setup({ saveLabel });
    await userEvent.click(screen.getByRole('combobox', { name: 'Label' }));
    await userEvent.keyboard('Teal{ArrowDown}{Enter}');
    expect(saveLabel).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    expect(saveLabel).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ label: 'Teal' }));
  });

  it('has no axe violations: closed, Create row open, and the toast', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await userEvent.click(screen.getByRole('combobox', { name: 'Label' }));
    await userEvent.keyboard('Teal');
    await expect.element(screen.getByRole('option', { name: 'Create “Teal”' })).toBeVisible();
    await expectNoViolationsOnceSettled();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect.element(screen.getByText(/Label “Teal” created/)).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
