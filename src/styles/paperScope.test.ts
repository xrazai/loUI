// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * TOK-012: `[data-theme="paper"]` remaps tokens, but a custom property that mixes or aliases a
 * remapped one (`--ds-success-soft: color-mix(... var(--ds-success) ...)`) is resolved at `:root`
 * and inherited as a value, so it keeps the dark-theme color inside the scope unless the paper
 * block declares it again. This test finds every such derived token and requires it there.
 */
const read = (name: string) => readFileSync(new URL(name, import.meta.url), 'utf8');
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const tokensCss = strip(read('./tokens.css'));
const baseCss = strip(read('./base.css'));

const rootDeclarations = new Map(
  [...tokensCss.matchAll(/(--ds-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1] ?? '', m[2] ?? '']),
);

const paperBlock = /\[data-theme='paper'\]\s*\{([\s\S]*?)\n {2}\}/.exec(baseCss)?.[1] ?? '';
const paperDeclared = new Set([...paperBlock.matchAll(/(--ds-[\w-]+):/g)].map((m) => m[1] ?? ''));

/** Remapped, or derived from a remapped token (transitively). */
function derivedFromPaper(): string[] {
  const affected = new Set(paperDeclared);
  const derived: string[] = [];
  let grew = true;
  while (grew) {
    grew = false;
    for (const [name, value] of rootDeclarations) {
      if (affected.has(name)) continue;
      const refs = [...value.matchAll(/var\((--ds-[\w-]+)/g)].map((m) => m[1] ?? '');
      if (refs.some((ref) => affected.has(ref))) {
        affected.add(name);
        derived.push(name);
        grew = true;
      }
    }
  }
  return derived;
}

/** Derived tokens deliberately left on their dark-theme value inside the paper scope. */
const NOT_REMAPPED = new Set<string>();

describe('paper scope (TOK-012)', () => {
  it('finds the paper block', () => {
    expect(paperDeclared.has('--ds-paper-ink') || paperDeclared.has('--ds-text')).toBe(true);
    expect(paperDeclared.has('--ds-danger')).toBe(true);
  });

  it('remaps the signal colors to their paper twins', () => {
    for (const signal of ['success', 'warning', 'danger']) {
      expect(paperBlock).toContain(`--ds-${signal}: var(--ds-paper-${signal});`);
    }
  });

  it('redeclares every token that derives from a remapped one', () => {
    const missing = derivedFromPaper().filter(
      (name) => !paperDeclared.has(name) && !NOT_REMAPPED.has(name),
    );
    expect(
      missing,
      `Add these to the [data-theme='paper'] block in base.css (or to NOT_REMAPPED with a reason):\n${missing.join('\n')}`,
    ).toEqual([]);
  });
});
