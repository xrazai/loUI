// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * TOK-014: `--ds-line-control` is the 3:1 boundary of a control on bg, surface and
 * surface-raised, but only 2.8:1 on `--ds-surface-hover`. A rule must therefore never draw a
 * `line-control` border on a `surface-hover` fill: a control brightens its border on hover
 * (`text-3`, or a component token such as `--ds-status-steps-marker-hover-border`) and keeps
 * its fill. The contrast pairs `hover-border-on-surface-*` guard the brightened border.
 *
 * This test catches the simple regression, both declarations in one rule. Controls that sit
 * inside a hovered parent are covered by component tests (StatusSteps).
 */

const root = fileURLToPath(new URL('..', import.meta.url));

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/** Rules whose body has a surface-hover background and a line-control border. */
function findConflicts(css: string): string[] {
  const conflicts: string[] = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (match[1] ?? '').trim();
    const body = match[2] ?? '';
    const fill = /background(?:-color)?\s*:[^;]*var\(--ds-surface-hover\)/.test(body);
    const border = /border(?:-[a-z-]+)?\s*:[^;]*var\(--ds-line-control\)/.test(body);
    if (fill && border) conflicts.push(selector.replace(/\s+/g, ' '));
  }
  return conflicts;
}

describe('control boundaries on the hover surface (TOK-014)', () => {
  it('finds a conflicting rule', () => {
    const css =
      '.a:hover { background: var(--ds-surface-hover); border: 1px solid var(--ds-line-control); }';
    expect(findConflicts(css)).toEqual(['.a:hover']);
    expect(
      findConflicts('.a { background: var(--ds-bg); border: 1px solid var(--ds-line-control); }'),
    ).toEqual([]);
  });

  it('has no rule that draws a line-control border on surface-hover', () => {
    const files = ['components', 'patterns']
      .flatMap((folder) => walk(join(root, folder)))
      .filter((path) => path.endsWith('.module.css'));
    expect(files.length).toBeGreaterThan(60);
    const found = files.flatMap((path) =>
      findConflicts(readFileSync(path, 'utf8')).map(
        (selector) => `${relative(root, path).split(sep).join('/')}: ${selector}`,
      ),
    );
    expect(found).toEqual([]);
  });
});
