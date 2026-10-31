import axe from 'axe-core';
import { expect } from 'vitest';
import { expectNoA11yViolations } from '../test/axe';

export interface SettledOptions {
  /**
   * CSS selectors axe must skip. A scoped exception: say why at the call site and name the
   * bug that justifies it (AGENTS.md section 10).
   */
  exclude?: readonly string[];
}

/**
 * Axe reads computed colors, so it must not run while an overlay or toast is still fading in
 * (blended colors fail contrast). Wait for the animations to finish, then check every top-level
 * node of the page (the recipe, its portals and the toast region).
 *
 * Skipped: React Aria's global live announcer (`data-live-announcer`). It is owned by the
 * library, visually hidden, and after a message is cleared it keeps a `role="img"` node whose
 * `aria-labelledby` target is gone, which axe reports as `role-img-alt`. It is not part of any
 * recipe; the finding is in the report to the PM.
 */
export async function expectNoViolationsOnceSettled({
  exclude = [],
}: SettledOptions = {}): Promise<void> {
  await expect.poll(() => document.getAnimations().length).toBe(0);
  for (const node of document.body.children) {
    if (node.hasAttribute('data-live-announcer')) continue;
    if (exclude.length === 0) {
      await expectNoA11yViolations(node);
      continue;
    }
    const results = await axe.run(
      { include: [node], exclude: exclude.map((selector) => [selector]) },
      {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      },
    );
    const found = results.violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((n) => `${n.target.join(' ')} ${n.failureSummary ?? ''}`).join('; ')}`,
    );
    expect(found).toEqual([]);
  }
}
