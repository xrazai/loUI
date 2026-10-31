/**
 * Terrazzo plugin that turns the DTCG sources in src/tokens into the committed outputs:
 *
 *   src/styles/tokens.css              CSS custom properties inside `@layer tokens`
 *   src/tokens/generated/tokens.ts     typed TokenName union + resolved values
 *   src/tokens/generated/tokens.json   flat list (name, cssVar, value, type, description)
 *
 * Value formatting for CSS is delegated to @terrazzo/plugin-css (see terrazzo.config.ts);
 * this plugin only orders, groups and wraps its output so the file is stable and readable.
 * Everything here must be deterministic (no timestamps, no absolute paths).
 */
import type { defineConfig } from '@terrazzo/cli';

type Plugin = NonNullable<NonNullable<Parameters<typeof defineConfig>[0]['plugins']>[number]>;
type BuildOptions = Parameters<NonNullable<Plugin['build']>>[0];
type Token = BuildOptions['tokens'][string];

export const CSS_PREFIX = '--ds-';
const EXT = 'com.loui-ds';

/** Top-level groups whose name is not part of the CSS variable (`color.bg` becomes `--ds-bg`). */
const HIDDEN_GROUPS = new Set(['color', 'size', 'motion']);

/** `color.line-control` -> `--ds-line-control`, `space.4` -> `--ds-space-4`. */
export function cssVarName(id: string): string {
  const parts = id.split('.');
  const first = parts[0];
  if (parts.length > 1 && first !== undefined && HIDDEN_GROUPS.has(first)) parts.shift();
  return CSS_PREFIX + parts.join('-');
}

interface Mix {
  color: string;
  percent: number;
}

function mixOf(token: Token): Mix | undefined {
  const ext = token.$extensions?.[EXT] as { mix?: Mix } | undefined;
  return ext?.mix;
}

