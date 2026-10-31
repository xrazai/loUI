import { describe, expect, it } from 'vitest';
import { canonicalHotkey, hotkeyKeys, matchesHotkey, parseHotkey } from './hotkey';
import type { HotkeyEventLike } from './hotkey';

function event(init: Partial<HotkeyEventLike>): HotkeyEventLike {
  return {
    key: '',
    code: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...init,
  };
}

function parse(combo: string) {
  const parsed = parseHotkey(combo);
  if (!parsed) throw new Error(`could not parse ${combo}`);
  return parsed;
}

describe('parseHotkey', () => {
  it('parses a bare key', () => {
    expect(parse('k')).toEqual({
      key: 'k',
      mod: false,
      ctrl: false,
      meta: false,
      alt: false,
      shift: false,
    });
    expect(parse('Escape').key).toBe('escape');
  });

  it('parses modifiers in any order and case', () => {
    expect(parse('Shift+Mod+K')).toMatchObject({ key: 'k', mod: true, shift: true });
    expect(parse('ctrl+ALT+n')).toMatchObject({ key: 'n', ctrl: true, alt: true });
    expect(parse('Cmd+S')).toMatchObject({ key: 's', meta: true });
    expect(parse('Option+Control+x')).toMatchObject({ alt: true, ctrl: true });
  });

  it('understands key aliases', () => {
    expect(parse('Esc').key).toBe('escape');
    expect(parse('Mod+Space').key).toBe(' ');
    expect(parse('Up').key).toBe('arrowup');
    expect(parse('Return').key).toBe('enter');
    expect(parse('Del').key).toBe('delete');
  });

  it('parses the plus key', () => {
    expect(parse('+')).toMatchObject({ key: '+' });
    expect(parse('Mod++')).toMatchObject({ key: '+', mod: true });
    expect(parse('Mod+Shift++')).toMatchObject({ key: '+', mod: true, shift: true });
  });

  it('parses punctuation keys', () => {
    expect(parse('Shift+/')).toMatchObject({ key: '/', shift: true });
    expect(parse('?').key).toBe('?');
  });

  it('rejects malformed combos in development', () => {
    expect(() => parseHotkey('')).toThrow(/no key/);
    expect(() => parseHotkey('Mod+')).toThrow(/no key/);
    expect(() => parseHotkey('Hyper+K')).toThrow(/unknown modifier/);
    expect(() => parseHotkey('A+B')).toThrow(/unknown modifier/);
  });
});

