import { useRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProvider } from '../test/render';
import { useHotkey } from './useHotkey';
import type { UseHotkeyOptions } from './useHotkey';

function Harness({
  combo = 'Mod+K',
  handler,
  options,
  scoped = false,
}: {
  combo?: string;
  handler: (event: KeyboardEvent) => void;
  options?: UseHotkeyOptions;
  scoped?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useHotkey(combo, handler, scoped ? { ...options, scope: ref } : options);
  return (
    <div>
      <button type="button">outside</button>
      <input aria-label="text field" />
      <textarea aria-label="notes" />
      <input type="checkbox" aria-label="agree" />
      <div ref={ref}>
        <button type="button">inside</button>
        <div contentEditable suppressContentEditableWarning role="textbox" aria-label="rich">
          rich
        </div>
      </div>
    </div>
  );
}

describe('useHotkey', () => {
  it('fires on the combo and prevents the default action', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(
      <Harness handler={handler} options={{ platform: 'other' }} />,
    );
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toBeInstanceOf(KeyboardEvent);
    expect((handler.mock.calls[0]?.[0] as KeyboardEvent).defaultPrevented).toBe(true);
  });

  it('does not fire for other keys or missing modifiers', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(
      <Harness handler={handler} options={{ platform: 'other' }} />,
    );
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('k');
    await userEvent.keyboard('{Control>}j{/Control}');
    await userEvent.keyboard('{Control>}{Shift>}k{/Shift}{/Control}');
    expect(handler).not.toHaveBeenCalled();
  });

  it('uses Command for Mod on macOS', async () => {
    const handler = vi.fn();
    await renderWithProvider(<Harness handler={handler} options={{ platform: 'mac' }} />);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(handler).not.toHaveBeenCalled();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('supports a plain key such as Escape', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(<Harness combo="Escape" handler={handler} />);
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('{Escape}');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores events from editable fields by default', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(<Harness combo="/" handler={handler} />);
    await screen.getByRole('textbox', { name: 'text field' }).click();
    await userEvent.keyboard('/');
    await screen.getByRole('textbox', { name: 'notes' }).click();
    await userEvent.keyboard('/');
    await screen.getByRole('textbox', { name: 'rich' }).click();
    await userEvent.keyboard('/');
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires from non-text inputs such as checkboxes', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(<Harness combo="/" handler={handler} />);
    await screen.getByRole('checkbox', { name: 'agree' }).click();
    await userEvent.keyboard('/');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('fires inside editable fields with allowInEditable', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(
      <Harness handler={handler} options={{ allowInEditable: true, platform: 'other' }} />,
    );
    await screen.getByRole('textbox', { name: 'text field' }).click();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores IME composition', async () => {
    const handler = vi.fn();
    await renderWithProvider(<Harness handler={handler} options={{ platform: 'other' }} />);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, isComposing: true, bubbles: true }),
    );
    expect(handler).not.toHaveBeenCalled();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, keyCode: 229, bubbles: true }),
    );
    expect(handler).not.toHaveBeenCalled();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores auto-repeat unless allowed', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(
      <Harness handler={handler} options={{ platform: 'other' }} />,
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, repeat: true, bubbles: true }),
    );
    expect(handler).not.toHaveBeenCalled();
    await screen.rerender(
      <Harness handler={handler} options={{ platform: 'other', allowRepeat: true }} />,
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, repeat: true, bubbles: true }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('is scoped to its element', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(<Harness combo="Escape" handler={handler} scoped />);
    await screen.getByRole('button', { name: 'outside' }).click();
    await userEvent.keyboard('{Escape}');
    expect(handler).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'inside' }).click();
    await userEvent.keyboard('{Escape}');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('can be disabled and re-enabled', async () => {
    const handler = vi.fn();
    const screen = await renderWithProvider(
      <Harness handler={handler} options={{ enabled: false, platform: 'other' }} />,
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(handler).not.toHaveBeenCalled();
    await screen.rerender(
      <Harness handler={handler} options={{ enabled: true, platform: 'other' }} />,
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('can leave the default action alone', async () => {
    const handler = vi.fn();
    await renderWithProvider(
      <Harness handler={handler} options={{ preventDefault: false, platform: 'other' }} />,
    );
    const keydown = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keydown);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(keydown.defaultPrevented).toBe(false);
  });

  it('skips events another handler already prevented', async () => {
    const handler = vi.fn();
    await renderWithProvider(<Harness handler={handler} options={{ platform: 'other' }} />);
    const keydown = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    keydown.preventDefault();
    document.dispatchEvent(keydown);
    expect(handler).not.toHaveBeenCalled();
  });

  it('always calls the latest handler and stops listening after unmount', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const screen = await renderWithProvider(
      <Harness handler={first} options={{ platform: 'other' }} />,
    );
    await screen.rerender(<Harness handler={second} options={{ platform: 'other' }} />);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    await screen.unmount();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    expect(second).toHaveBeenCalledTimes(1);
  });
});
