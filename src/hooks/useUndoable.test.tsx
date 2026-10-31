import { act, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastRegion, createToastApi, createToastQueue } from '../components/Toast';
import { expectNoA11yViolations } from '../test/axe';
import { renderWithProvider } from '../test/render';
import { useUndoable } from './useUndoable';
import type { UndoableAction, UndoableHandle, UseUndoableOptions } from './useUndoable';

type Probe = Pick<UndoableAction, 'commit' | 'onUndo' | 'onCommit' | 'timeout'> & {
  options?: UseUndoableOptions;
  onHandle?: (handle: UndoableHandle) => void;
};

/** A one-button screen: "Archive" flips the status optimistically. */
function Screen({ options, onHandle, ...action }: Probe) {
  const [status, setStatus] = useState('active');
  const undoable = useUndoable(options);
  return (
    <>
      <p>{`Status: ${status}`}</p>
      <button
        type="button"
        onClick={() => {
          const handle = undoable.run({
            message: 'Order #1051 archived',
            apply: () => {
              setStatus('archived');
            },
            revert: () => {
              setStatus('active');
            },
            ...action,
          });
          onHandle?.(handle);
        }}
      >
        Archive
      </button>
    </>
  );
}

function setup() {
  const queue = createToastQueue();
  return { queue, api: createToastApi(queue) };
}

