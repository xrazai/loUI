import { useCallback, useSyncExternalStore } from 'react';
import type { Ref } from 'react';
import { Text } from 'react-aria-components';
import { useMessages } from '../../i18n';
import { classNames } from '../../utils/classNames';
import { Button } from '../Button';
import { XIcon } from '../Icon/icons';
import { IconButton } from '../IconButton';
import { VisuallyHidden } from '../VisuallyHidden';
import { defaultToastQueue } from './queue';
import type { QueuedToastData, ToastQueue } from './queue';
import { messages } from './Toast.messages';
import styles from './Toast.module.css';
import { RacToast, RacToastContent, RacToastRegion } from './toast.rac';

export interface ToastRegionProps {
  /** The queue to show. Defaults to the one `toast()` writes to. */
  queue?: ToastQueue;
  /** Per-instance overrides of the built-in messages. */
  messages?: Partial<typeof messages.en>;
  /** Class name for the region. */
  className?: string;
  /** Ref to the region element. */
  ref?: Ref<HTMLDivElement>;
}

/** Whether the queue has a visible toast; re-renders when that changes. */
function useHasToasts(queue: ToastQueue): boolean {
  return useSyncExternalStore(
    (onChange) => queue.subscribe(onChange),
    () => queue.visibleToasts.length > 0,
    () => false,
  );
}

/** Page property the toast region keeps up to date so focused elements scroll clear of it. */
const CLEARANCE_PROPERTY = '--ds-toast-clearance';

/**
 * WCAG 2.4.11 (focus not obscured): the region is fixed to the bottom of the viewport, so
 * the browser would scroll a focused control right under it. While the region is mounted it
 * publishes its height (plus the offset from the viewport edge) as `--ds-toast-clearance`;
 * `base.css` and the AppShell turn that into `scroll-padding-block-end`.
 */
function trackClearance(node: HTMLElement): () => void {
  const root = document.documentElement;
  const update = () => {
    const distance = Math.max(0, window.innerHeight - node.getBoundingClientRect().top);
    root.style.setProperty(CLEARANCE_PROPERTY, `${String(Math.ceil(distance))}px`);
  };
  update();
  const observer = new ResizeObserver(update);
  observer.observe(node);
  window.addEventListener('resize', update);
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', update);
    root.style.removeProperty(CLEARANCE_PROPERTY);
  };
}

function ToastItem({
  item,
  queue,
  overrides,
}: {
  item: QueuedToastData;
  queue: ToastQueue;
  overrides: Partial<typeof messages.en> | undefined;
}) {
  const t = useMessages('Toast', messages, overrides);
  const { message, tone, action } = item.content;
  return (
    <RacToast toast={item} className={classNames(styles.toast)} data-tone={tone}>
      <span className={classNames(styles.dot)} aria-hidden="true" />
      <RacToastContent className={classNames(styles.content)}>
        <Text slot="title" className={classNames(styles.message)}>
          <VisuallyHidden>{t[tone]}: </VisuallyHidden>
          {message}
        </Text>
      </RacToastContent>
      <div className={classNames(styles.actions)}>
        {action ? (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              action.onPress();
              queue.close(item.key);
            }}
          >
            {action.label}
          </Button>
        ) : null}
        <IconButton slot="close" variant="ghost" size="sm" icon={XIcon} label={t.dismiss} />
      </div>
    </RacToast>
  );
}

/**
 * Renders the toasts of a queue. Mount **one** near the app root, inside `DSProvider`, and call
 * `toast()` from anywhere. Built on React Aria's toast region (isolated in `toast.rac.ts`).
 *
 * The region is a landmark named "Toast notifications" that `F6` moves into; the timer of every toast
 * pauses while the pointer is over the region or focus is inside it (WCAG 2.2.1). Toasts stack
 * at the bottom center of the viewport, clear of side panels, above dialogs and below tooltips.
 */
export function ToastRegion({
  queue = defaultToastQueue,
  messages: overrides,
  className,
  ref,
}: ToastRegionProps) {
  const t = useMessages('Toast', messages, overrides);
  // React Aria registers the region as a landmark (F6) only when it is mounted with its first
  // toast, so the region is mounted here, on demand, instead of being rendered empty.
  const hasToasts = useHasToasts(queue);
  const regionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      return node ? trackClearance(node) : undefined;
    },
    [ref],
  );
  if (!hasToasts) return null;
  return (
    <RacToastRegion
      ref={regionRef}
      queue={queue}
      aria-label={t.region}
      className={classNames(styles.region, className)}
    >
      {({ toast: item }) => <ToastItem item={item} queue={queue} overrides={overrides} />}
    </RacToastRegion>
  );
}
