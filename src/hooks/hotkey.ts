import { reportInvalid } from '../utils/env';

/** The parts of a `KeyboardEvent` that hotkey matching reads. */
export type HotkeyEventLike = Pick<
  KeyboardEvent,
  'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'
>;

export interface ParsedHotkey {
  /** Lowercased `KeyboardEvent.key` (`' '` for Space). */
  key: string;
  /** `Mod`: Command on macOS, Control elsewhere. */
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  space: ' ',
  spacebar: ' ',
  plus: '+',
  return: 'enter',
  del: 'delete',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
};

/** Splits a combo into its key (after the last `+`, except that `+` itself is written `Mod++` or `+`) and the modifiers before it. */
function splitCombo(combo: string): { keyText: string; modifierText: string } {
  if (combo === '+') return { keyText: '+', modifierText: '' };
  if (combo.endsWith('++')) return { keyText: '+', modifierText: combo.slice(0, -2) };
  const split = combo.lastIndexOf('+');
  return {
    keyText: combo.slice(split + 1),
    modifierText: split === -1 ? '' : combo.slice(0, split),
  };
}

/**
 * Parses a combo such as `Mod+K`, `Shift+/`, `Alt+N`, `Escape` or `Mod+Enter`.
 * Modifiers: `Mod` (Command on macOS, Control elsewhere), `Ctrl`, `Meta`/`Cmd`,
 * `Alt`/`Option`, `Shift`. Exactly one non-modifier key, last. Case-insensitive.
 * Returns `undefined` (and throws in development) for malformed combos.
 */
export function parseHotkey(combo: string): ParsedHotkey | undefined {
  const { keyText, modifierText } = splitCombo(combo);

  const key = keyText.trim().toLowerCase();
  if (key === '') {
    reportInvalid(`useHotkey: combo "${combo}" has no key.`);
    return undefined;
  }
  const parsed: ParsedHotkey = {
    key: KEY_ALIASES[key] ?? key,
    mod: false,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
  };
  for (const raw of modifierText === '' ? [] : modifierText.split('+')) {
    switch (raw.trim().toLowerCase()) {
      case 'mod':
        parsed.mod = true;
        break;
      case 'ctrl':
      case 'control':
        parsed.ctrl = true;
        break;
      case 'meta':
      case 'cmd':
      case 'command':
        parsed.meta = true;
        break;
      case 'alt':
      case 'option':
        parsed.alt = true;
        break;
      case 'shift':
        parsed.shift = true;
        break;
      default:
        reportInvalid(`useHotkey: unknown modifier "${raw}" in combo "${combo}".`);
        return undefined;
    }
  }
  return parsed;
}

/** True on macOS and iOS-family platforms. SSR-safe: `false` without `navigator`. */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform ?? navigator.platform);
}

const ALPHANUMERIC = /^[a-z0-9]$/;

/**
 * Whether a key event triggers the parsed combo. Modifiers must match exactly
 * (so `K` does not fire on `Mod+K`). Shift is not compared for punctuation keys
 * such as `?` or `/`, whose `key` already depends on Shift and layout.
 */
export function matchesHotkey(event: HotkeyEventLike, hotkey: ParsedHotkey, mac: boolean): boolean {
  const wantMeta = hotkey.meta || (hotkey.mod && mac);
  const wantCtrl = hotkey.ctrl || (hotkey.mod && !mac);
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== hotkey.alt)
    return false;

  const alphanumeric = ALPHANUMERIC.test(hotkey.key);
  if ((alphanumeric || hotkey.key.length > 1) && event.shiftKey !== hotkey.shift) return false;
  if (!alphanumeric && hotkey.key.length === 1 && hotkey.shift && !event.shiftKey) return false;

  if (event.key.toLowerCase() === hotkey.key) return true;
  // With Alt or Shift the produced character depends on the layout (Option+N is a dead key on macOS),
  // so fall back to the physical key for letters and digits.
  if (alphanumeric && (hotkey.alt || hotkey.shift)) {
    return (
      event.code ===
      (/\d/.test(hotkey.key) ? `Digit${hotkey.key}` : `Key${hotkey.key.toUpperCase()}`)
    );
  }
  return false;
}

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

/** True for elements where typing produces text: text-like inputs, textareas, selects and contenteditable. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  return target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(target.type);
}

/**
 * The parts of a combo in display order, ready for `Kbd`'s `keys`: `'Mod+K'` gives
 * `['Mod', 'K']`, `'Shift+/'` gives `['Shift', '/']`. Returns `[]` for a malformed combo (never throws).
 */
export function hotkeyKeys(combo: string): string[] {
  const { keyText, modifierText } = splitCombo(combo);
  const key = keyText.trim();
  if (key === '') return [];
  const modifiers = modifierText === '' ? [] : modifierText.split('+').map((part) => part.trim());
  return [...modifiers, key];
}

/**
 * A canonical string for a parsed hotkey on the given platform, so that `Mod+K` and `Ctrl+K`
 * compare equal on Windows and Linux. Used to detect conflicts.
 */
export function canonicalHotkey(hotkey: ParsedHotkey, mac: boolean): string {
  const meta = hotkey.meta || (hotkey.mod && mac);
  const ctrl = hotkey.ctrl || (hotkey.mod && !mac);
  return [meta && 'meta', ctrl && 'ctrl', hotkey.alt && 'alt', hotkey.shift && 'shift', hotkey.key]
    .filter(Boolean)
    .join('+');
}
