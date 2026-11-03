/**
 * Tokens Studio export (TOK-011).
 *
 * Turns the flat token list that Terrazzo writes (`src/tokens/generated/tokens.json`, itself built
 * from the DTCG sources in `src/tokens/`) into a single-file Tokens Studio for Figma token set:
 *
 *   tokens-studio/tokens.json
 *
 * Aliases stay aliases (`{color.gray.0}`), `*-soft` colors keep their base color and carry the
 * opacity as a `modify` alpha extension, and every token keeps its CSS variable under
 * `$extensions["com.loui-ds"].cssVar` so Figma and code can be matched by name. The code is the
 * source of truth: this file is generated, never edited. The round-trip test
 * (`scripts/tokens/studio.test.ts`) compares it with `src/styles/tokens.css`.
 *
 *   pnpm tokens:studio          write the file
 *   pnpm tokens:studio:check    fail when the committed file is stale (part of `pnpm tokens:check`)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Subset of `FlatToken` (scripts/tokens/plugin.ts) that the export reads. */
export interface FlatTokenLike {
  name: string;
  cssVar: string | null;
  value: string | number | Record<string, string | number>;
  cssValue: string | null;
  type: string;
  tier: 'primitive' | 'semantic' | 'core';
  aliasOf: string | null;
  description: string;
}

export const EXTENSION_KEY = 'com.loui-ds';
export const STUDIO_KEY = 'studio.tokens';
export const SETS = ['primitive', 'semantic', 'core'] as const;
export type SetName = (typeof SETS)[number];

export interface StudioToken {
  value: string | number | Record<string, unknown> | Record<string, unknown>[];
  type: string;
  description: string;
  $extensions: {
    [EXTENSION_KEY]: { cssVar: string | null; mix?: { color: string; percent: number } };
    [STUDIO_KEY]?: { modify: { type: 'alpha'; value: string; space: 'srgb' } };
  };
}

export interface StudioFile {
  $metadata: { tokenSetOrder: readonly SetName[] };
  $themes: never[];
  primitive: StudioGroup;
  semantic: StudioGroup;
  core: StudioGroup;
}
export interface StudioGroup {
  [key: string]: StudioToken | StudioGroup;
}

const REF_RE = /^var\((--[\w-]+)\)$/;
const MIX_RE = /color-mix\(in oklab, var\((--[\w-]+)\) ([\d.]+)%, transparent\)/;

/** Tokens Studio token type for a DTCG token. */
function studioType(token: FlatTokenLike): string {
  const group = token.name.split('.')[0] ?? '';
  switch (token.type) {
    case 'color':
      return 'color';
    case 'dimension':
      if (group === 'space') return 'spacing';
      if (group === 'radius') return 'borderRadius';
      if (group === 'fs') return 'fontSizes';
      if (group === 'size') return 'sizing';
      return 'dimension';
    case 'duration':
      return 'duration';
    case 'cubicBezier':
      return 'cubicBezier';
    case 'number':
      return 'number';
    case 'fontWeight':
      return 'fontWeights';
    case 'fontFamily':
      return 'fontFamilies';
    case 'shadow':
      return 'boxShadow';
    case 'typography':
      return 'typography';
    default:
      throw new Error(`studio export: unsupported token type "${token.type}" on ${token.name}`);
  }
}

/** `0px 12px 32px 0px rgba(0, 0, 0, 0.6)` into a Tokens Studio box shadow. */
function shadowValue(value: string, mixColor?: string) {
  const match = /^(\S+) (\S+) (\S+) (\S+) (.+)$/.exec(value);
  if (!match) throw new Error(`studio export: cannot parse shadow "${value}"`);
  const [, x, y, blur, spread, color] = match;
  return [
    {
      x,
      y,
      blur,
      spread,
      color: mixColor ?? color,
      type: 'dropShadow',
    },
  ];
}

/** The value of a token whose resolved value is a string or number (not a composite). */
function text(token: FlatTokenLike): string {
  if (typeof token.value === 'object') {
    throw new Error(
      `studio export: ${token.name} has a composite value where a scalar is expected`,
    );
  }
  return String(token.value);
}

