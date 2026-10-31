import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isDev, reportInvalid } from './env';
import { resetDeprecationWarnings, warnDeprecated } from './meta';

function noop() {
  // swallow console output during the test
}

describe('warnDeprecated', () => {
  beforeEach(() => {
    resetDeprecationWarnings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('warns once per name in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    warnDeprecated('OldButton', 'Use Button instead.');
    warnDeprecated('OldButton', 'Use Button instead.');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('[loui-ds] OldButton is deprecated. Use Button instead.');
  });

  it('warns separately for different names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    warnDeprecated('A', 'x');
    warnDeprecated('B', 'x');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('is a no-op in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    warnDeprecated('OldButton', 'Use Button instead.');
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not consume the once-only budget while in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    warnDeprecated('OldButton', 'x');
    vi.unstubAllEnvs();
    warnDeprecated('OldButton', 'x');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('isDev / reportInvalid', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is true under test and false when NODE_ENV is production', () => {
    expect(isDev()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(isDev()).toBe(false);
  });

  it('reportInvalid throws in development and is silent in production', () => {
    expect(() => {
      reportInvalid('bad');
    }).toThrow('[loui-ds] bad');
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => {
      reportInvalid('bad');
    }).not.toThrow();
  });

  it('in production, utilities fall back instead of throwing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { formatCurrency } = await import('./currency');
    const { formatDate, daysBetween } = await import('./date');
    const { relativeLuminance } = await import('./color');
    expect(formatCurrency(12.6, 'USD', 'en-US')).toBe('$0.13');
    expect(formatDate('nope', 'en-US')).toBe('nope');
    expect(daysBetween('nope', '2026-01-01')).toBeNaN();
    expect(relativeLuminance('nope')).toBe(0);
  });
});
