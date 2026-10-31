import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { HotkeyProvider } from '../../hooks/HotkeyProvider';
import { useHotkeys } from '../../hooks/useHotkeys';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { CalendarIcon, PlusIcon } from '../Icon/icons';
import { CommandPalette } from './CommandPalette';
import type { Command } from './CommandPalette';

function commandsWith(onAction: (id: string) => void = () => undefined): Command[] {
  const run = (id: string) => () => {
    onAction(id);
  };
  return [
    {
      id: 'orders',
      label: 'Go to orders',
      group: 'Navigation',
      keywords: ['sales', 'pedidos'],
      shortcut: 'G',
      icon: CalendarIcon,
      onAction: run('orders'),
    },
    { id: 'customers', label: 'Go to customers', group: 'Navigation', onAction: run('customers') },
    {
      id: 'create',
      label: 'Create order',
      group: 'Orders',
      keywords: ['new', 'invoice'],
      shortcut: 'Mod+Shift+O',
      icon: PlusIcon,
      onAction: run('create'),
    },
    {
      id: 'archive',
      label: 'Archive order',
      group: 'Orders',
      isDisabled: true,
      onAction: run('archive'),
    },
    { id: 'café', label: 'Open café report', group: 'Reports', onAction: run('café') },
  ];
}

const palette = () => document.querySelector('[role="dialog"]');

function Harness({
  onAction,
  ...props
}: Partial<React.ComponentProps<typeof CommandPalette>> & { onAction?: (id: string) => void }) {
  return (
    <HotkeyProvider platform="other">
      <main>
        <Button>Before</Button>
        <input aria-label="Notes" />
        <CommandPalette commands={commandsWith(onAction)} {...props} />
      </main>
    </HotkeyProvider>
  );
}

/**
 * React Aria delays moving `aria-activedescendant` by 500 ms while the user types, so a screen
 * reader is not interrupted; until then it may point at an item that the filter just removed.
 */
async function activeDescendantSettled() {
  await expect.poll(() => document.querySelector('[data-entering]')).toBeNull();
  await expect
    .poll(
      () => {
        const id = document
          .querySelector('[role="combobox"]')
          ?.getAttribute('aria-activedescendant');
        return !id || document.getElementById(id) !== null;
      },
      { timeout: 3000 },
    )
    .toBe(true);
}

async function openWithHotkey() {
  await userEvent.keyboard('{Control>}k{/Control}');
}

