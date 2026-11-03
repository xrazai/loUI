// @vitest-environment node
/**
 * Round trip between the CSS build output and the Tokens Studio export (TOK-011).
 *
 * `src/styles/tokens.css` is what ships; `tokens-studio/tokens.json` is what Figma imports. Both
 * are generated from the same DTCG sources, but a bug in either generator (or a hand edit)
 * would let them drift. This test reads both committed files, resolves every value independently
 * of the generators (aliases followed, colors normalized) and requires a one-to-one match.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildStudioTokens, serialize } from './studio';
import type { FlatTokenLike, StudioToken } from './studio';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (file: string) => readFileSync(root + file, 'utf8');

// ---- CSS side --------------------------------------------------------------------------------

const cssVars = new Map<string, string>();
for (const m of read('src/styles/tokens.css').matchAll(/^\s*(--ds-[\w-]+):\s*(.+);\s*$/gm)) {
  cssVars.set(m[1] ?? '', (m[2] ?? '').trim());
}

// ---- Studio side -----------------------------------------------------------------------------

interface StudioEntry {
  name: string;
  token: StudioToken;
}
const studioFile = JSON.parse(read('tokens-studio/tokens.json')) as Record<string, unknown>;
const studioTokens = new Map<string, StudioEntry>();
function walk(node: Record<string, unknown>, trail: string[]): void {
  for (const [key, child] of Object.entries(node)) {
    if (typeof child !== 'object' || child === null) continue;
    const record = child as Record<string, unknown>;
    if ('value' in record && 'type' in record) {
      const name = [...trail, key].join('.');
      studioTokens.set(name, { name, token: record as unknown as StudioToken });
    } else walk(record, [...trail, key]);
  }
}
for (const set of ['primitive', 'semantic', 'core']) {
  walk(studioFile[set] as Record<string, unknown>, []);
}
const studioByVar = new Map<string, StudioEntry>();
for (const entry of studioTokens.values()) {
  const cssVar = entry.token.$extensions['com.loui-ds'].cssVar;
  if (cssVar) studioByVar.set(cssVar, entry);
}

// ---- Canonical forms (shared vocabulary of both sides) ---------------------------------------

function color(value: string): string {
  const v = value.trim().toLowerCase();
  let rgba: number[] | null = null;
  const hex = /^#([0-9a-f]{3,8})$/.exec(v)?.[1];
  if (hex) {
    const full = hex.length <= 4 ? hex.replace(/./g, '$&$&') : hex;
    const n = (i: number) => Number.parseInt(full.slice(i, i + 2), 16);
    rgba = [n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1];
  }
  const fn = /^rgba?\(([^)]+)\)$/.exec(v)?.[1];
  if (fn) {
    const p = fn.split(',').map((s) => Number(s.trim()));
    rgba = [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1];
  }
  if (!rgba) throw new Error(`unparseable color: ${value}`);
  return `rgba(${String(rgba[0])},${String(rgba[1])},${String(rgba[2])},${rgba[3]?.toFixed(2)})`;
}

function dimension(value: string | number): string {
  const text = String(value).trim();
  const m = /^(-?[\d.]+)([a-z%]*)$/.exec(text);
  if (!m) return text;
  return Number(m[1]) === 0 ? '0' : `${String(Number(m[1]))}${m[2] ?? ''}`;
}

function families(value: string): string {
  return value
    .split(',')
    .map((f) => f.trim().replaceAll('"', '').replaceAll("'", ''))
    .join('|');
}

interface Shadow {
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
}
function shadow(s: Shadow): string {
  return [s.x, s.y, s.blur, s.spread].map(dimension).join(' ') + ' ' + s.color;
}

// ---- Resolution ------------------------------------------------------------------------------

/** Canonical value of a CSS custom property, following `var()` chains and `color-mix`. */
function cssCanonical(name: string, type: string): string {
  const raw = cssVars.get(name);
  if (raw === undefined) throw new Error(`missing CSS variable ${name}`);
  return cssValue(raw, type);
}

function cssColorPart(raw: string): string {
  const mix = /^color-mix\(in oklab, var\((--[\w-]+)\) ([\d.]+)%, transparent\)$/.exec(raw);
  if (mix) return `mix(${cssCanonical(mix[1] ?? '', 'color')},${String(Number(mix[2]) / 100)})`;
  const alias = /^var\((--[\w-]+)\)$/.exec(raw);
  if (alias) return cssCanonical(alias[1] ?? '', 'color');
  return color(raw);
}

function cssValue(raw: string, type: string): string {
  const alias = /^var\((--[\w-]+)\)$/.exec(raw);
  if (alias) return cssCanonical(alias[1] ?? '', type);
  switch (type) {
    case 'color':
      return cssColorPart(raw);
    case 'boxShadow': {
      // `x y blur [spread] <color>`; the color may be a hex, rgba() or color-mix().
      const m = /^(\S+) (\S+) (\S+) (?:(\S+) )?(.+)$/.exec(raw);
      if (!m) throw new Error(`unparseable shadow ${raw}`);
      return shadow({
        x: m[1] ?? '',
        y: m[2] ?? '',
        blur: m[3] ?? '',
        spread: m[4] ?? '0',
        color: cssColorPart(m[5] ?? ''),
      });
    }
    case 'fontFamilies':
      return families(raw);
    case 'dimension':
    case 'spacing':
    case 'borderRadius':
    case 'fontSizes':
    case 'sizing':
      return dimension(raw);
    default:
      return raw.trim();
  }
}

