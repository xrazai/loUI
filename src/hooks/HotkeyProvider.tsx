import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { HotkeyRegistry } from './hotkeyRegistry';

/** Context holding the shortcut registry of the nearest `HotkeyProvider`. */
export const HotkeyContext = createContext<HotkeyRegistry | null>(null);

let fallbackRegistry: HotkeyRegistry | undefined;

/**
 * The registry of the nearest `HotkeyProvider`, or one shared page-wide registry when there is
 * no provider, so `useHotkeys` works anywhere. Internal: use `useHotkeys`.
 */
export function useHotkeyRegistry(): HotkeyRegistry {
  const registry = useContext(HotkeyContext);
  if (registry) return registry;
  fallbackRegistry ??= new HotkeyRegistry();
  return fallbackRegistry;
}

export interface HotkeyProviderProps {
  /** The app. Every `useHotkeys` call below registers in this provider's registry. */
  children: ReactNode;
  /**
   * Overrides platform detection for `Mod` (Command on `mac`, Control on `other`). Mainly for
   * tests and documentation; by default the browser decides.
   */
  platform?: 'mac' | 'other';
}

/**
 * Optional root provider for the shortcut registry. Without it `useHotkeys` uses one shared
 * registry for the whole page, which is enough for most apps; add the provider to isolate the
 * shortcuts of a subtree (micro frontends, tests, Storybook) or to pin the platform.
 *
 * Place it inside `DSProvider` and above the `CommandPalette` and `ShortcutsHelp` it feeds.
 */
export function HotkeyProvider({ children, platform }: HotkeyProviderProps) {
  const [registry] = useState(() => new HotkeyRegistry({ platform }));
  return <HotkeyContext value={registry}>{children}</HotkeyContext>;
}
