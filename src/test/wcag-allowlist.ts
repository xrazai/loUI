/**
 * Single allow-list for the cross-cutting WCAG 2.2 suites (TEST-014) and the forced-colors suite
 * (TOK-013). Every entry names the rule it relaxes, where, and why. Prefer fixing the component;
 * an entry is only for a documented exception (WCAG's own exceptions, or a layout that cannot
 * reflow by nature). Add a TODO ID when the exception is meant to be temporary.
 */

export type WcagRule =
  | 'target-size'
  | 'focus-not-obscured'
  | 'reflow'
  | 'text-spacing'
  | 'forced-colors-focus'
  | 'forced-colors-state';

export interface AllowEntry {
  rule: WcagRule;
  /** Storybook story id (exact) or a prefix ending in `*`, for example `components-datatable--*`. */
  story: string;
  /** Optional CSS selector narrowing the exception to matching elements (target-size only). */
  selector?: string;
  /** Why this is acceptable. Required. */
  reason: string;
}

export const WCAG_ALLOWLIST: AllowEntry[] = [
  {
    rule: 'reflow',
    story: '*',
    selector: 'table',
    reason:
      'WCAG 1.4.10 exempts content that needs two-dimensional layout, and data tables are named in the criterion. A DataTable keeps its columns and may scroll horizontally at 320 px.',
  },
  {
    rule: 'target-size',
    story: 'components-skiplink--*',
    selector: 'nav[aria-label="Primary"] a',
    reason:
      'Story scaffolding: plain unstyled anchors stand in for a page navigation so the skip link has something to bypass. They are not design-system components.',
  },
];

function matches(pattern: string, id: string): boolean {
  return pattern.endsWith('*') ? id.startsWith(pattern.slice(0, -1)) : pattern === id;
}

/** The entries that apply to a rule and story. */
export function allowedFor(rule: WcagRule, storyId: string): AllowEntry[] {
  return WCAG_ALLOWLIST.filter((entry) => entry.rule === rule && matches(entry.story, storyId));
}

/** True when the whole story is exempt from a rule (entry without a selector). */
export function isStoryAllowed(rule: WcagRule, storyId: string): boolean {
  return allowedFor(rule, storyId).some((entry) => entry.selector === undefined);
}
