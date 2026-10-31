import { useState } from 'react';
import type { ReactNode } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../components/Dialog';
import { renderWithProvider } from '../test/render';
import { HotkeyProvider } from './HotkeyProvider';
import { HotkeyRegistry } from './hotkeyRegistry';
import type { HotkeyDefinition } from './hotkeyRegistry';
import { useHotkeyScope, useHotkeys, useRegisteredHotkeys } from './useHotkeys';

function Register({ definitions }: { definitions: readonly HotkeyDefinition[] }) {
  useHotkeys(definitions);
  return null;
}

function Page({ children }: { children?: ReactNode }) {
  return (
    <HotkeyProvider platform="other">
      <button type="button">outside</button>
      <input aria-label="text field" />
      {children}
    </HotkeyProvider>
  );
}

function List({ includeInactive = false }: { includeInactive?: boolean }) {
  const hotkeys = useRegisteredHotkeys({ includeInactive });
  return (
    <ul aria-label="registered">
      {hotkeys.map((hotkey) => (
        <li key={hotkey.id}>{`${hotkey.group ?? '-'}|${hotkey.keys}|${hotkey.description}`}</li>
      ))}
    </ul>
  );
}

function press(init: KeyboardEventInit) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useHotkeys', () => {
  it('runs the handler of every combo style: Mod+K, F2, N, 1', async () => {
    const handler = vi.fn<(name: string) => void>();
    const screen = await renderWithProvider(
      <Page>
        <Register
          definitions={[
            {
              keys: 'Mod+K',
              handler: () => {
                handler('palette');
              },
            },
            {
              keys: 'F2',
              handler: () => {
                handler('f2');
              },
            },
            {
              keys: 'N',
              handler: () => {
                handler('n');
              },
            },
            {
              keys: '1',
              handler: () => {
                handler('one');
              },
            },
          ]}
        />
      </Page>,
    );
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('{Control>}k{/Control}');
    await userEvent.keyboard('{F2}');
    await userEvent.keyboard('n');
    await userEvent.keyboard('1');
    expect(handler.mock.calls.flat()).toEqual(['palette', 'f2', 'n', 'one']);
  });

  it('passes the event, prevents the default action and supports preventDefault: false', async () => {
    let received: KeyboardEvent | undefined;
    await renderWithProvider(
      <Page>
        <Register
          definitions={[
            {
              keys: 'Mod+S',
              handler: (event) => {
                received = event;
              },
            },
            { keys: 'Mod+P', handler: () => undefined, preventDefault: false },
          ]}
        />
      </Page>,
    );
    press({ key: 's', ctrlKey: true });
    expect(received).toBeInstanceOf(KeyboardEvent);
    expect(received?.defaultPrevented).toBe(true);
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      ctrlKey: true,
      cancelable: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('resolves Mod to Command on macOS and Control elsewhere', async () => {
    const handler = vi.fn();
    const mac = await renderWithProvider(
      <HotkeyProvider platform="mac">
        <Register definitions={[{ keys: 'Mod+K', handler }]} />
      </HotkeyProvider>,
    );
    press({ key: 'k', ctrlKey: true });
    expect(handler).not.toHaveBeenCalled();
    press({ key: 'k', metaKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
    await mac.unmount();

    const other = vi.fn();
    await renderWithProvider(
      <HotkeyProvider platform="other">
        <Register definitions={[{ keys: 'Mod+K', handler: other }]} />
      </HotkeyProvider>,
    );
    press({ key: 'k', metaKey: true });
    expect(other).not.toHaveBeenCalled();
    press({ key: 'k', ctrlKey: true });
    expect(other).toHaveBeenCalledTimes(1);
  });

  it('ignores editable fields by default and honors allowInEditable', async () => {
    const plain = vi.fn();
    const allowed = vi.fn();
    const screen = await renderWithProvider(
      <Page>
        <Register
          definitions={[
            { keys: 'N', handler: plain },
            { keys: 'Mod+K', handler: allowed, allowInEditable: true },
          ]}
        />
      </Page>,
    );
    await screen.getByRole('textbox', { name: 'text field' }).click();
    await userEvent.keyboard('n');
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(plain).not.toHaveBeenCalled();
    expect(allowed).toHaveBeenCalledTimes(1);
  });

  it('ignores IME composition', async () => {
    const handler = vi.fn();
    await renderWithProvider(
      <Page>
        <Register
          definitions={[
            { keys: 'Mod+K', handler },
            { keys: 'N', handler },
          ]}
        />
      </Page>,
    );
    press({ key: 'k', ctrlKey: true, isComposing: true });
    press({ key: 'n', isComposing: true });
    // Some browsers report composition key events as keyCode 229 only.
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- keyCode 229 is the only IME signal in some browsers.
    press({ key: 'n', keyCode: 229 });
    expect(handler).not.toHaveBeenCalled();
    press({ key: 'n' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores auto-repeat unless allowRepeat is set', async () => {
    const once = vi.fn();
    const repeating = vi.fn();
    await renderWithProvider(
      <Page>
        <Register
          definitions={[
            { keys: 'N', handler: once },
            { keys: 'M', handler: repeating, allowRepeat: true },
          ]}
        />
      </Page>,
    );
    press({ key: 'n', repeat: true });
    press({ key: 'm', repeat: true });
    expect(once).not.toHaveBeenCalled();
    expect(repeating).toHaveBeenCalledTimes(1);
  });

  it('skips events another handler already prevented', async () => {
    const handler = vi.fn();
    await renderWithProvider(
      <Page>
        <Register definitions={[{ keys: 'N', handler }]} />
      </Page>,
    );
    const event = new KeyboardEvent('keydown', { key: 'n', cancelable: true, bubbles: true });
    event.preventDefault();
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it('always calls the latest handler without re-registering', async () => {
    function Counter() {
      const [count, setCount] = useState(0);
      const seen: number[] = [];
      useHotkeys([
        {
          keys: 'N',
          handler: () => {
            seen.push(count);
            setCount(count + 1);
            received.push(count);
          },
        },
      ]);
      return <output>{count}</output>;
    }
    const received: number[] = [];
    const screen = await renderWithProvider(
      <Page>
        <Counter />
      </Page>,
    );
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('nnn');
    await expect.element(screen.getByRole('status')).toHaveTextContent('3');
    expect(received).toEqual([0, 1, 2]);
  });

  it('stops firing when the component unmounts or the definition is disabled', async () => {
    const handler = vi.fn();
    function Toggle({ disabled }: { disabled: boolean }) {
      return <Register definitions={[{ keys: 'N', handler, isDisabled: disabled }]} />;
    }
    const screen = await renderWithProvider(
      <Page>
        <Toggle disabled />
      </Page>,
    );
    press({ key: 'n' });
    expect(handler).not.toHaveBeenCalled();
    await screen.rerender(
      <Page>
        <Toggle disabled={false} />
      </Page>,
    );
    press({ key: 'n' });
    expect(handler).toHaveBeenCalledTimes(1);
    await screen.rerender(<Page />);
    press({ key: 'n' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('works without a provider through the shared registry', async () => {
    const handler = vi.fn();
    await renderWithProvider(<Register definitions={[{ keys: 'Escape', handler }]} />);
    press({ key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('keeps the shortcuts of two providers apart', async () => {
    const a = vi.fn();
    const b = vi.fn();
    await renderWithProvider(
      <>
        <HotkeyProvider>
          <Register definitions={[{ keys: 'N', handler: a }]} />
        </HotkeyProvider>
        <HotkeyProvider>
          <Register definitions={[{ keys: 'M', handler: b }]} />
        </HotkeyProvider>
      </>,
    );
    press({ key: 'n' });
    press({ key: 'm' });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

describe('hotkey conflicts', () => {
  it('warns in development when a combo is registered twice in one scope and lets the latest win', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const first = vi.fn();
    const second = vi.fn();
    await renderWithProvider(
      <Page>
        <Register definitions={[{ keys: 'Mod+K', handler: first }]} />
        <Register definitions={[{ keys: 'Ctrl+K', handler: second }]} />
      </Page>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('Hotkey conflict');
    expect(String(warn.mock.calls[0]?.[0])).toContain('"global"');
    press({ key: 'k', ctrlKey: true });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not warn for the same combo in different scopes or when disabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await renderWithProvider(
      <Page>
        <Register
          definitions={[
            { keys: 'N', handler: () => undefined },
            { keys: 'N', handler: () => undefined, scope: 'editor' },
            { keys: 'N', handler: () => undefined, scope: 'editor', isDisabled: true },
          ]}
        />
      </Page>,
    );
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('hotkey scopes', () => {
  function Panel({ active = true }: { active?: boolean }) {
    useHotkeyScope('panel', { isActive: active });
    return <Register definitions={[{ keys: 'N', handler: panelHandler, scope: 'panel' }]} />;
  }
  const panelHandler = vi.fn();

  it('runs only the shortcuts of the scope on top of the stack', async () => {
    panelHandler.mockClear();
    const page = vi.fn();
    const everywhere = vi.fn();
    const screen = await renderWithProvider(
      <Page>
        <Register
          definitions={[
            { keys: 'N', handler: page },
            { keys: 'F1', handler: everywhere, scope: '*' },
          ]}
        />
      </Page>,
    );
    press({ key: 'n' });
    expect(page).toHaveBeenCalledTimes(1);
    expect(panelHandler).not.toHaveBeenCalled();

    await screen.rerender(
      <Page>
        <Register
          definitions={[
            { keys: 'N', handler: page },
            { keys: 'F1', handler: everywhere, scope: '*' },
          ]}
        />
        <Panel />
      </Page>,
    );
    press({ key: 'n' });
    expect(page).toHaveBeenCalledTimes(1);
    expect(panelHandler).toHaveBeenCalledTimes(1);
    press({ key: 'F1' });
    expect(everywhere).toHaveBeenCalledTimes(1);

    await screen.rerender(
      <Page>
        <Register
          definitions={[
            { keys: 'N', handler: page },
            { keys: 'F1', handler: everywhere, scope: '*' },
          ]}
        />
      </Page>,
    );
    press({ key: 'n' });
    expect(page).toHaveBeenCalledTimes(2);
    expect(panelHandler).toHaveBeenCalledTimes(1);
  });

  it('lets the most recently mounted scope win and respects isActive', async () => {
    const outer = vi.fn();
    const inner = vi.fn();
    function Scope({
      name,
      handler,
      active = true,
    }: {
      name: string;
      handler: () => void;
      active?: boolean;
    }) {
      useHotkeyScope(name, { isActive: active });
      return <Register definitions={[{ keys: 'N', handler, scope: name }]} />;
    }
    const screen = await renderWithProvider(
      <Page>
        <Scope name="outer" handler={outer} />
        <Scope name="inner" handler={inner} />
      </Page>,
    );
    press({ key: 'n' });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    await screen.rerender(
      <Page>
        <Scope name="outer" handler={outer} />
        <Scope name="inner" handler={inner} active={false} />
      </Page>,
    );
    press({ key: 'n' });
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it('ignores a page shortcut while focus is inside an open dialog', async () => {
    const page = vi.fn();
    const screen = await renderWithProvider(
      <Page>
        <Register definitions={[{ keys: 'N', handler: page }]} />
        <Dialog defaultOpen title="Edit customer" description="Changes apply to new orders.">
          <button type="button">inside</button>
        </Dialog>
      </Page>,
    );
    await expect.element(screen.getByRole('dialog', { name: 'Edit customer' })).toBeVisible();
    await userEvent.keyboard('n');
    expect(page).not.toHaveBeenCalled();
    // Pressed from the dialog's own button too.
    screen.getByRole('button', { name: 'inside' }).element().focus();
    await userEvent.keyboard('n');
    expect(page).not.toHaveBeenCalled();
  });

  it('runs the shortcut again once the dialog is closed', async () => {
    const page = vi.fn();
    const screen = await renderWithProvider(
      <Page>
        <Register definitions={[{ keys: 'N', handler: page }]} />
        <Dialog
          defaultOpen
          title="Edit customer"
          footer={({ close }) => (
            <button type="button" onClick={close}>
              Close
            </button>
          )}
        />
      </Page>,
    );
    await screen.getByRole('button', { name: 'Close' }).click();
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('n');
    expect(page).toHaveBeenCalledTimes(1);
  });

  it('lets allowInOverlay shortcuts and shortcuts of an active named scope run inside a dialog', async () => {
    const overlay = vi.fn();
    const scoped = vi.fn();
    function DialogScope() {
      useHotkeyScope('dialog-form');
      return (
        <Register definitions={[{ keys: 'Mod+Enter', handler: scoped, scope: 'dialog-form' }]} />
      );
    }
    const screen = await renderWithProvider(
      <Page>
        <Register
          definitions={[{ keys: 'F1', handler: overlay, allowInOverlay: true, scope: '*' }]}
        />
        <Dialog defaultOpen title="Edit customer">
          <DialogScope />
        </Dialog>
      </Page>,
    );
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{F1}');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(overlay).toHaveBeenCalledTimes(1);
    expect(scoped).toHaveBeenCalledTimes(1);
  });
});

describe('useRegisteredHotkeys', () => {
  it('lists described shortcuts with group, keys and parts, and updates on mount and unmount', async () => {
    const screen = await renderWithProvider(
      <Page>
        <List />
        <Register
          definitions={[
            {
              keys: 'Mod+K',
              handler: () => undefined,
              description: 'Open the command palette',
              group: 'General',
            },
            { keys: 'F9', handler: () => undefined, description: 'Mark as paid' },
            { keys: 'Escape', handler: () => undefined },
          ]}
        />
      </Page>,
    );
    const list = screen.getByRole('list', { name: 'registered' });
    await expect
      .poll(() => list.element().textContent)
      .toContain('General|Mod+K|Open the command palette');
    expect(list.element().textContent).toContain('-|F9|Mark as paid');
    expect(screen.getByRole('listitem').elements()).toHaveLength(2);
    await screen.rerender(
      <Page>
        <List />
      </Page>,
    );
    expect(screen.getByRole('listitem').elements()).toHaveLength(0);
  });

  it('hides shortcuts of inactive scopes unless includeInactive is set', async () => {
    function Panel() {
      useHotkeyScope('panel');
      return null;
    }
    const screen = await renderWithProvider(
      <Page>
        <List />
        <List includeInactive />
        <Register
          definitions={[
            { keys: 'N', handler: () => undefined, description: 'New order' },
            { keys: 'M', handler: () => undefined, description: 'Move row', scope: 'panel' },
            { keys: 'F1', handler: () => undefined, description: 'Help', scope: '*' },
          ]}
        />
      </Page>,
    );
    const [active, all] = screen.getByRole('list', { name: 'registered' }).elements();
    expect(active?.querySelectorAll('li')).toHaveLength(2);
    expect(all?.querySelectorAll('li')).toHaveLength(3);
    await screen.rerender(
      <Page>
        <Panel />
        <List />
        <List includeInactive />
        <Register
          definitions={[
            { keys: 'N', handler: () => undefined, description: 'New order' },
            { keys: 'M', handler: () => undefined, description: 'Move row', scope: 'panel' },
            { keys: 'F1', handler: () => undefined, description: 'Help', scope: '*' },
          ]}
        />
      </Page>,
    );
    const [afterActive] = screen.getByRole('list', { name: 'registered' }).elements();
    await expect
      .poll(() =>
        Array.from(afterActive?.querySelectorAll('li') ?? []).map((item) => item.textContent),
      )
      .toEqual(['-|M|Move row', '-|F1|Help']);
  });

  it('runs a listed shortcut without an event', () => {
    const handler = vi.fn();
    const registry = new HotkeyRegistry({ platform: 'other' });
    const unregister = registry.register({ keys: 'F9', handler, description: 'Mark as paid' });
    registry.getSnapshot()[0]?.run();
    expect(handler).toHaveBeenCalledWith(undefined);
    unregister();
    expect(registry.getSnapshot()).toHaveLength(0);
  });
});

describe('HotkeyRegistry', () => {
  it('attaches one document listener while shortcuts exist and removes it afterwards', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const registry = new HotkeyRegistry();
    const a = registry.register({ keys: 'N', handler: () => undefined });
    const b = registry.register({ keys: 'M', handler: () => undefined });
    expect(add.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
    a();
    expect(remove.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(0);
    b();
    expect(remove.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
  });
});
