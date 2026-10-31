// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import tokens from '../tokens/generated/tokens.json';

/** TEST-011: every var(--ds-*) used in src/**\/*.css must exist (token or locally declared). */
const srcDir = fileURLToPath(new URL('..', import.meta.url));

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const files = cssFiles(srcDir).map((file) => ({
  file: file.slice(srcDir.length).replaceAll('\\', '/'),
  css: stripComments(readFileSync(file, 'utf8')),
}));

const tokenVars = new Set(tokens.flatMap((t) => (t.cssVar === null ? [] : [t.cssVar])));
const declared = new Set(
  files.flatMap(({ css }) => [...css.matchAll(/(--ds-[\w-]+)\s*:/g)].map((m) => m[1] ?? '')),
);

describe('CSS custom properties (TEST-011)', () => {
  it('finds the foundation stylesheets', () => {
    const names = files.map((f) => f.file);
    expect(names).toEqual(
      expect.arrayContaining(['styles/index.css', 'styles/base.css', 'styles/tokens.css']),
    );
  });

  it.each(files.map((f) => [f.file, f.css] as const))(
    '%s uses only defined --ds-* variables',
    (_file, css) => {
      const used = [...css.matchAll(/var\(\s*(--ds-[\w-]+)/g)].map((m) => m[1] ?? '');
      const dangling = used.filter((name) => !tokenVars.has(name) && !declared.has(name));
      expect(dangling, `Undefined variables: ${dangling.join(', ')}`).toEqual([]);
    },
  );

  it('flags a variable that is not a token', () => {
    expect(tokenVars.has('--ds-text')).toBe(true);
    expect(tokenVars.has('--ds-text-4')).toBe(false);
  });
});
