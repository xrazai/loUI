/**
 * Switches Chromium's `prefers-reduced-motion` emulation through the Chrome DevTools Protocol
 * (`Emulation.setEmulatedMedia`), like `setForcedColors`. The emulation is page scoped but
 * persists across the test files that page runs afterwards: always switch it off again in
 * `afterEach`/`afterAll`.
 */
import { cdp } from 'vitest/browser';

export async function setReducedMotion(active: boolean): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: active ? 'reduce' : '' }],
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches !== active) {
    throw new Error(`Reduced-motion emulation did not switch ${active ? 'on' : 'off'}.`);
  }
}