describe('matchesHotkey', () => {
  it('maps Mod to Command on macOS and Control elsewhere', () => {
    const hotkey = parse('Mod+K');
    expect(matchesHotkey(event({ key: 'k', metaKey: true }), hotkey, true)).toBe(true);
    expect(matchesHotkey(event({ key: 'k', ctrlKey: true }), hotkey, true)).toBe(false);
    expect(matchesHotkey(event({ key: 'k', ctrlKey: true }), hotkey, false)).toBe(true);
    expect(matchesHotkey(event({ key: 'k', metaKey: true }), hotkey, false)).toBe(false);
  });

  it('requires an exact modifier match', () => {
    const plain = parse('K');
    expect(matchesHotkey(event({ key: 'k' }), plain, false)).toBe(true);
    expect(matchesHotkey(event({ key: 'k', ctrlKey: true }), plain, false)).toBe(false);
    expect(matchesHotkey(event({ key: 'k', altKey: true }), plain, false)).toBe(false);
    expect(matchesHotkey(event({ key: 'K', shiftKey: true }), plain, false)).toBe(false);
    const modK = parse('Mod+K');
    expect(matchesHotkey(event({ key: 'k', ctrlKey: true, shiftKey: true }), modK, false)).toBe(
      false,
    );
    expect(matchesHotkey(event({ key: 'k', ctrlKey: true, altKey: true }), modK, false)).toBe(
      false,
    );
  });

  it('is case-insensitive for letters', () => {
    expect(matchesHotkey(event({ key: 'K', shiftKey: true }), parse('Shift+K'), false)).toBe(true);
    expect(matchesHotkey(event({ key: 'K' }), parse('k'), false)).toBe(true); // Caps Lock
  });

  it('matches named keys', () => {
    expect(matchesHotkey(event({ key: 'Escape' }), parse('Esc'), false)).toBe(true);
    expect(matchesHotkey(event({ key: 'Enter', ctrlKey: true }), parse('Mod+Enter'), false)).toBe(
      true,
    );
    expect(matchesHotkey(event({ key: ' ' }), parse('Space'), false)).toBe(true);
    expect(matchesHotkey(event({ key: 'ArrowDown' }), parse('Down'), false)).toBe(true);
    expect(matchesHotkey(event({ key: 'ArrowDown', shiftKey: true }), parse('Down'), false)).toBe(
      false,
    );
  });

  it('ignores Shift for punctuation unless the combo asks for it', () => {
    expect(matchesHotkey(event({ key: '?', shiftKey: true }), parse('?'), false)).toBe(true);
    expect(matchesHotkey(event({ key: '/' }), parse('/'), false)).toBe(true);
    expect(matchesHotkey(event({ key: '/', shiftKey: true }), parse('/'), false)).toBe(true);
    expect(matchesHotkey(event({ key: '/' }), parse('Shift+/'), false)).toBe(false);
    expect(matchesHotkey(event({ key: '/', shiftKey: true }), parse('Shift+/'), false)).toBe(true);
  });

  it('falls back to the physical key when Alt or Shift change the character', () => {
    // macOS: Option+N produces a dead key / "~"; the code stays KeyN.
    expect(
      matchesHotkey(event({ key: 'Dead', code: 'KeyN', altKey: true }), parse('Alt+N'), true),
    ).toBe(true);
    expect(
      matchesHotkey(event({ key: '!', code: 'Digit1', shiftKey: true }), parse('Shift+1'), false),
    ).toBe(true);
    expect(
      matchesHotkey(event({ key: 'Dead', code: 'KeyM', altKey: true }), parse('Alt+N'), true),
    ).toBe(false);
  });

  it('does not use the physical key without Alt or Shift (non-QWERTY layouts)', () => {
    // AZERTY: the key at the QWERTY "Q" position types "a".
    expect(matchesHotkey(event({ key: 'a', code: 'KeyQ' }), parse('Q'), false)).toBe(false);
    expect(matchesHotkey(event({ key: 'a', code: 'KeyQ' }), parse('A'), false)).toBe(true);
  });

  it('supports explicit Ctrl and Meta on any platform', () => {
    expect(matchesHotkey(event({ key: 's', ctrlKey: true }), parse('Ctrl+S'), true)).toBe(true);
    expect(matchesHotkey(event({ key: 's', metaKey: true }), parse('Meta+S'), false)).toBe(true);
  });
});

describe('hotkeyKeys', () => {
  it('splits a combo into display parts for Kbd', () => {
    expect(hotkeyKeys('Mod+K')).toEqual(['Mod', 'K']);
    expect(hotkeyKeys('Mod+Shift+P')).toEqual(['Mod', 'Shift', 'P']);
    expect(hotkeyKeys('F2')).toEqual(['F2']);
    expect(hotkeyKeys('1')).toEqual(['1']);
    expect(hotkeyKeys('Shift+/')).toEqual(['Shift', '/']);
    expect(hotkeyKeys('Mod++')).toEqual(['Mod', '+']);
    expect(hotkeyKeys('+')).toEqual(['+']);
  });

  it('returns an empty list for a malformed combo instead of throwing', () => {
    expect(hotkeyKeys('')).toEqual([]);
    expect(hotkeyKeys('Mod+')).toEqual([]);
  });
});

describe('canonicalHotkey', () => {
  it('resolves Mod per platform so equivalent combos compare equal', () => {
    expect(canonicalHotkey(parse('Mod+K'), false)).toBe(canonicalHotkey(parse('Ctrl+K'), false));
    expect(canonicalHotkey(parse('Mod+K'), true)).toBe(canonicalHotkey(parse('Cmd+K'), true));
    expect(canonicalHotkey(parse('Mod+K'), true)).not.toBe(canonicalHotkey(parse('Ctrl+K'), true));
  });

  it('ignores case, aliases and modifier order', () => {
    expect(canonicalHotkey(parse('shift+ctrl+k'), false)).toBe(
      canonicalHotkey(parse('Ctrl+Shift+K'), false),
    );
    expect(canonicalHotkey(parse('Esc'), false)).toBe(canonicalHotkey(parse('Escape'), false));
  });

  it('tells plain keys from modified ones', () => {
    expect(canonicalHotkey(parse('N'), false)).not.toBe(canonicalHotkey(parse('Shift+N'), false));
    expect(canonicalHotkey(parse('1'), false)).not.toBe(canonicalHotkey(parse('2'), false));
  });
});
