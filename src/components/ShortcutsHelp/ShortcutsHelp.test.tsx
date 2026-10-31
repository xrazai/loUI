import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { HotkeyProvider } from '../../hooks/HotkeyProvider';
import { useHotkeyScope, useHotkeys } from '../../hooks/useHotkeys';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { ShortcutsHelp } from './ShortcutsHelp';

function Shortcuts({ handler = () => undefined }: { handler?: () => void }) {
  useHotkeys([
    { keys: 'N', handler, description: 'Create order', group: 'Orders' },
    { keys: 'F9', handler: () => undefined, description: 'Mark as paid', group: 'Orders' },
    { keys: '1', handler: () => undefined, description: 'Go to orders', group: 'Navigation' },
    { keys: 'Mod+Shift+P', handler: () => undefined, description: 'Print summary' },
    { keys: 'Escape', handler: () => undefined },
  ]);
  return null;
}

function Page({
  children,
  handler,
  ...props
}: Partial<React.ComponentProps<typeof ShortcutsHelp>> & {
  handler?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <HotkeyProvider platform="other">
      <Button>Before</Button>
      <input aria-label="Notes" />
      <Shortcuts {...(handler ? { handler } : {})} />
      <ShortcutsHelp {...props} />
      {children}
    </HotkeyProvider>
  );
}

const dialog = () => document.querySelector('[role="dialog"]');

describe('ShortcutsHelp', () => {
  it('opens with ? and restores focus on Escape', async () => {
    const screen = await renderWithProvider(<Page />);
    const before = screen.getByRole('button', { name: 'Before' });
    await before.click();
    expect(dialog()).toBeNull();
    await userEvent.keyboard('?');
    await expect.element(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(dialog).toBeNull();
    await expect.element(before).toHaveFocus();
  });

  it('does not open while typing a question mark in a field', async () => {
    const screen = await renderWithProvider(<Page />);
    await screen.getByRole('textbox', { name: 'Notes' }).click();
    await userEvent.keyboard('?');
    expect(dialog()).toBeNull();
  });

  it('lists shortcuts in one table per group, sorted, with the keys drawn by Kbd', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    const tables = screen.getByRole('table').elements();
    expect(tables.map((table) => table.querySelector('caption')?.textContent)).toEqual([
      'General',
      'Navigation',
      'Orders',
      'Other',
    ]);
    const orders = screen.getByRole('table', { name: 'Orders' });
    const rows = orders
      .getByRole('rowheader')
      .elements()
      .map((cell) => cell.textContent);
    expect(rows).toEqual(['Create order', 'Mark as paid']);
    const row = screen.getByRole('row', { name: /Print summary/ }).element();
    expect(row.textContent).toContain('Control');
    expect(row.querySelectorAll('kbd kbd')).toHaveLength(3);
    // Undescribed shortcuts (Escape) are not listed.
    expect(document.body.textContent).not.toContain('Escape');
  });

  it('lists the shortcut that opens it', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    await expect
      .element(screen.getByRole('rowheader', { name: 'Show keyboard shortcuts' }))
      .toBeVisible();
  });

  it('does not run page shortcuts while open', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(<Page handler={handler} />);
    await screen.getByRole('button', { name: 'Before' }).click();
    await userEvent.keyboard('?');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('n');
    expect(handler).not.toHaveBeenCalled();
  });

  it('hides shortcuts of inactive scopes unless includeInactive is set', async () => {
    function Panel() {
      useHotkeyScope('panel');
      return null;
    }
    function Scoped() {
      useHotkeys([
        { keys: 'M', handler: () => undefined, description: 'Move row', scope: 'panel' },
      ]);
      return null;
    }
    const first = await renderWithProvider(
      <Page defaultOpen>
        <Scoped />
      </Page>,
    );
    expect(first.getByRole('rowheader', { name: 'Move row' }).elements()).toHaveLength(0);
    await first.unmount();
    const second = await renderWithProvider(
      <Page defaultOpen includeInactive>
        <Scoped />
      </Page>,
    );
    expect(second.getByRole('rowheader', { name: 'Move row' }).elements()).toHaveLength(1);
    await second.unmount();
    const third = await renderWithProvider(
      <Page defaultOpen>
        <Panel />
        <Scoped />
      </Page>,
    );
    await expect.element(third.getByRole('rowheader', { name: 'Move row' })).toBeVisible();
  });

  it('shows the empty message when only the opening shortcut is disabled and nothing else exists', async () => {
    const screen = await renderWithProvider(
      <HotkeyProvider platform="other">
        <ShortcutsHelp defaultOpen hotkey={false} />
      </HotkeyProvider>,
    );
    await expect.element(screen.getByText('No keyboard shortcuts on this page.')).toBeVisible();
  });

  it('can be controlled and closes with the button', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithProvider(
      <Page isOpen onOpenChange={onOpenChange} hotkey={false} />,
    );
    await screen.getByRole('button', { name: 'Close' }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports a custom hotkey', async () => {
    const screen = await renderWithProvider(<Page hotkey="F1" />);
    await userEvent.keyboard('{F1}');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('shows messages in pt-BR and applies overrides', async () => {
    const pt = await renderWithProvider(<Page defaultOpen />, { locale: 'pt-BR' });
    await expect.element(pt.getByRole('dialog', { name: 'Atalhos de teclado' })).toBeVisible();
    await expect.element(pt.getByRole('button', { name: 'Fechar' })).toBeVisible();
    await expect.element(pt.getByRole('table', { name: 'Geral' })).toBeVisible();
    await pt.unmount();

    const provider = await renderWithProvider(<Page defaultOpen />, {
      messages: { ShortcutsHelp: { title: 'Shortcuts' } },
    });
    await expect.element(provider.getByRole('dialog', { name: 'Shortcuts' })).toBeVisible();
    await provider.unmount();

    const instance = await renderWithProvider(
      <Page defaultOpen messages={{ title: 'Keys', close: 'Done' }} />,
    );
    await expect.element(instance.getByRole('dialog', { name: 'Keys' })).toBeVisible();
    await expect.element(instance.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  it('has no axe violations open, empty and in pt-BR', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.poll(() => document.querySelector('[data-entering]')).toBeNull();
    await expectNoA11yViolations(document.body);
    await screen.unmount();

    const empty = await renderWithProvider(
      <HotkeyProvider platform="other">
        <ShortcutsHelp defaultOpen hotkey={false} />
      </HotkeyProvider>,
    );
    await expect.element(empty.getByRole('dialog')).toBeVisible();
    await expect.poll(() => document.querySelector('[data-entering]')).toBeNull();
    await expectNoA11yViolations(document.body);
    await empty.unmount();

    await renderWithProvider(<Page defaultOpen />, { locale: 'pt-BR' });
    await expect.poll(() => document.querySelector('[data-entering]')).toBeNull();
    await expectNoA11yViolations(document.body);
  });
});
