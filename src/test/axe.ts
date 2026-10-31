import axe from 'axe-core';
import type { AxeResults, RunOptions } from 'axe-core';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * React Aria's global live announcer (`<div data-live-announcer>` appended to `document.body`).
 * The library owns it and it is visually hidden. After a message is cleared it keeps a
 * `role="img"` node whose `aria-labelledby` target is gone, which axe reports as `role-img-alt`.
 * That node is not part of any component of this design system, so every axe run in this repo
 * skips it (the Storybook a11y addon does too, see `.storybook/preview.ts`). Revisit when React
 * Aria stops leaving the unnamed node behind.
 */
export const LIVE_ANNOUNCER_SELECTOR = '[data-live-announcer]';

function formatViolations(violations: AxeResults['violations']): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map(
          (node) =>
            `    - ${node.target.join(' ')}\n      ${(node.failureSummary ?? '').replaceAll('\n', '\n      ')}`,
        )
        .join('\n');
      return `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n  ${violation.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
}

/**
 * Runs axe-core against an element and throws a readable error listing every
 * violation. Never disable a rule globally; scoped exceptions need a comment
 * with the reason and a TODO ID (AGENTS.md section 10).
 */
/**
 * Waits for finite animations (overlay fade/slide-in) to finish, so axe never measures
 * mid-transition colors. Infinite animations (spinners, skeleton pulse) are ignored.
 */
async function settleAnimations(timeoutMs = 2000): Promise<void> {
  const finite = document
    .getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity);
  if (finite.length === 0) return;
  await Promise.race([
    Promise.allSettled(finite.map((animation) => animation.finished)),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

export async function expectNoA11yViolations(
  container: Element,
  options: RunOptions = {},
): Promise<void> {
  await settleAnimations();
  const context = container.querySelector(LIVE_ANNOUNCER_SELECTOR)
    ? { include: [container], exclude: [[LIVE_ANNOUNCER_SELECTOR]] }
    : container;
  const results = await axe.run(context, {
    runOnly: { type: 'tag', values: WCAG_TAGS },
    ...options,
  });
  if (results.violations.length > 0) {
    throw new Error(
      `Expected no accessibility violations, found ${String(results.violations.length)}:\n\n${formatViolations(results.violations)}`,
    );
  }
}