function toStudio(token: FlatTokenLike, byVar: Map<string, FlatTokenLike>): StudioToken {
  const type = studioType(token);
  const extension: StudioToken['$extensions'] = { [EXTENSION_KEY]: { cssVar: token.cssVar } };
  const base = { type, description: token.description, $extensions: extension };

  // `*-soft` / ring tokens: a mix of a base token over transparent (see plugin.ts `mixCss`).
  const mixMatch = token.cssValue ? MIX_RE.exec(token.cssValue) : null;
  if (mixMatch) {
    const [, baseVar, percent] = mixMatch;
    const baseToken = byVar.get(baseVar ?? '');
    if (!baseToken) throw new Error(`studio export: ${token.name} mixes unknown ${baseVar}`);
    const alpha = Number(percent) / 100;
    extension[EXTENSION_KEY].mix = { color: baseToken.name, percent: Number(percent) };
    if (token.type === 'color') {
      extension[STUDIO_KEY] = {
        modify: { type: 'alpha', value: String(alpha), space: 'srgb' },
      };
      return { value: `{${baseToken.name}}`, ...base };
    }
    // Shadows cannot alias a color with an alpha modifier; keep the resolved color.
    const resolved = text(token);
    const color = /(rgba?\([^)]*\))$/.exec(resolved)?.[1];
    return { value: shadowValue(resolved, color), ...base };
  }

  // Follow the reference as written in CSS: `aliasOf` points at the end of the chain, but a token
  // may alias another alias (--ds-chart-color -> --ds-accent -> --ds-blue-5).
  const ref = token.cssValue ? REF_RE.exec(token.cssValue)?.[1] : undefined;
  if (ref) {
    const target = byVar.get(ref);
    if (!target) throw new Error(`studio export: ${token.name} references unknown ${ref}`);
    return { value: `{${target.name}}`, ...base };
  }

  switch (token.type) {
    case 'shadow':
      return { value: shadowValue(text(token)), ...base };
    case 'typography':
      return { value: token.value, ...base };
    case 'fontWeight':
      return { value: text(token), ...base };
    default:
      return { value: token.value, ...base };
  }
}

function insert(group: StudioGroup, pathParts: string[], token: StudioToken): void {
  let node = group;
  for (const part of pathParts.slice(0, -1)) {
    const next = node[part] ?? (node[part] = {});
    if ('value' in next && 'type' in next) {
      throw new Error(`studio export: ${pathParts.join('.')} nests below the token ${part}`);
    }
    node = next;
  }
  const leaf = pathParts[pathParts.length - 1] ?? '';
  if (leaf in node) throw new Error(`studio export: duplicate token ${pathParts.join('.')}`);
  node[leaf] = token;
}

/** Builds the Tokens Studio file from the flat token list. Pure and deterministic. */
export function buildStudioTokens(tokens: readonly FlatTokenLike[]): StudioFile {
  const byVar = new Map<string, FlatTokenLike>();
  for (const token of tokens) if (token.cssVar) byVar.set(token.cssVar, token);
  const file: StudioFile = {
    $metadata: { tokenSetOrder: SETS },
    $themes: [],
    primitive: {},
    semantic: {},
    core: {},
  };
  for (const token of tokens) {
    insert(file[token.tier], token.name.split('.'), toStudio(token, byVar));
  }
  return file;
}

export const STUDIO_OUTPUT = 'tokens-studio/tokens.json';

export function serialize(file: StudioFile): string {
  return JSON.stringify(file, null, 2) + '\n';
}

function main(): void {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const flat = JSON.parse(
    readFileSync(path.join(root, 'src/tokens/generated/tokens.json'), 'utf8'),
  ) as FlatTokenLike[];
  const next = serialize(buildStudioTokens(flat));
  const target = path.join(root, STUDIO_OUTPUT);

  if (process.argv.includes('--check')) {
    const current = existsSync(target) ? readFileSync(target, 'utf8') : null;
    if (current !== next) {
      console.error(
        `${STUDIO_OUTPUT} is stale.\nRun \`pnpm tokens:studio\` and commit the result.`,
      );
      process.exit(1);
    }
    console.log('Tokens Studio export is up to date.');
    return;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, next);
  console.log(`Wrote ${STUDIO_OUTPUT}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