async function archive(screen: Awaited<ReturnType<typeof renderWithProvider>>) {
  await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useUndoable', () => {
  it('applies the change at once and offers Undo in a toast', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(
      <>
        <Screen options={{ toast: api }} />
        <ToastRegion queue={queue} />
      </>,
    );
    await archive(screen);
    await expect.element(screen.getByText('Status: archived')).toBeVisible();
    await expect.element(screen.getByText(/Order #1051 archived/)).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
  });

  it('reverts on Undo and never commits', async () => {
    const { queue, api } = setup();
    const commit = vi.fn();
    const onUndo = vi.fn();
    const screen = await renderWithProvider(
      <>
        <Screen options={{ toast: api }} commit={commit} onUndo={onUndo} />
        <ToastRegion queue={queue} />
      </>,
    );
    await archive(screen);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect.element(screen.getByText('Status: active')).toBeVisible();
    await expect.poll(() => onUndo.mock.calls.length).toBe(1);
    expect(queue.visibleToasts).toHaveLength(0);
    expect(commit).not.toHaveBeenCalled();
  });

  it('is reachable and usable from the keyboard', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(
      <>
        <Screen options={{ toast: api }} />
        <ToastRegion queue={queue} />
      </>,
    );
    await archive(screen);
    screen.getByRole('button', { name: 'Undo' }).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('Status: active')).toBeVisible();
  });

  it('has no axe violations while the Undo toast is showing', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(
      <>
        <Screen options={{ toast: api }} />
        <ToastRegion queue={queue} />
      </>,
    );
    await archive(screen);
    await expect.element(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
    // Wait for the toast entry animation: mid-fade colors give axe a false contrast failure.
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });

  describe('with fake timers', () => {
    it('commits once the Undo window is over, and only once', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      const { queue, api } = setup();
      const commit = vi.fn();
      const onCommit = vi.fn();
      const screen = await renderWithProvider(
        <>
          <Screen options={{ toast: api }} commit={commit} onCommit={onCommit} />
          <ToastRegion queue={queue} />
        </>,
      );
      await archive(screen);
      expect(commit).not.toHaveBeenCalled();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4900);
      });
      expect(commit).not.toHaveBeenCalled();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
      expect(commit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledTimes(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });
      expect(commit).toHaveBeenCalledTimes(1);
      await expect.element(screen.getByText('Status: archived')).toBeVisible();
    });

    it('never commits after Undo, however long it waits', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      const { queue, api } = setup();
      const commit = vi.fn();
      const screen = await renderWithProvider(
        <>
          <Screen options={{ toast: api }} commit={commit} />
          <ToastRegion queue={queue} />
        </>,
      );
      await archive(screen);
      screen.getByRole('button', { name: 'Undo' }).element().focus();
      await userEvent.keyboard('{Enter}');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30_000);
      });
      expect(commit).not.toHaveBeenCalled();
      await expect.element(screen.getByText('Status: active')).toBeVisible();
    });

    it('honors a custom timeout', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      const { queue, api } = setup();
      const commit = vi.fn();
      const screen = await renderWithProvider(
        <>
          <Screen options={{ toast: api }} commit={commit} timeout={1000} />
          <ToastRegion queue={queue} />
        </>,
      );
      await archive(screen);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });
      expect(commit).toHaveBeenCalledTimes(1);
    });

    it('reverts and shows an error toast that stays when the commit fails', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      const { queue, api } = setup();
      const commit = vi.fn().mockRejectedValue(new Error('network'));
      const screen = await renderWithProvider(
        <>
          <Screen options={{ toast: api }} commit={commit} />
          <ToastRegion queue={queue} />
        </>,
      );
      await archive(screen);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5100);
      });
      expect(commit).toHaveBeenCalledTimes(1);
      await expect.element(screen.getByText('Status: active')).toBeVisible();
      await expect.element(screen.getByText(/Couldn't complete the change/)).toBeVisible();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60_000);
      });
      await expect.element(screen.getByText(/Couldn't complete the change/)).toBeVisible();
    });

    it('does not commit while the pointer or focus holds the toast open', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
      const { queue, api } = setup();
      const commit = vi.fn();
      const screen = await renderWithProvider(
        <>
          <Screen options={{ toast: api }} commit={commit} timeout={1000} />
          <ToastRegion queue={queue} />
        </>,
      );
      await archive(screen);
      screen.getByRole('button', { name: 'Undo' }).element().focus();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });
      expect(commit).not.toHaveBeenCalled();
    });
  });

  it('can be undone from code through the handle', async () => {
    const { queue, api } = setup();
    let handle: UndoableHandle | undefined;
    const commit = vi.fn();
    const screen = await renderWithProvider(
      <>
        <Screen
          options={{ toast: api }}
          commit={commit}
          onHandle={(next) => {
            handle = next;
          }}
        />
        <ToastRegion queue={queue} />
      </>,
    );
    await archive(screen);
    act(() => {
      handle?.undo();
    });
    await expect.element(screen.getByText('Status: active')).toBeVisible();
    expect(queue.visibleToasts).toHaveLength(0);
    expect(commit).not.toHaveBeenCalled();
  });

  it('shows an error toast when Undo itself fails', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(
      <>
        <Probeless api={api} />
        <ToastRegion queue={queue} />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await expect.element(screen.getByText(/Couldn't undo the change/)).toBeVisible();
  });

  it('uses message overrides and the pt-BR catalog', async () => {
    const { queue, api } = setup();
    const screen = await renderWithProvider(
      <>
        <Screen options={{ toast: api, messages: { undo: 'Take back' } }} />
        <ToastRegion queue={queue} />
      </>,
    );
    await archive(screen);
    await expect.element(screen.getByRole('button', { name: 'Take back' })).toBeVisible();
  });

  it('ships a pt-BR catalog', async () => {
    const pt = setup();
    const ptScreen = await renderWithProvider(
      <>
        <Screen options={{ toast: pt.api }} />
        <ToastRegion queue={pt.queue} />
      </>,
      { locale: 'pt-BR' },
    );
    await archive(ptScreen);
    await expect.element(ptScreen.getByRole('button', { name: 'Desfazer' })).toBeVisible();
  });
});

function Probeless({ api }: { api: ReturnType<typeof createToastApi> }) {
  const undoable = useUndoable({ toast: api });
  return (
    <button
      type="button"
      onClick={() => {
        undoable.run({
          message: 'Item removed',
          apply: () => undefined,
          revert: () => Promise.reject(new Error('offline')),
        });
      }}
    >
      Remove
    </button>
  );
}
