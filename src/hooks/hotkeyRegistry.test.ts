import { afterEach, describe, expect, it, vi } from 'vitest';
import { HotkeyRegistry } from './hotkeyRegistry';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('HotkeyRegistry (no DOM)', () => {
  it('warns about a duplicate combo in development, once per combo and scope', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const registry = new HotkeyRegistry({ platform: 'other' });
    registry.register({ keys: 'Mod+K', handler: () => undefined });
    registry.register({ keys: 'Ctrl+K', handler: () => undefined });
    registry.register({ keys: 'ctrl+k', handler: () => undefined });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('"Ctrl+K"');
  });

  it('treats Mod+K and Ctrl+K as different combos on macOS', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const registry = new HotkeyRegistry({ platform: 'mac' });
    registry.register({ keys: 'Mod+K', handler: () => undefined });
    registry.register({ keys: 'Ctrl+K', handler: () => undefined });
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const registry = new HotkeyRegistry();
    registry.register({ keys: 'N', handler: () => undefined });
    registry.register({ keys: 'N', handler: () => undefined });
    expect(warn).not.toHaveBeenCalled();
  });

  it('ignores a malformed combo in production instead of throwing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const registry = new HotkeyRegistry();
    const unregister = registry.register({ keys: 'Mod+', handler: () => undefined });
    expect(registry.getSnapshot()).toHaveLength(0);
    expect(() => {
      unregister();
    }).not.toThrow();
  });

  it('throws on a malformed combo in development', () => {
    const registry = new HotkeyRegistry();
    expect(() => registry.register({ keys: 'Mod+', handler: () => undefined })).toThrow(
      /\[loui-ds\]/,
    );
  });

  it('keeps a scope stack and reports the top as active', () => {
    const registry = new HotkeyRegistry();
    expect(registry.getActiveScope()).toBe('global');
    const popA = registry.pushScope('a');
    const popB = registry.pushScope('b');
    expect(registry.getActiveScope()).toBe('b');
    popB();
    expect(registry.getActiveScope()).toBe('a');
    popA();
    expect(registry.getActiveScope()).toBe('global');
  });

  it('lists only described, enabled shortcuts and marks activity by scope', () => {
    const registry = new HotkeyRegistry();
    registry.register({ keys: 'N', handler: () => undefined, description: 'New order' });
    registry.register({ keys: 'M', handler: () => undefined });
    registry.register({
      keys: 'F9',
      handler: () => undefined,
      description: 'Mark as paid',
      scope: 'list',
    });
    registry.register({
      keys: 'F8',
      handler: () => undefined,
      description: 'Disabled',
      isDisabled: true,
    });
    expect(registry.getSnapshot().map((entry) => [entry.description, entry.isActive])).toEqual([
      ['New order', true],
      ['Mark as paid', false],
    ]);
    registry.pushScope('list');
    expect(registry.getSnapshot().map((entry) => [entry.description, entry.isActive])).toEqual([
      ['New order', false],
      ['Mark as paid', true],
    ]);
  });

  it('changes the snapshot identity only when something changes', () => {
    const registry = new HotkeyRegistry();
    const before = registry.getSnapshot();
    const unregister = registry.register({ keys: 'N', handler: () => undefined, description: 'x' });
    const during = registry.getSnapshot();
    expect(during).not.toBe(before);
    expect(registry.getSnapshot()).toBe(during);
    unregister();
    expect(registry.getSnapshot()).not.toBe(during);
  });

  it('notifies subscribers and stops after unsubscribe', () => {
    const registry = new HotkeyRegistry();
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);
    const unregister = registry.register({ keys: 'N', handler: () => undefined });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    unregister();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
