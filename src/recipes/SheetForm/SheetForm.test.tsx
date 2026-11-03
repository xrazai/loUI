import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { SheetForm } from './SheetForm';
import type { SupplierValues } from './SheetForm';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup(onSave: (values: SupplierValues) => void = () => undefined) {
  return renderWithProvider(
    <RecipeHost>
      <SheetForm onSave={onSave} />
    </RecipeHost>,
  );
}

const sheet = (screen: Screen) => screen.getByRole('dialog', { name: 'New supplier' });

async function openSheet(screen: Screen) {
  await userEvent.click(screen.getByRole('button', { name: 'New supplier' }));
  await expect.element(sheet(screen)).toBeVisible();
  return sheet(screen);
}

async function fillValid(screen: Screen) {
  await userEvent.fill(screen.getByRole('textbox', { name: /Name/ }), 'Northwind');
  await userEvent.fill(screen.getByRole('textbox', { name: /Email/ }), 'sales@northwind.test');
  await userEvent.click(screen.getByRole('button', { name: /Country/ }));
  await userEvent.click(screen.getByRole('option', { name: 'Brazil' }));
}

afterEach(() => {
  act(() => {
    toast.clear();
  });
});

describe('SheetForm', () => {
  it('has the submit button in the footer, outside the form, linked by the form attribute', async () => {
    const screen = await setup();
    const dialog = await openSheet(screen);
    const form = dialog.element().querySelector('form');
    const submit = dialog.getByRole('button', { name: 'Save supplier' }).element();
    expect(form?.id).toBeTruthy();
    expect(form?.contains(submit)).toBe(false);
    expect(submit.getAttribute('form')).toBe(form?.id);
    expect(dialog.element().querySelectorAll('button[data-variant="primary"]')).toHaveLength(1);
  });

  it('blocks an invalid submit, focuses the first invalid field and shows the errors', async () => {
    const onSave = vi.fn();
    const screen = await setup(onSave);
    const dialog = await openSheet(screen);
    await userEvent.click(dialog.getByRole('button', { name: 'Save supplier' }));
    expect(onSave).not.toHaveBeenCalled();
    await expect.element(dialog.getByRole('textbox', { name: /Name/ })).toHaveFocus();
    await expect.element(dialog.getByText("Enter the supplier's name.")).toBeVisible();
    await expect.element(dialog.getByText('Enter a complete email address.')).toBeVisible();
    await expect.element(sheet(screen)).toBeVisible();
  });

  it('submits with the footer button, closes the sheet and says it saved', async () => {
    const onSave = vi.fn();
    const screen = await setup(onSave);
    await openSheet(screen);
    await fillValid(screen);
    await userEvent.click(screen.getByRole('button', { name: 'Save supplier' }));
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      name: 'Northwind',
      email: 'sales@northwind.test',
      country: 'br',
    });
    await expect
      .element(screen.getByRole('alert').getByText(/Supplier Northwind saved/))
      .toBeVisible();
  });

  it('submits with Enter inside a field', async () => {
    const onSave = vi.fn();
    const screen = await setup(onSave);
    await openSheet(screen);
    await fillValid(screen);
    await userEvent.click(screen.getByRole('textbox', { name: /Email/ }));
    await userEvent.keyboard('{Enter}');
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('discards with Cancel and with Escape', async () => {
    const onSave = vi.fn();
    const screen = await setup(onSave);
    await openSheet(screen);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    await openSheet(screen);
    await userEvent.keyboard('{Escape}');
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('has no axe violations: closed, open and with errors', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    const dialog = await openSheet(screen);
    await expectNoViolationsOnceSettled();
    await userEvent.click(dialog.getByRole('button', { name: 'Save supplier' }));
    await expect.element(dialog.getByText("Enter the supplier's name.")).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
