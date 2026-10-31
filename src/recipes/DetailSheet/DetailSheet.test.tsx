import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { DetailSheet } from './DetailSheet';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup() {
  return renderWithProvider(
    <RecipeHost>
      <DetailSheet />
    </RecipeHost>,
  );
}

const customers = () =>
  [...document.querySelectorAll('tbody [role="rowheader"]')].map((cell) => cell.textContent);
const sheet = (screen: Screen) => screen.getByRole('dialog', { name: 'Order' });

async function openContoso(screen: Screen) {
  await userEvent.click(screen.getByRole('rowheader', { name: 'Contoso' }));
  await expect.element(sheet(screen)).toBeVisible();
  return sheet(screen);
}

afterEach(() => {
  act(() => {
    toast.clear();
  });
});

describe('DetailSheet', () => {
  it('opens the row in a sheet with its details', async () => {
    const screen = await setup();
    const dialog = await openContoso(screen);
    await expect.element(dialog.getByText('ORD-1048')).toBeVisible();
    await expect.element(dialog.getByRole('textbox', { name: 'Customer' })).toHaveValue('Contoso');
    await expect
      .element(dialog.getByRole('textbox', { name: 'Notes' }))
      .toHaveValue('Call before delivery.');
  });

  it('puts the destructive action at the start and Cancel plus the primary action at the end', async () => {
    const screen = await setup();
    const dialog = await openContoso(screen);
    const buttons = [
      ...dialog.element().querySelectorAll('footer button, [class*="footer"] button'),
    ].map((button) => button.textContent);
    expect(buttons).toEqual(['Delete order', 'Cancel', 'Save order']);
    expect(dialog.element().querySelectorAll('button[data-variant="primary"]')).toHaveLength(1);
  });

  it('closes with Escape and returns focus to the row', async () => {
    const screen = await setup();
    await openContoso(screen);
    await userEvent.keyboard('{Escape}');
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    await expect
      .poll(() => document.activeElement?.closest('[role="row"]')?.textContent)
      .toContain('Contoso');
  });

  it('opens from the keyboard with Enter on the row', async () => {
    const screen = await setup();
    await userEvent.tab(); // the first row, Contoso
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('dialog', { name: 'Order' })).toBeVisible();
    await expect.element(screen.getByRole('textbox', { name: 'Customer' })).toHaveValue('Contoso');
  });

  it('saves the edits, updates the row and says so', async () => {
    const screen = await setup();
    const dialog = await openContoso(screen);
    await userEvent.fill(dialog.getByRole('textbox', { name: 'Customer' }), 'Contoso Ltd');
    await userEvent.click(dialog.getByRole('button', { name: 'Save order' }));
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    expect(customers()).toContain('Contoso Ltd');
    await expect.element(screen.getByText(/Order ORD-1048 saved/)).toBeVisible();
  });

  it('discards the edits with Cancel', async () => {
    const screen = await setup();
    const dialog = await openContoso(screen);
    await userEvent.fill(dialog.getByRole('textbox', { name: 'Customer' }), 'Changed');
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    expect(customers()).toContain('Contoso');
    expect(customers()).not.toContain('Changed');
  });

  it('confirms before deleting; Escape closes only the confirmation', async () => {
    const screen = await setup();
    const dialog = await openContoso(screen);
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order' }));
    const confirm = screen.getByRole('alertdialog', { name: 'Delete order ORD-1048?' });
    await expect.element(confirm.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(confirm).not.toBeInTheDocument();
    await expect.element(sheet(screen)).toBeVisible();
    expect(customers()).toContain('Contoso');
  });

  it('deletes after confirming, closes the sheet and offers Undo', async () => {
    const screen = await setup();
    const dialog = await openContoso(screen);
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order' }));
    const confirm = screen.getByRole('alertdialog', { name: 'Delete order ORD-1048?' });
    await userEvent.click(confirm.getByRole('button', { name: 'Delete order' }));
    await expect.element(sheet(screen)).not.toBeInTheDocument();
    await expect.element(screen.getByText(/Order ORD-1048 deleted/)).toBeVisible();
    expect(customers()).not.toContain('Contoso');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(customers()).toContain('Contoso');
  });

  it('has no axe violations: list, sheet and confirmation', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    const dialog = await openContoso(screen);
    await expectNoViolationsOnceSettled();
    await userEvent.click(dialog.getByRole('button', { name: 'Delete order' }));
    await expect.element(screen.getByRole('alertdialog')).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
