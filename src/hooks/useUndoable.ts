import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { toast as defaultToast } from '../components/Toast';
import type { ToastApi, ToastTone } from '../components/Toast';
import { useMessages } from '../i18n';
import { messages } from './useUndoable.messages';

export interface UndoableAction {
  /** Toast text, past tense: "Order #1051 archived". */
  message: ReactNode;
  /**
   * Does the change now, so the screen reflects it at once (optimistic update). Runs
   * synchronously inside `run()`.
   */
  apply: () => void;
  /**
   * Reverses `apply`. Called when the user presses Undo, and when `commit` fails. Capture what
   * you need before acting (the previous status, the removed row): it must not depend on state
   * that has moved on. May be async; a failure shows an error toast.
   */
  revert: () => void | Promise<void>;
  /**
   * Makes the change permanent once the Undo window is over (the toast timed out or was
   * dismissed). Omit it when `apply` already persisted the change and `revert` sends the
   * inverse change. If it throws or rejects, the change is reverted and an error toast stays
   * on screen.
   */
  commit?: (() => void | Promise<void>) | undefined;
  /** Called after a successful Undo. */
  onUndo?: (() => void) | undefined;
  /** Called after `commit` finished successfully, or right after the window closes without a `commit`. */
  onCommit?: (() => void) | undefined;
  /** Toast tone. Default `success`. */
  tone?: Exclude<ToastTone, 'danger'> | undefined;
  /** Milliseconds the Undo stays available. Default 5000. The timer pauses on hover and focus. */
  timeout?: number | undefined;
}

export interface UndoableHandle {
  /** Key of the toast. */
  key: string;
  /** Undoes the change from code, as if Undo had been pressed. Does nothing once settled. */
  undo: () => void;
}

export interface UseUndoableOptions {
  /** Toast API to use. Default: the shared `toast`. Pass an isolated one in tests or a second region. */
  toast?: ToastApi;
  /** Per-instance overrides of the built-in messages (`undo`, `commitFailed`, `undoFailed`). */
  messages?: Partial<typeof messages.en>;
}

export interface UseUndoableResult {
  /**
   * Applies an action optimistically and offers Undo in a toast. Returns a handle. The action
   * settles exactly once: undone (Undo pressed or `handle.undo()`) or committed (the toast
   * closed without Undo).
   */
  run: (action: UndoableAction) => UndoableHandle;
}

/**
 * Undo, don't confirm (AGENTS.md section 5): applies a reversible action immediately, shows a
 * toast with an **Undo** button, then either reverts it (Undo) or commits it (the toast times
 * out or is dismissed).
 *
 * - `apply` runs now; the screen updates at once.
 * - Undo calls `revert`. Closing or timing out calls the optional async `commit`; if that
 *   fails, the change is reverted and an error toast stays until dismissed.
 * - The timer lives in the toast, so it pauses on hover and focus (WCAG 2.2.1) and the commit
 *   waits for it. A pending commit still runs if the component that started it unmounts.
 * - Mount one `ToastRegion` near the app root.
 *
 * Use it for reversible actions (archive, mark as done, change status). Deleting still asks
 * for a confirmation first (`ConfirmDialog`); the Undo toast follows it.
 *
 * Deferring the commit means a closed tab loses a pending change. When that matters, persist in
 * `apply` and make `revert` send the inverse change instead (omit `commit`).
 */
export function useUndoable({
  toast = defaultToast,
  messages: overrides,
}: UseUndoableOptions = {}): UseUndoableResult {
  const t = useMessages('useUndoable', messages, overrides);
  const { undo: undoLabel, commitFailed, undoFailed } = t;

  const run = useCallback(
    (action: UndoableAction): UndoableHandle => {
      const {
        message,
        apply,
        revert,
        commit,
        onUndo,
        onCommit,
        tone = 'success',
        timeout,
      } = action;
      let settled = false;

      const fail = (text: string) => {
        toast.danger(text, { timeout: null });
      };

      const undo = () => {
        if (settled) return;
        settled = true;
        void (async () => {
          try {
            await revert();
          } catch {
            fail(undoFailed);
            return;
          }
          onUndo?.();
        })();
      };

      const settleByClose = () => {
        if (settled) return;
        settled = true;
        void (async () => {
          try {
            await commit?.();
          } catch {
            try {
              await revert();
            } catch {
              // The change could not be reverted either; the error toast below covers both.
            }
            fail(commitFailed);
            return;
          }
          onCommit?.();
        })();
      };

      apply();
      const key = toast[tone](message, {
        action: { label: undoLabel, onPress: undo },
        onClose: settleByClose,
        ...(timeout === undefined ? {} : { timeout }),
      });
      return {
        key,
        undo: () => {
          undo();
          toast.close(key);
        },
      };
    },
    [toast, undoLabel, commitFailed, undoFailed],
  );

  return useMemo(() => ({ run }), [run]);
}
