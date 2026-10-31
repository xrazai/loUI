import { act } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { toast } from '../../index';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { CommandPaletteSetup } from './CommandPaletteSetup';

type Screen = Awaited<ReturnType<typeof setup>>;

async function setup() {
  return renderWithProvider(
    <RecipeHost>
      <CommandPaletteSetup platform="other" />
    </RecipeHost>,
  );
}

const palette = (screen: Screen) => screen.getByRole('dialog', { name: 'Command palette' });
const openPalette = async (screen: Screen) => {
  await userEvent.keyboard('{Control>}k{/Control}');
  await expect.element(palette(screen)).toBeVisible();
};

afterEach(() => {
  act(() => {
    toast.clear();
  });
});

describe('CommandPaletteSetup', () => {
  it('navigates with the bare number keys', async () => {
    const screen = await setup();
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Orders' })).toBeVisible();
    await userEvent.keyboard('2');
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'Customers' }))
      .toBeVisible();
    await userEvent.keyboard('3');
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Invoices' })).toBeVisible();
  });

  it('opens with Mod+K, finds a command by typing and runs it with Enter', async () => {
    const screen = await setup();
    await openPalette(screen);
    await userEvent.keyboard('customers');
    await userEvent.keyboard('{Enter}');
    await expect.element(palette(screen)).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'Customers' }))
      .toBeVisible();
  });

  it('finds a command by its keywords and runs it', async () => {
    const screen = await setup();
    await openPalette(screen);
    await userEvent.keyboard('add');
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText(/Order #1052 created/)).toBeVisible();
  });

  it('opens from the button and closes with Escape, returning focus to the button', async () => {
    const screen = await setup();
    await userEvent.click(screen.getByRole('button', { name: /Open commands/ }));
    await expect.element(palette(screen)).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(palette(screen)).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: /Open commands/ })).toHaveFocus();
  });

  it('runs a shortcut directly and lists every shortcut with ?', async () => {
    const screen = await setup();
    await userEvent.keyboard('{F2}');
    await expect.element(screen.getByText(/Order #1052 created/)).toBeVisible();
    await userEvent.keyboard('?');
    const help = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect.element(help).toBeVisible();
    await expect.element(help.getByText('Go to customers')).toBeVisible();
    await expect.element(help.getByText('Create order')).toBeVisible();
  });

  it('lists the most recent command first the next time it opens', async () => {
    const screen = await setup();
    await openPalette(screen);
    await userEvent.keyboard('invoices');
    await userEvent.keyboard('{Enter}');
    await expect.element(palette(screen)).not.toBeInTheDocument();
    await openPalette(screen);
    await expect.element(palette(screen).getByText('Recent')).toBeVisible();
  });

  it('has no axe violations: page, palette and shortcuts help', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await openPalette(screen);
    await expectNoViolationsOnceSettled();
    await userEvent.keyboard('{Escape}');
    await expect.element(palette(screen)).not.toBeInTheDocument();
    await userEvent.keyboard('?');
    await expect.element(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
    await expectNoViolationsOnceSettled();
  });
});
