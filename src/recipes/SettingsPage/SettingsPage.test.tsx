import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HotkeyProvider, ShortcutsHelp, toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { SettingsPage } from './SettingsPage';
import type { SettingsPageProps } from './SettingsPage';

/** The switch input is visually hidden; users press its label. */
async function toggle(screen: Screen, name: RegExp) {
  const label = screen.getByRole('switch', { name }).element().closest('label');
  if (!label) throw new Error('switch without label');
  await userEvent.click(label);
}

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup(props: SettingsPageProps = {}) {
  return renderWithProvider(
    <HotkeyProvider platform="other">
      <RecipeHost>
        <SettingsPage {...props} />
        <ShortcutsHelp />
      </RecipeHost>
    </HotkeyProvider>,
  );
}

afterEach(() => {
  act(() => {
    toast.clear();
  });
});

describe('SettingsPage', () => {
  it('has the page landmarks, one h1 and one primary action', async () => {
    const screen = await setup();
    await expect.element(screen.getByRole('main')).toBeVisible();
    await expect.element(screen.getByRole('banner')).toBeVisible();
    await expect.element(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    expect(document.querySelectorAll('button[data-variant="primary"]')).toHaveLength(1);
    await expect.element(screen.getByRole('button', { name: /Save settings/ })).toBeVisible();
  });

  it('saves the changed settings and says so', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave });
    await toggle(screen, /Weekly summary/);
    await userEvent.click(screen.getByRole('button', { name: /Currency/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Euro' }));
    const radioLabel = screen
      .getByRole('radio', { name: 'Download only' })
      .element()
      .closest('label');
    if (!radioLabel) throw new Error('radio without label');
    await userEvent.click(radioLabel);
    await userEvent.click(screen.getByRole('button', { name: /Save settings/ }));
    expect(onSave).toHaveBeenCalledWith({
      orderShipped: true,
      weeklySummary: true,
      currency: 'eur',
      invoiceDelivery: 'download',
    });
    await expect.element(screen.getByText(/Settings saved/)).toBeVisible();
  });

  it('saves with the shortcut, even while typing in a field-free page', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave });
    screen
      .getByRole('switch', { name: /Order shipped/ })
      .element()
      .focus();
    await userEvent.keyboard('{Control>}s{/Control}');
    expect(onSave).toHaveBeenCalledTimes(1);
    await expect.element(screen.getByText(/Settings saved/)).toBeVisible();
  });

  it('lists the shortcut in the shortcuts help', async () => {
    const screen = await setup();
    await userEvent.keyboard('?');
    const dialog = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog.getByText('Save settings')).toBeVisible();
  });

  it('toggles a switch with Space', async () => {
    const screen = await setup();
    const sw = screen.getByRole('switch', { name: /Order shipped/ });
    await expect.element(sw).toBeChecked();
    sw.element().focus();
    await userEvent.keyboard(' ');
    await expect.element(sw).not.toBeChecked();
  });

  it('has no axe violations', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await userEvent.click(screen.getByRole('button', { name: /Save settings/ }));
    await expect.element(screen.getByText(/Settings saved/)).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
