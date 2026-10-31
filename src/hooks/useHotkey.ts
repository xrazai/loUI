import { useEffect, useEffectEvent, useMemo } from 'react';
import type { RefObject } from 'react';
import { isEditableTarget, isMacPlatform, matchesHotkey, parseHotkey } from './hotkey';

export interface UseHotkeyOptions {
  /** Set to `false` to detach the listener. Default `true`. */
  enabled?: boolean;
  /**
   * Limits the hotkey to key events coming from inside this element (for example a
   * dialog or a panel). Without it the hotkey is global (listens on `document`).
   */
  scope?: RefObject<HTMLElement | null>;
  /** Fire while an input, textarea, select or contenteditable has focus. Default `false`. */
  allowInEditable?: boolean;
  /** Fire again while the key is held down (auto-repeat). Default `false`. */
  allowRepeat?: boolean;
  /** Call `preventDefault()` when the hotkey fires. Default `true`. */
  preventDefault?: boolean;
  /** Overrides platform detection for `Mod` (mainly for tests). */
  platform?: 'mac' | 'other';
}

/**
 * Runs `handler` when a single key combo is pressed.
 *
 * - `combo`: modifiers joined with `+` and one key, e.g. `Mod+K`, `Shift+/`, `Alt+N`, `Escape`.
 *   `Mod` is Command on macOS and Control elsewhere.
 * - Ignores events from editable fields (unless `allowInEditable`), IME composition,
 *   key auto-repeat (unless `allowRepeat`) and events another handler already prevented.
 *
 * This is deliberately small. A shortcut registry with conflict detection and a help
 * overlay is a separate task (GAP-004).
 */
export function useHotkey(
  combo: string,
  handler: (event: KeyboardEvent) => void,
  {
    enabled = true,
    scope,
    allowInEditable = false,
    allowRepeat = false,
    preventDefault = true,
    platform,
  }: UseHotkeyOptions = {},
): void {
  const parsed = useMemo(() => parseHotkey(combo), [combo]);
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!parsed || event.defaultPrevented) return;
    // keyCode 229 is how some browsers report IME key events outside `isComposing`.
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- keyCode 229 is the only IME signal in some browsers.
    if (event.isComposing || event.keyCode === 229) return;
    if (event.repeat && !allowRepeat) return;
    if (!allowInEditable && isEditableTarget(event.target)) return;
    const mac = platform ? platform === 'mac' : isMacPlatform();
    if (!matchesHotkey(event, parsed, mac)) return;
    if (preventDefault) event.preventDefault();
    handler(event);
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const target = scope ? scope.current : document;
    if (!target) return undefined;
    const listener = (event: Event) => {
      onKeyDown(event as KeyboardEvent);
    };
    target.addEventListener('keydown', listener);
    return () => {
      target.removeEventListener('keydown', listener);
    };
  }, [enabled, scope]);
}