/** Canonical value of a Tokens Studio token, following `{alias}` references and `modify`. */
function studioCanonical(name: string): string {
  const entry = studioTokens.get(name);
  if (!entry) throw new Error(`missing Tokens Studio token ${name}`);
  const { token } = entry;
  const { value, type } = token;
  const scalar = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const modify = token.$extensions['studio.tokens']?.modify;

  if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) {
    const target = studioCanonical(value.slice(1, -1));
    if (modify) return `mix(${target},${String(Number(modify.value))})`;
    return target;
  }
  switch (type) {
    case 'color':
      return color(scalar);
    case 'boxShadow': {
      const [s] = value as unknown as Shadow[];
      if (!s) throw new Error(`${name}: empty shadow`);
      const mix = token.$extensions['com.loui-ds'].mix;
      // A mixed shadow keeps the resolved color; the mix extension carries the base and percent.
      const col = mix
        ? `mix(${studioCanonical(mix.color)},${String(mix.percent / 100)})`
        : color(s.color);
      return shadow({ ...s, color: col });
    }
    case 'fontFamilies':
      return families(scalar);
    case 'dimension':
    case 'spacing':
    case 'borderRadius':
    case 'fontSizes':
    case 'sizing':
      return dimension(scalar);
    default:
      return scalar.trim();
  }
}

// ---- Tests -----------------------------------------------------------------------------------

describe('Tokens Studio export round trip (TOK-011)', () => {
  it('has a CSS variable for every Tokens Studio token that declares one, and vice versa', () => {
    const studioVars = [...studioByVar.keys()].sort();
    const cssNames = [...cssVars.keys()].sort();
    expect(studioVars.filter((v) => !cssVars.has(v))).toEqual([]);
    expect(cssNames.filter((v) => !studioByVar.has(v))).toEqual([]);
    expect(studioVars).toEqual(cssNames);
    expect(cssNames.length).toBeGreaterThan(300);
  });

  it('resolves every CSS variable to the same value as its Tokens Studio counterpart', () => {
    const mismatches: string[] = [];
    for (const [cssVar, entry] of studioByVar) {
      const css = cssCanonical(cssVar, entry.token.type);
      const studio = studioCanonical(entry.name);
      if (css !== studio) mismatches.push(`${cssVar} (${entry.name}): css=${css} studio=${studio}`);
    }
    expect(mismatches).toEqual([]);
  });

  it('keeps aliases as aliases on both sides', () => {
    const problems: string[] = [];
    for (const [cssVar, entry] of studioByVar) {
      const alias = /^var\((--[\w-]+)\)$/.exec(cssVars.get(cssVar) ?? '')?.[1];
      const value = entry.token.value;
      const studioAlias =
        typeof value === 'string' &&
        /^\{[^}]+\}$/.test(value) &&
        !entry.token.$extensions['studio.tokens']
          ? value.slice(1, -1)
          : undefined;
      if ((alias === undefined) !== (studioAlias === undefined)) {
        problems.push(`${cssVar}: alias in only one of css / studio`);
      } else if (alias !== undefined && studioAlias !== undefined) {
        const target = studioTokens.get(studioAlias)?.token.$extensions['com.loui-ds'].cssVar;
        if (target !== alias)
          problems.push(`${cssVar}: css -> ${alias}, studio -> ${String(target)}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('only leaves composite typography tokens without a CSS variable', () => {
    const without = [...studioTokens.values()].filter(
      (e) => e.token.$extensions['com.loui-ds'].cssVar === null,
    );
    expect(without.length).toBeGreaterThan(0);
    expect(without.every((e) => e.token.type === 'typography')).toBe(true);
  });

  it('references only tokens that exist', () => {
    const missing: string[] = [];
    for (const entry of studioTokens.values()) {
      const value = entry.token.value;
      if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) {
        if (!studioTokens.has(value.slice(1, -1))) missing.push(`${entry.name} -> ${value}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('is current: the committed export equals a fresh build from the generated token list', () => {
    const flat = JSON.parse(read('src/tokens/generated/tokens.json')) as FlatTokenLike[];
    expect(read('tokens-studio/tokens.json')).toBe(serialize(buildStudioTokens(flat)));
  });

  it('detects drift: a changed value is reported', () => {
    // Guards the comparison itself: perturb one value and the resolver must disagree with CSS.
    const entry = studioByVar.get('--ds-accent');
    expect(entry).toBeDefined();
    const original = entry?.token.value;
    if (!entry) return;
    entry.token.value = '#000000';
    try {
      expect(studioCanonical(entry.name)).not.toBe(cssCanonical('--ds-accent', 'color'));
    } finally {
      if (original !== undefined) entry.token.value = original;
    }
  });
});
