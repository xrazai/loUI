import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useHotkeyRegistry } from './HotkeyProvider';
import type { HotkeyDefinition, RegisteredHotkey } from './hotkeyRegistry';

/**
 * Registers keyboard shortcuts in the registry (see `HotkeyProvider`) for as long as the
 * component is mounted.
 *
 * - `keys`: `Mod+K`, `F2`, `N`, `1`, `Shift+/`, `Escape`. `Mod` is Command on macOS and Control
 *   elsewhere.
 * - Ignores editable fields (`allowInEditable`), IME composition, auto-repeat (`allowRepeat`),
 *   events another handler already prevented and, for page-level shortcuts, focus inside an open
 *   dialog or menu (`allowInOverlay`).
 * - Only one named scope is active at a time (`useHotkeyScope`); shortcuts of other scopes wait.
 * - In development, registering the same combo twice in one scope logs a warning; the most
 *   recent registration wins.
 * - `description` and `group` make a shortcut appear in `useRegisteredHotkeys`, the
 *   command palette and `ShortcutsHelp`.
 *
 * Handlers may close over props and state: the latest handler always runs. The array can be
 * created inline on each render.
 */
export function useHotkeys(definitions: readonly HotkeyDefinition[]): void {
  const registry = useHotkeyRegistry();
  const latest = useRef(definitions);
  useEffect(() => {
    latest.current = definitions;
  });
  // Re-register only when something other than a handler changes.
  const signature = JSON.stringify(
    definitions.map((definition) => [
      definition.keys,
      definition.description,
      definition.group,
      definition.scope,
      definition.allowInEditable,
      definition.isDisabled,
    ]),
  );
  useEffect(() => {
    const unregister = latest.current.map((definition, index) =>
      registry.register(definition, () => latest.current[index] ?? definition),
    );
    return () => {
      for (const remove of unregister) remove();
    };
  }, [registry, signature]);
}

export interface UseHotkeyScopeOptions {
  /** Set to `false` to take the scope off the stack. Default `true`. */
  isActive?: boolean;
}

/**
 * Makes `name` the active scope while the component is mounted (and `isActive`): shortcuts
 * registered with `scope: name` fire and `global` ones stop, until the component unmounts.
 * Scopes stack: the most recently mounted one wins. Use it in the body of a panel, a wizard or
 * an editor that has its own shortcuts. Dialogs do not need it for page shortcuts: those are
 * already ignored while focus is inside an open dialog.
 */
export function useHotkeyScope(
  name: string,
  { isActive = true }: UseHotkeyScopeOptions = {},
): void {
  const registry = useHotkeyRegistry();
  useEffect(() => {
    if (!isActive) return undefined;
    return registry.pushScope(name);
  }, [registry, name, isActive]);
}

export interface UseRegisteredHotkeysOptions {
  /** Also return shortcuts whose scope is not active right now. Default `false`. */
  includeInactive?: boolean;
}

const NONE: readonly RegisteredHotkey[] = [];

/**
 * The shortcuts that have a `description`, in registration order, for a help dialog or a
 * command list. By default only those that can fire now (active scope). Updates when
 * shortcuts mount, unmount or the active scope changes. Empty during server rendering.
 */
export function useRegisteredHotkeys({
  includeInactive = false,
}: UseRegisteredHotkeysOptions = {}): readonly RegisteredHotkey[] {
  const registry = useHotkeyRegistry();
  const all = useSyncExternalStore(registry.subscribe, registry.getSnapshot, () => NONE);
  return useMemo(
    () => (includeInactive ? all : all.filter((hotkey) => hotkey.isActive)),
    [all, includeInactive],
  );
}
