import { isDev } from '../utils/env';
import {
  canonicalHotkey,
  hotkeyKeys,
  isEditableTarget,
  isMacPlatform,
  matchesHotkey,
  parseHotkey,
} from './hotkey';
import type { ParsedHotkey } from './hotkey';

/** The scope of hotkeys that are not registered for a specific scope. */
export const GLOBAL_HOTKEY_SCOPE = 'global';

/** A scope name that is always active, whatever scope is on top of the stack. */
export const ANY_HOTKEY_SCOPE = '*';

/** One shortcut passed to `useHotkeys`. */
export interface HotkeyDefinition {
  /**
   * The key combo: modifiers joined with `+` and one key. `Mod+K`, `Shift+/`, `Alt+N`, `Escape`,
   * `F2`, `N`, `1`. `Mod` is Command on macOS and Control elsewhere. Case-insensitive.
   */
  keys: string;
  /**
   * Runs when the combo is pressed. `event` is `undefined` when the command palette or another
   * UI runs the shortcut from the list instead of the keyboard.
   */
  handler: (event?: KeyboardEvent) => void;
  /**
   * What the shortcut does, in the user's words ("Create order"). Shortcuts without a description
   * work but are not listed by `useRegisteredHotkeys`, the command palette or `ShortcutsHelp`.
   */
  description?: string | undefined;
  /** Heading the shortcut is listed under ("Navigation", "Orders"). */
  group?: string | undefined;
  /**
   * The scope the shortcut belongs to. Default `'global'`: active when no named scope is on the
   * stack (see `useHotkeyScope`) and not suppressed by an open dialog or menu. A named scope is
   * active only while it is on top of the stack. `'*'` is active in every scope.
   */
  scope?: string | undefined;
  /** Fire while an input, textarea, select or contenteditable has focus. Default `false`. */
  allowInEditable?: boolean | undefined;
  /**
   * Fire while focus is inside an open dialog or menu. Default `false`: page shortcuts such as
   * `N` must not act behind a modal, or fight with a menu's typeahead. Applies to `global` and
   * `'*'` shortcuts; a shortcut in an active named scope always fires.
   */
  allowInOverlay?: boolean | undefined;
  /** Fire again while the key is held down (auto-repeat). Default `false`. */
  allowRepeat?: boolean | undefined;
  /** Call `preventDefault()` when the shortcut fires. Default `true`. */
  preventDefault?: boolean | undefined;
  /** Detach the shortcut without removing it from the array. Default `false`. */
  isDisabled?: boolean | undefined;
}

/** A shortcut as listed by `useRegisteredHotkeys`. */
export interface RegisteredHotkey {
  /** Unique within the page. */
  id: string;
  /** The combo as written (`Mod+K`). */
  keys: string;
  /** The combo split for `Kbd`'s `keys` prop (`['Mod', 'K']`). */
  keyParts: readonly string[];
  /** What it does. Always set: undescribed shortcuts are not listed. */
  description: string;
  /** Heading it is listed under, if any. */
  group: string | undefined;
  /** Scope name (`'global'` by default). */
  scope: string;
  /** Whether the shortcut can fire now: its scope is active (or `'*'`). */
  isActive: boolean;
  /** Runs the shortcut as if it had been pressed (no event). */
  run: () => void;
}

interface Entry {
  id: string;
  definition: HotkeyDefinition;
  parsed: ParsedHotkey;
  scope: string;
  /** Latest definition, read at event time so handlers are never stale. */
  read: () => HotkeyDefinition;
}

export interface HotkeyRegistryOptions {
  /** Overrides platform detection for `Mod` (mainly for tests). */
  platform?: 'mac' | 'other' | undefined;
}

const OVERLAY_SELECTOR = '[role="dialog"], [role="alertdialog"], [role="menu"]';

function isInsideOverlay(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(OVERLAY_SELECTOR) !== null;
}

const EMPTY: readonly RegisteredHotkey[] = [];

/**
 * The store behind `HotkeyProvider`, `useHotkeys` and `useRegisteredHotkeys`. One `keydown`
 * listener on `document` is attached while at least one shortcut is registered. Framework
 * independent so it can be tested without React.
 */
export class HotkeyRegistry {
  private entries: Entry[] = [];
  private scopes: { id: number; name: string }[] = [];
  private listeners = new Set<() => void>();
  private snapshot: readonly RegisteredHotkey[] = EMPTY;
  private nextId = 1;
  private attached = false;
  private warned = new Set<string>();
  private platform: 'mac' | 'other' | undefined;

  constructor({ platform }: HotkeyRegistryOptions = {}) {
    this.platform = platform;
  }

  private isMac(): boolean {
    return this.platform ? this.platform === 'mac' : isMacPlatform();
  }

