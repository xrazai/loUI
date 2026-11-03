import type { ReactNode } from 'react';
import { resolveMessages } from '../../i18n/messages';
import { getToastQueue, toast as defaultToast } from './queue';
import type { ToastApi, ToastOptions, ToastQueue, ToastTone } from './queue';
import { messages } from './Toast.messages';

/** Undo labels published by mounted `ToastRegion`s, already resolved for their locale and overrides. */
const registeredLabels = new WeakMap<ToastQueue, string>();

/**
 * Internal: a `ToastRegion` publishes the Undo label it would show (active locale, provider and
 * instance overrides) so `toastWithUndo` can use it outside React. Returns the cleanup.
 */
export function registerUndoLabel(queue: ToastQueue, label: string): () => void {
  registeredLabels.set(queue, label);
  return () => {
    if (registeredLabels.get(queue) === label) registeredLabels.delete(queue);
  };
}

/** Key of the open toast of each group, per toast API (GAP-053). */
const openGroups = new WeakMap<ToastApi, Map<string, string>>();

/**
 * Internal: closes the open toast of `groupKey` on `api`, if any. Closing runs its `onClose`, so
 * a deferred commit behind it settles before the caller applies the next action.
 */
export function closeGroupToast(api: ToastApi, groupKey: string): void {
  const previous = openGroups.get(api)?.get(groupKey);
  if (previous !== undefined) api.close(previous);
}

/**
 * Internal: records `key` as the open toast of `groupKey` and returns the `onClose` to give the
 * toast: it forgets the key (only if it is still the current one) and then calls `onClose`.
 */
export function trackGroupToast(
  api: ToastApi,
  groupKey: string,
  getKey: () => string | undefined,
  onClose?: () => void,
): () => void {
  return () => {
    const groups = openGroups.get(api);
    if (groups?.get(groupKey) === getKey()) groups?.delete(groupKey);
    onClose?.();
  };
}

/** Internal: stores the key of the toast just created for `groupKey`. */
export function rememberGroupToast(api: ToastApi, groupKey: string, key: string): void {
  let groups = openGroups.get(api);
  if (!groups) {
    groups = new Map();
    openGroups.set(api, groups);
  }
  groups.set(groupKey, key);
}

export interface ToastWithUndoOptions extends Omit<ToastOptions, 'tone' | 'action'> {
  /** Reverses the change. Called when the user presses Undo; the toast closes afterwards. */
  onUndo: () => void;
  /** Toast tone. Default `success`. */
  tone?: Exclude<ToastTone, 'danger'>;
  /** Toast API to use. Default: the shared `toast`. Pass the one of an isolated queue in tests or a second region. */
  toast?: ToastApi;
  /**
   * BCP 47 locale for the Undo label. Default: the locale of the mounted `ToastRegion` for the
   * same queue (that is, the `DSProvider` locale), or English when none is mounted yet.
   */
  locale?: string;
  /** Per-call override of the Toast messages; only `undo` is used. Wins over `locale`. */
  messages?: Partial<typeof messages.en>;
  /**
   * Replaces the previous undo toast of the same group instead of stacking a new one. The
   * previous toast closes (its `onClose` runs, so that change is final) and this one offers Undo
   * for the latest change only. Use it for quick repeated actions of one kind, such as toggles in
   * a grid. It does not merge changes into "Undo 4 changes": they can be made in any order on
   * different records, so one Undo could not safely reverse them all.
   */
  groupKey?: string;
}

function resolveUndoLabel(
  api: ToastApi,
  locale: string | undefined,
  overrides: Partial<typeof messages.en> | undefined,
): string {
  if (overrides?.undo !== undefined) return overrides.undo;
  if (locale !== undefined) return resolveMessages(messages, locale).undo;
  const queue = getToastQueue(api);
  return (queue && registeredLabels.get(queue)) ?? messages.en.undo;
}

/**
 * Non-hook form of the undo toast, for plain modules (stores, services, event handlers outside
 * React). Shows `message` with an **Undo** action whose label comes from the message catalogue
 * and the active locale, so callers never repeat the word by hand. Returns the toast key, like
 * `toast()`.
 *
 * Unlike `useUndoable` it does not defer anything: do the change first, then call this with a
 * function that reverses it. Use `useUndoable` inside components when you also need a deferred
 * `commit` or failure handling.
 *
 * Outside React there is no context, so the locale is the one of the mounted `ToastRegion`
 * (inside `DSProvider`); pass `locale` or `messages` to decide it yourself.
 */
export function toastWithUndo(message: ReactNode, options: ToastWithUndoOptions): string {
  const {
    onUndo,
    tone = 'success',
    toast = defaultToast,
    locale,
    messages: overrides,
    groupKey,
    onClose,
    ...rest
  } = options;
  if (groupKey !== undefined) closeGroupToast(toast, groupKey);
  const closeHandler =
    groupKey === undefined ? onClose : trackGroupToast(toast, groupKey, () => key, onClose);
  const key: string = toast[tone](message, {
    ...rest,
    ...(closeHandler ? { onClose: closeHandler } : {}),
    action: { label: resolveUndoLabel(toast, locale, overrides), onPress: onUndo },
  });
  if (groupKey !== undefined) rememberGroupToast(toast, groupKey, key);
  return key;
}