/** Soft/line/ring tokens are `color-mix` of a base token over transparent in CSS. */
export function mixCss(token: Token): string | undefined {
  const mix = mixOf(token);
  if (!mix) return undefined;
  const base = `color-mix(in oklab, var(${cssVarName(mix.color)}) ${String(mix.percent)}%, transparent)`;
  if (token.$type === 'color') return base;
  if (token.$type === 'shadow') {
    const s = (token.$value as { offsetX: Dim; offsetY: Dim; blur: Dim; spread: Dim }[])[0];
    if (!s) return undefined;
    return `${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${base}`;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Resolved value formatting (flat JSON, TS map)
// ---------------------------------------------------------------------------

interface Dim {
  value: number;
  unit: string;
}
interface Color {
  components: number[];
  alpha?: number;
}

function dim(d: Dim): string {
  return `${String(d.value)}${d.value === 0 ? 'px' : d.unit}`;
}

const hex2 = (n: number) =>
  Math.round(n * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

function color(c: Color): string {
  const [r = 0, g = 0, b = 0] = c.components;
  const alpha = c.alpha ?? 1;
  if (alpha >= 1) return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  const ch = (n: number) => String(Math.round(n * 255));
  return `rgba(${ch(r)}, ${ch(g)}, ${ch(b)}, ${String(alpha)})`;
}

type Resolved = string | number | Record<string, string | number>;

function resolve(token: Token): Resolved {
  const v = token.$value as unknown;
  switch (token.$type) {
    case 'color':
      return color(v as Color);
    case 'dimension':
    case 'duration':
      return dim(v as Dim);
    case 'number':
    case 'fontWeight':
      return v as number;
    case 'fontFamily':
      return (v as string[]).map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
    case 'cubicBezier':
      return `cubic-bezier(${(v as number[]).join(', ')})`;
    case 'shadow': {
      const s = (v as { color: Color; offsetX: Dim; offsetY: Dim; blur: Dim; spread: Dim }[])[0];
      if (!s) return '';
      return `${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${color(s.color)}`;
    }
    case 'typography': {
      const t = v as {
        fontFamily: string[];
        fontSize: Dim;
        fontWeight: number;
        letterSpacing: Dim;
        lineHeight: number;
      };
      return {
        fontFamily: t.fontFamily.map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', '),
        fontSize: dim(t.fontSize),
        fontWeight: t.fontWeight,
        letterSpacing: dim(t.letterSpacing),
        lineHeight: t.lineHeight,
      };
    }
    default:
      throw new Error(
        `tokens plugin: unsupported $type "${(token as { $type: string }).$type}" on ${token.id}`,
      );
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export interface FlatToken {
  /** DTCG id, e.g. `color.line-control`. */
  name: string;
  /** CSS custom property, or null when the token is not emitted to CSS (typography composites). */
  cssVar: string | null;
  /** Fully resolved value (aliases followed). Alpha colors are `rgba()`. */
  value: Resolved;
  /** Value exactly as written in tokens.css (aliases are `var()`, soft tokens `color-mix()`), or null. */
  cssValue: string | null;
  type: string;
  /** `primitive` and `semantic` for colors, `core` for everything else. */
  tier: 'primitive' | 'semantic' | 'core';
  /** Id of the token this one aliases, if any. */
  aliasOf: string | null;
  description: string;
}

function tierOf(token: Token): FlatToken['tier'] {
  const file = token.source.filename ?? '';
  if (file.includes('primitive.')) return 'primitive';
  if (file.includes('semantic.')) return 'semantic';
  return 'core';
}

export default function loui(): Plugin {
  return {
    name: 'loui-ds-outputs',
    enforce: 'post',
    build({ tokens, getTransforms, outputFile, context }) {
      const cssById = new Map<string, string>();
      for (const t of getTransforms({ format: 'css' })) {
        if (t.type === 'SINGLE_VALUE') cssById.set(t.token.id, t.value);
      }

      const flat: FlatToken[] = [];
      for (const token of Object.values(tokens)) {
        const description = token.$description ?? '';
        if (!description) {
          context.logger.error({
            group: 'plugin',
            label: 'loui-ds-outputs',
            message: `${token.id} has no $description (required: what it is for and what not to use it for).`,
          });
        }
        // A mix token must repeat its base color so the resolved value cannot drift.
        const mix = mixOf(token);
        if (mix && token.$type === 'color') {
          const base = tokens[mix.color];
          const a = (token.$value as Color).components;
          const b = (base?.$value as Color | undefined)?.components;
          if (!b || a.some((n, i) => Math.abs(n - (b[i] ?? 0)) > 1e-4)) {
            context.logger.error({
              group: 'plugin',
              label: 'loui-ds-outputs',
              message: `${token.id}: components differ from its mix base ${mix.color}.`,
            });
          }
        }
        const css = cssById.get(token.id);
        flat.push({
          name: token.id,
          cssVar: css === undefined ? null : cssVarName(token.id),
          value: resolve(token),
          cssValue: css ?? null,
          type: token.$type,
          tier: tierOf(token),
          aliasOf: token.aliasOf ?? null,
          description,
        });
      }

      // ---- tokens.css ------------------------------------------------------
      const lines: string[] = [];
      let group = '';
      for (const t of flat) {
        if (t.cssVar === null || t.cssValue === null) continue;
        const g = t.name.split('.')[0] ?? '';
        const label = t.tier === 'core' ? g : `${g} (${t.tier})`;
        if (label !== group) {
          if (group !== '') lines.push('');
          lines.push(`    /* ${label} */`);
          group = label;
        }
        lines.push(`    ${t.cssVar}: ${t.cssValue};`);
      }
      const css = [
        '/*',
        ' * Generated by Terrazzo from src/tokens/*.json. DO NOT EDIT.',
        ' * Run `pnpm tokens:build` to regenerate; `pnpm tokens:check` fails when this file is stale.',
        ' */',
        '@layer tokens {',
        '  :root {',
        ...lines,
        '  }',
        '}',
        '',
      ].join('\n');
      outputFile('styles/tokens.css', css);

      // ---- tokens.json -----------------------------------------------------
      outputFile('tokens/generated/tokens.json', JSON.stringify(flat, null, 2) + '\n');

      // ---- tokens.ts -------------------------------------------------------
      const q = (s: string) => `'${s.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
      const names = flat.map((t) => `  | ${q(t.name)}`).join('\n');
      const vars = flat
        .filter((t) => t.cssVar !== null)
        .map((t) => `  | ${q(t.cssVar ?? '')}`)
        .join('\n');
      const entries = flat
        .map(
          (t) =>
            `  ${q(t.name)}: { cssVar: ${t.cssVar === null ? 'null' : q(t.cssVar)}, type: ${q(t.type)}, value: ${typeof t.value === 'string' ? q(t.value) : JSON.stringify(t.value)} },`,
        )
        .join('\n');
      const ts = [
        '/* Generated by Terrazzo from src/tokens/*.json. DO NOT EDIT. Run `pnpm tokens:build`. */',
        '',
        '/** Every design token id (DTCG path). */',
        `export type TokenName =\n${names};`,
        '',
        '/** Every emitted CSS custom property. */',
        `export type TokenCssVar =\n${vars};`,
        '',
        'export interface TokenEntry {',
        '  /** CSS custom property, or null when the token is not emitted to CSS. */',
        '  readonly cssVar: TokenCssVar | null;',
        '  readonly type: string;',
        '  /** Fully resolved value (aliases followed). */',
        '  readonly value: string | number | Readonly<Record<string, string | number>>;',
        '}',
        '',
        '/** Resolved values keyed by token id. */',
        `export const tokenValues = {\n${entries}\n} as const satisfies Record<TokenName, TokenEntry>;`,
        '',
        '/** `var(--ds-*)` reference for a token that is emitted to CSS. */',
        'export function tokenVar(name: TokenName): string {',
        '  const { cssVar } = tokenValues[name];',
        '  if (cssVar === null) throw new Error(`Token ${name} has no CSS variable.`);',
        '  return `var(${cssVar})`;',
        '}',
        '',
      ].join('\n');
      outputFile('tokens/generated/tokens.ts', ts);
    },
  };
}
