import { expect } from 'vitest';

/**
 * Waits until React Aria has marked an element inside `root` as hovered (`data-hovered`).
 * RAC sets the attribute after it handles the pointer event, so reading styles right after
 * `userEvent.hover` can still see the resting state (TEST-021). Poll for the attribute first,
 * then assert the styles with `expect.poll` too, because colors fade over `--ds-duration`.
 */
export async function expectHovered(root: Element): Promise<void> {
  await expect.poll(() => root.querySelector('[data-hovered]') !== null).toBe(true);
}