describe('CommandPalette', () => {
  it('is closed until the hotkey is pressed, then focuses the search field', async () => {
    const screen = await renderWithProvider(<Harness />);
    expect(palette()).toBeNull();
    await screen.getByRole('button', { name: 'Before' }).click();
    await openWithHotkey();
    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    await expect.element(dialog).toBeVisible();
    await expect
      .element(screen.getByRole('combobox', { name: 'Search or run a command' }))
      .toHaveFocus();
  });

  it('opens from inside an input and ignores the hotkey when it is set to false', async () => {
    const screen = await renderWithProvider(<Harness />);
    await screen.getByRole('textbox', { name: 'Notes' }).click();
    await openWithHotkey();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('does not bind a hotkey when hotkey is false', async () => {
    await renderWithProvider(<Harness hotkey={false} />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(palette()).toBeNull();
  });

  it('supports a custom hotkey', async () => {
    const screen = await renderWithProvider(<Harness hotkey="F2" />);
    await userEvent.keyboard('{F2}');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('lists commands grouped, with icons, shortcuts and a disabled state', async () => {
    const screen = await renderWithProvider(<Harness defaultOpen />);
    await expect.element(screen.getByRole('listbox', { name: 'Commands' })).toBeVisible();
    expect(screen.getByRole('option').elements()).toHaveLength(5);
    const groups = screen.getByRole('group').elements();
    expect(groups.map((group) => group.querySelector('header')?.textContent)).toEqual([
      'Navigation',
      'Orders',
      'Reports',
    ]);
    expect(
      screen
        .getByRole('option', { name: /^Archive order/ })
        .element()
        .getAttribute('aria-disabled'),
    ).toBe('true');
    // The shortcut is part of the option's name, with spoken key names.
    expect(
      screen.getByRole('option', { name: /Create order.*Control.*Shift.*O/ }).elements(),
    ).toHaveLength(1);
  });

  it('filters ignoring case and accents, matches keywords and highlights the label', async () => {
    const screen = await renderWithProvider(<Harness defaultOpen />);
    await userEvent.keyboard('CAFE');
    expect(screen.getByRole('option').elements()).toHaveLength(1);
    const mark = document.querySelector('mark');
    expect(mark?.textContent).toBe('café');
    await userEvent.clear(screen.getByRole('combobox').element());
    await userEvent.keyboard('invoice');
    expect(screen.getByRole('option').elements()).toHaveLength(1);
    await expect.element(screen.getByRole('option', { name: /^Create order/ })).toBeVisible();
    expect(document.querySelector('mark')).toBeNull();
    await expect
      .poll(() => document.querySelector('[role="status"]')?.textContent)
      .toBe('1 command');
  });

  it('shows an empty state with a hint', async () => {
    const screen = await renderWithProvider(<Harness defaultOpen />);
    await userEvent.keyboard('zzzz');
    await expect.element(screen.getByText('No commands found').first()).toBeVisible();
    await expect.element(screen.getByText('Try another search term.')).toBeVisible();
    // React Aria renders the empty state as one disabled placeholder option.
    expect(screen.getByRole('option', { name: /No commands found/ }).elements()).toHaveLength(1);
    expect(screen.getByRole('option').elements()).toHaveLength(1);
  });

  it('moves with the arrow keys while focus stays in the field, and runs with Enter', async () => {
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    const screen = await renderWithProvider(
      <Harness defaultOpen onAction={onAction} onOpenChange={onOpenChange} />,
    );
    const field = screen.getByRole('combobox');
    await userEvent.keyboard('order');
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => field.element().getAttribute('aria-activedescendant')).toBeTruthy();
    await expect.element(field).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => palette()).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('runs the highlighted first match with Enter right after typing', async () => {
    const onAction = vi.fn();
    await renderWithProvider(<Harness defaultOpen onAction={onAction} />);
    await userEvent.keyboard('customers');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => onAction.mock.calls).toEqual([['customers']]);
  });

  it('does not run a disabled command', async () => {
    const onAction = vi.fn();
    const screen = await renderWithProvider(<Harness defaultOpen onAction={onAction} />);
    await userEvent.keyboard('archive');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onAction).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('runs a command chosen with the pointer after closing', async () => {
    const onAction = vi.fn();
    const onRun = vi.fn();
    const screen = await renderWithProvider(
      <Harness defaultOpen onAction={onAction} onRun={onRun} />,
    );
    await screen.getByRole('option', { name: /^Create order/ }).click();
    await expect.poll(() => onAction.mock.calls).toEqual([['create']]);
    expect(onRun).toHaveBeenCalledWith('create');
    expect(palette()).toBeNull();
  });

  it('closes with Escape even when there is text, and restores focus', async () => {
    const screen = await renderWithProvider(<Harness />);
    const before = screen.getByRole('button', { name: 'Before' });
    await before.click();
    await openWithHotkey();
    await userEvent.keyboard('ord');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => palette()).toBeNull();
    await expect.element(before).toHaveFocus();
  });

  it('resets the search each time it opens', async () => {
    const screen = await renderWithProvider(<Harness />);
    await screen.getByRole('button', { name: 'Before' }).click();
    await openWithHotkey();
    await userEvent.keyboard('ord');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => palette()).toBeNull();
    await openWithHotkey();
    await expect.element(screen.getByRole('combobox')).toHaveValue('');
  });

  it('shows recent commands first while the search is empty', async () => {
    const screen = await renderWithProvider(
      <Harness defaultOpen recentIds={['create', 'missing', 'archive', 'orders']} />,
    );
    const groups = screen.getByRole('group').elements();
    expect(groups[0]?.textContent).toMatch(/^Recent/);
    expect(groups[0]?.querySelectorAll('[role="option"]')).toHaveLength(2);
    expect(screen.getByRole('option').elements()).toHaveLength(7);
    await userEvent.keyboard('order');
    expect(
      screen
        .getByRole('group')
        .elements()
        .some((group) => group.querySelector('header')?.textContent === 'Recent'),
    ).toBe(false);
  });

  it('keeps the given order with sort="given"', async () => {
    const screen = await renderWithProvider(<Harness defaultOpen sort="given" />);
    const items = screen
      .getByRole('option')
      .elements()
      .map((item) => item.textContent);
    expect(items[0]).toContain('Go to orders');
    expect(items[1]).toContain('Go to customers');
  });

  it('can be controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return <Harness isOpen={open} onOpenChange={setOpen} hotkey={false} />;
    }
    const screen = await renderWithProvider(<Controlled />);
    expect(palette()).toBeNull();
    await screen.rerender(<Harness isOpen hotkey={false} />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('lists registered hotkeys as commands and runs their handler', async () => {
    const handler = vi.fn();
    function WithHotkeys() {
      useHotkeys([
        { keys: 'F9', handler, description: 'Mark as paid', group: 'Billing' },
        { keys: 'N', handler: () => undefined, description: 'Create order' },
        { keys: 'Escape', handler: () => undefined },
      ]);
      return null;
    }
    const screen = await renderWithProvider(
      <HotkeyProvider platform="other">
        <WithHotkeys />
        <CommandPalette commands={commandsWith()} includeHotkeys defaultOpen />
      </HotkeyProvider>,
    );
    // "Create order" exists as a command already, the palette's own hotkey and undescribed ones are skipped.
    expect(screen.getByRole('option', { name: /^Create order/ }).elements()).toHaveLength(1);
    expect(
      screen.getByRole('option', { name: 'Open the command palette' }).elements(),
    ).toHaveLength(0);
    await userEvent.keyboard('paid');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => handler.mock.calls.length).toBe(1);
    expect(handler.mock.calls[0]?.[0]).toBeUndefined();
  });

  it('shows messages in pt-BR and applies provider and instance overrides', async () => {
    const screen = await renderWithProvider(<Harness defaultOpen />, { locale: 'pt-BR' });
    await expect.element(screen.getByRole('dialog', { name: 'Paleta de comandos' })).toBeVisible();
    await expect
      .element(screen.getByRole('combobox', { name: 'Buscar ou executar um comando' }))
      .toBeVisible();
    await userEvent.keyboard('zzzz');
    await expect.element(screen.getByText('Nenhum comando encontrado').first()).toBeVisible();
  });

  it('applies a DSProvider override and an instance override', async () => {
    const provider = await renderWithProvider(<Harness defaultOpen />, {
      messages: { CommandPalette: { title: 'Quick actions' } },
    });
    await expect.element(provider.getByRole('dialog', { name: 'Quick actions' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <Harness defaultOpen messages={{ title: 'Jump to' }} placeholder="Type a command" />,
    );
    await expect.element(instance.getByRole('dialog', { name: 'Jump to' })).toBeVisible();
    await expect.element(instance.getByRole('combobox', { name: 'Type a command' })).toBeVisible();
  });

  it('runs the action after the palette has unmounted and keeps focus out of it', async () => {
    let paletteWhenRun: Element | null | undefined;
    const screen = await renderWithProvider(
      <Harness
        onAction={() => {
          paletteWhenRun = palette();
        }}
      />,
    );
    await screen.getByRole('button', { name: 'Before' }).click();
    await openWithHotkey();
    await userEvent.keyboard('customers{Enter}');
    await expect.poll(() => paletteWhenRun).toBeNull();
    await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
  });

  it('can open another dialog from a command without losing focus to it', async () => {
    function Flow() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button>Before</Button>
          <CommandPalette
            commands={[
              {
                id: 'edit',
                label: 'Edit customer',
                onAction: () => {
                  setOpen(true);
                },
              },
            ]}
          />
          <Dialog isOpen={open} onOpenChange={setOpen} title="Edit customer" />
        </>
      );
    }
    const screen = await renderWithProvider(<Flow />);
    await screen.getByRole('button', { name: 'Before' }).click();
    await openWithHotkey();
    await userEvent.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog', { name: 'Edit customer' });
    await expect.element(dialog).toBeVisible();
    await expect.poll(() => dialog.element().contains(document.activeElement)).toBe(true);
  });

  it('does not open the palette while the hotkey is pressed inside another dialog', async () => {
    const screen = await renderWithProvider(
      <HotkeyProvider platform="other">
        <CommandPalette commands={commandsWith()} />
        <Dialog defaultOpen title="Edit customer" />
      </HotkeyProvider>,
    );
    await expect.element(screen.getByRole('dialog', { name: 'Edit customer' })).toBeVisible();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: 'Command palette' }).elements()).toHaveLength(0);
  });

  it('has no axe violations open, filtered and empty', async () => {
    const screen = await renderWithProvider(<Harness defaultOpen recentIds={['orders']} />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await activeDescendantSettled();
    await expectNoA11yViolations(document.body);
    await userEvent.keyboard('order');
    await activeDescendantSettled();
    await expectNoA11yViolations(document.body);
    await userEvent.keyboard('zzz');
    await activeDescendantSettled();
    await expectNoA11yViolations(document.body);
  });

  it('has no axe violations in pt-BR', async () => {
    await renderWithProvider(<Harness defaultOpen />, { locale: 'pt-BR' });
    await activeDescendantSettled();
    await expectNoA11yViolations(document.body);
  });
});
