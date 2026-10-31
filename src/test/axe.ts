import axe from 'axe-core';
import type { AxeResults, RunOptions } from 'axe-core';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

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
export async function expectNoA11yViolations(
  container: Element,
  options: RunOptions = {},
): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: WCAG_TAGS },
    ...options,
  });
  if (results.violations.length > 0) {
    throw new Error(
      `Expected no accessibility violations, found ${String(results.violations.length)}:\n\n${formatViolations(results.violations)}`,
    );
  }
}
