import type { ReactNode } from 'react';
import { RacToastQueue } from './toast.rac';
import type { QueuedToast } from './toast.rac';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

/**
 * Default time a toast stays on screen, in milliseconds. The handoff used 3.6 s, which is too
 * short to read a sentence and press Undo (WCAG 2.2.1 Timing Adjustable); 5 s plus pause on
 * hover and focus lets keyboard and slow readers finish.
 */
export const DEFAULT_TOAST_TIMEOUT = 5000;

/** An action offered by a toast, usually Undo. */
export interface ToastAction {
  /** Label of the button: a verb ("Undo"). */
  label: string;
  /** Called when the button is pressed. The toast closes afterwards. */
  onPress: () => void;
}

export interface ToastOptions {
  /** Kind of message: `info` (default), `success`, `warning` or `danger`. */
  tone?: ToastTone;
  /** One action next to the message, usually `{ label: 'Undo', onPress }`. */
  action?: ToastAction;
  /**
   * Milliseconds before the toast closes by itself. Default 5000. The timer pauses while the
   * pointer or keyboard focus is on the toast region. `null` keeps the toast until it is
   * dismissed, which is right for a failure the user must act on.
   */
  timeout?: number | null;
  /** Called when the toast closes for any reason (timeout, dismiss, action). */
  onClose?: () => void;
}

/** What the queue stores for each toast. */
export interface ToastContentData {
  message: ReactNode;
  tone: ToastTone;
  action?: ToastAction | undefined;
}

export type QueuedToastData = QueuedToast<ToastContentData>;

/** The imperative API: `toast('Saved')` and `toast.success('Order #1051 created')`. */
export interface ToastApi {
  (message: ReactNode, options?: ToastOptions): string;
  info: (message: ReactNode, options?: Omit<ToastOptions, 'tone'>) => string;
  success: (message: ReactNode, options?: Omit<ToastOptions, 'tone'>) => string;
  warning: (message: ReactNode, options?: Omit<ToastOptions, 'tone'>) => string;
  danger: (message: ReactNode, options?: Omit<ToastOptions, 'tone'>) => string;
  /** Closes one toast by the key `toast()` returned. */
  close: (key: string) => void;
  /** Closes every toast. */
  clear: () => void;
}

export type ToastQueue = RacToastQueue<ToastContentData>;

/** Maximum number of toasts shown at once; the rest wait in the queue. */
const MAX_VISIBLE_TOASTS = 4;

/** Creates an independent queue, for tests or for a second region. Most apps use `toast`. */
export function createToastQueue(): ToastQueue {
  return new RacToastQueue<ToastContentData>({ maxVisibleToasts: MAX_VISIBLE_TOASTS });
}

const queuesByApi = new WeakMap<ToastApi, ToastQueue>();

/** Internal: the queue a `createToastApi` function writes to, `undefined` for foreign objects. */
export function getToastQueue(api: ToastApi): ToastQueue | undefined {
  return queuesByApi.get(api);
}

/** Builds the `toast()` function for a queue. */
export function createToastApi(queue: ToastQueue): ToastApi {
  const add = (message: ReactNode, options: ToastOptions = {}): string => {
    const { tone = 'info', action, timeout = DEFAULT_TOAST_TIMEOUT, onClose } = options;
    return queue.add(
      { message, tone, action },
      {
        ...(timeout === null ? {} : { timeout }),
        ...(onClose ? { onClose } : {}),
      },
    );
  };
  const api = ((message: ReactNode, options?: ToastOptions) => add(message, options)) as ToastApi;
  api.info = (message, options) => add(message, { ...options, tone: 'info' });
  api.success = (message, options) => add(message, { ...options, tone: 'success' });
  api.warning = (message, options) => add(message, { ...options, tone: 'warning' });
  api.danger = (message, options) => add(message, { ...options, tone: 'danger' });
  api.close = (key) => {
    queue.close(key);
  };
  api.clear = () => {
    queue.clear();
  };
  queuesByApi.set(api, queue);
  return api;
}

/** The default queue shared by `toast()` and `ToastRegion`. Creating it touches no browser API. */
export const defaultToastQueue: ToastQueue = createToastQueue();

/** Shows a toast in the default queue. Mount one `ToastRegion` near the app root. */
export const toast: ToastApi = createToastApi(defaultToastQueue);

/**
 * Hook form of `toast`, for components that prefer a hook. It returns the same stable object,
 * so it is safe in dependency arrays.
 */
export function useToast(): ToastApi {
  return toast;
}