  /** The scope on top of the stack, or `'global'`. */
  getActiveScope(): string {
    return this.scopes.at(-1)?.name ?? GLOBAL_HOTKEY_SCOPE;
  }

  /** Puts a named scope on top of the stack. Returns the function that removes it. */
  pushScope(name: string): () => void {
    const id = this.nextId++;
    this.scopes.push({ id, name });
    this.emit();
    return () => {
      this.scopes = this.scopes.filter((scope) => scope.id !== id);
      this.emit();
    };
  }

  /**
   * Registers a shortcut. `read` returns the latest definition (for handlers); the metadata
   * (`keys`, `scope`, `description`...) is taken from `definition`. Returns the unregister function.
   */
  register(
    definition: HotkeyDefinition,
    read: () => HotkeyDefinition = () => definition,
  ): () => void {
    const parsed = parseHotkey(definition.keys);
    if (!parsed) return () => undefined;
    const entry: Entry = {
      id: `hotkey-${String(this.nextId++)}`,
      definition,
      parsed,
      scope: definition.scope ?? GLOBAL_HOTKEY_SCOPE,
      read,
    };
    this.warnOnConflict(entry);
    this.entries.push(entry);
    this.emit();
    this.attach();
    return () => {
      this.entries = this.entries.filter((candidate) => candidate !== entry);
      this.emit();
      if (this.entries.length === 0) this.detach();
    };
  }

  private warnOnConflict(entry: Entry): void {
    if (!isDev() || entry.definition.isDisabled) return;
    const mac = this.isMac();
    const canonical = canonicalHotkey(entry.parsed, mac);
    const clash = this.entries.some(
      (other) =>
        other.scope === entry.scope &&
        !other.definition.isDisabled &&
        canonicalHotkey(other.parsed, mac) === canonical,
    );
    const token = `${entry.scope}:${canonical}`;
    if (!clash || this.warned.has(token)) return;
    this.warned.add(token);
    console.warn(
      `[loui-ds] Hotkey conflict: "${entry.definition.keys}" is registered more than once in the "${entry.scope}" scope. ` +
        'Only the most recently registered handler runs. Give one of them another scope or key.',
    );
  }

  /** Subscribes to changes of the registered list and of the active scope. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** The current list; a new array identity whenever it changes (for `useSyncExternalStore`). */
  getSnapshot = (): readonly RegisteredHotkey[] => this.snapshot;

  private emit(): void {
    const active = this.getActiveScope();
    this.snapshot = this.entries.flatMap((entry) => {
      const { description } = entry.definition;
      if (!description || entry.definition.isDisabled) return [];
      return [
        {
          id: entry.id,
          keys: entry.definition.keys,
          keyParts: hotkeyKeys(entry.definition.keys),
          description,
          group: entry.definition.group,
          scope: entry.scope,
          isActive: entry.scope === ANY_HOTKEY_SCOPE || entry.scope === active,
          run: () => {
            entry.read().handler(undefined);
          },
        },
      ];
    });
    for (const listener of this.listeners) listener();
  }

  private attach(): void {
    if (this.attached || typeof document === 'undefined') return;
    document.addEventListener('keydown', this.onKeyDown);
    this.attached = true;
  }

  private detach(): void {
    if (!this.attached) return;
    document.removeEventListener('keydown', this.onKeyDown);
    this.attached = false;
  }

  /** Handles a keydown. Public so tests can drive the registry directly. */
  onKeyDown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) return;
    // keyCode 229 is how some browsers report IME key events outside `isComposing`.
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- keyCode 229 is the only IME signal in some browsers.
    if (event.isComposing || event.keyCode === 229) return;
    const mac = this.isMac();
    const active = this.getActiveScope();
    const editable = isEditableTarget(event.target);
    const overlay = isInsideOverlay(event.target);
    // Most recently registered first: it wins a conflict.
    for (let index = this.entries.length - 1; index >= 0; index -= 1) {
      const entry = this.entries[index];
      if (!entry) continue;
      const definition = entry.read();
      if (definition.isDisabled) continue;
      const anywhere = entry.scope === ANY_HOTKEY_SCOPE;
      if (!anywhere && entry.scope !== active) continue;
      const pageLevel = anywhere || entry.scope === GLOBAL_HOTKEY_SCOPE;
      if (pageLevel && overlay && !definition.allowInOverlay) continue;
      if (editable && !definition.allowInEditable) continue;
      if (event.repeat && !definition.allowRepeat) continue;
      if (!matchesHotkey(event, entry.parsed, mac)) continue;
      if (definition.preventDefault ?? true) event.preventDefault();
      definition.handler(event);
      return;
    }
  };
}
