/** Identifiers of the keys that have a symbol, an abbreviation or a spoken name. */
export type KbdKeyId =
  | 'command'
  | 'control'
  | 'shift'
  | 'alt'
  | 'enter'
  | 'escape'
  | 'tab'
  | 'backspace'
  | 'delete'
  | 'space'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'home'
  | 'end'
  | 'pageUp'
  | 'pageDown';

/** Case-insensitive names accepted in `keys`. `mod` is resolved per platform. */
const ALIASES: Readonly<Record<string, KbdKeyId | 'mod'>> = {
  mod: 'mod',
  cmd: 'command',
  command: 'command',
  meta: 'command',
  ctrl: 'control',
  control: 'control',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  enter: 'enter',
  return: 'enter',
  esc: 'escape',
  escape: 'escape',
  tab: 'tab',
  backspace: 'backspace',
  delete: 'delete',
  del: 'delete',
  space: 'space',
  up: 'up',
  arrowup: 'up',
  down: 'down',
  arrowdown: 'down',
  left: 'left',
  arrowleft: 'left',
  right: 'right',
  arrowright: 'right',
  home: 'home',
  end: 'end',
  pageup: 'pageUp',
  pagedown: 'pageDown',
};

/** Symbols used on every platform. */
const GLYPHS: Readonly<Partial<Record<KbdKeyId, string>>> = {
  command: '⌘',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

/** Symbols used only on Apple platforms, where the keycaps carry them. */
const APPLE_GLYPHS: Readonly<Partial<Record<KbdKeyId, string>>> = {
  control: '⌃',
  shift: '⇧',
  alt: '⌥',
  enter: '↵',
  escape: '⎋',
  tab: '⇥',
  backspace: '⌫',
  delete: '⌦',
};

export type ResolvedKey =
  { kind: 'named'; id: KbdKeyId; glyph: string | undefined } | { kind: 'literal'; text: string };

/** Turns a name from `keys` into a named key (resolving `Mod`) or a literal such as `K`. */
export function resolveKey(raw: string, apple: boolean): ResolvedKey {
  const alias = ALIASES[raw.toLowerCase()];
  if (alias === undefined) return { kind: 'literal', text: raw };
  const id: KbdKeyId = alias === 'mod' ? (apple ? 'command' : 'control') : alias;
  return { kind: 'named', id, glyph: GLYPHS[id] ?? (apple ? APPLE_GLYPHS[id] : undefined) };
}

const ARIA_KEYS: Readonly<Record<KbdKeyId, string>> = {
  command: 'Meta',
  control: 'Control',
  shift: 'Shift',
  alt: 'Alt',
  enter: 'Enter',
  escape: 'Escape',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  space: 'Space',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageUp: 'PageUp',
  pageDown: 'PageDown',
};

/** The `aria-keyshortcuts` value for one shortcut: `['Mod', 'K']` gives `Control+K` (`Meta+K` on Apple). */
export function ariaKeyShortcut(keys: readonly string[], apple: boolean): string {
  return keys
    .map((raw) => {
      const key = resolveKey(raw, apple);
      return key.kind === 'named' ? ARIA_KEYS[key.id] : key.text.toUpperCase();
    })
    .join('+');
}
