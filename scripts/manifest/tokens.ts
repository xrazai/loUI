/**
 * Builds the token manifest for AI consumers: every token with its CSS variable, resolved value,
 * description and the surfaces it may be used on (from the contrast pairs and computed ratios).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pairRatio } from '../../src/tokens/contrast';
import type { ContrastPair } from '../../src/tokens/contrast';
import type { TokenEntry, TokenManifest, TokenPairing } from './types';

interface RawToken {
  name: string;
  cssVar: string | null;
  value: unknown;
  cssValue: unknown;
  type: string;
  tier: string;
  aliasOf: string | null;
  description: string;
}

const SCHEMA_URL = 'https://loui.dev/schemas/tokens.schema.json';
function asString(value: unknown): string {
  return typeof value === 'string'
    ? value
    : typeof value === 'number'
      ? String(value)
      : JSON.stringify(value);
}
const round = (n: number) => Math.round(n * 100) / 100;

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** One row per foreground token, with the strictest requirement it was checked against. */
function dedupe(rows: { token: string; ratio: number; min: number }[]) {
  const byToken = new Map<string, { token: string; ratio: number; min: number }>();
  for (const row of rows) {
    const existing = byToken.get(row.token);
    if (!existing || row.min > existing.min) byToken.set(row.token, row);
  }
  return [...byToken.values()];
}

export function buildTokenManifest(root: string): TokenManifest {
  const raw = readJson(path.join(root, 'src/tokens/generated/tokens.json')) as RawToken[];
  const pairsFile = readJson(path.join(root, 'src/tokens/contrast-pairs.json')) as {
    pairs: ContrastPair[];
  };
  const pkg = readJson(path.join(root, 'package.json')) as { name: string; version: string };
  const values = new Map(
    raw.flatMap((t) => (typeof t.value === 'string' ? [[t.name, t.value] as const] : [])),
  );

  // Surfaces are the single-layer backgrounds used by the checked pairs.
  const surfaces = [
    ...new Set(
      pairsFile.pairs.filter((p) => p.background.length === 1).flatMap((p) => p.background),
    ),
  ].filter((name) => name.startsWith('color.bg') || name.startsWith('color.surface'));

  const checkedBy = new Map<string, ContrastPair[]>();
  for (const pair of pairsFile.pairs) {
    checkedBy.set(pair.foreground, [...(checkedBy.get(pair.foreground) ?? []), pair]);
  }

  const foregroundsOn = new Map<string, { token: string; ratio: number; min: number }[]>();
  const pairingsOf = new Map<string, { allowed: TokenPairing[]; notAllowed: TokenPairing[] }>();

  for (const [foreground, pairs] of checkedBy) {
    const allowed: TokenPairing[] = [];
    const notAllowed: TokenPairing[] = [];
    const min = Math.max(...pairs.map((p) => p.min));
    for (const pair of pairs) {
      const ratio = round(pairRatio(foreground, pair.background, values));
      const entry: TokenPairing = {
        on: pair.background,
        ratio,
        min: pair.min,
        passes: ratio >= pair.min,
        source: 'checked',
        usage: pair.usage,
      };
      (entry.passes ? allowed : notAllowed).push(entry);
    }
    const onSurface = pairs.some(
      (p) => p.background.length === 1 && surfaces.includes(p.background[0] ?? ''),
    );
    if (onSurface) {
      for (const surface of surfaces) {
        if (pairs.some((p) => p.background.length === 1 && p.background[0] === surface)) continue;
        if (surface === foreground) continue;
        const ratio = round(pairRatio(foreground, [surface], values));
        const entry: TokenPairing = {
          on: [surface],
          ratio,
          min,
          passes: ratio >= min,
          source: 'computed',
        };
        (entry.passes ? allowed : notAllowed).push(entry);
      }
    }
    pairingsOf.set(foreground, { allowed, notAllowed });
    for (const entry of allowed) {
      const only = entry.on.length === 1 ? entry.on[0] : undefined;
      if (only && surfaces.includes(only)) {
        foregroundsOn.set(only, [
          ...(foregroundsOn.get(only) ?? []),
          { token: foreground, ratio: entry.ratio, min: entry.min },
        ]);
      }
    }
  }

  const tokens: TokenEntry[] = raw.map((t) => {
    const pairings = pairingsOf.get(t.name);
    const foregrounds = foregroundsOn.get(t.name);
    return {
      name: t.name,
      cssVar: t.cssVar,
      value: asString(t.value),
      cssValue: asString(t.cssValue),
      type: t.type,
      tier: t.tier,
      aliasOf: t.aliasOf,
      description: t.description,
      ...(pairings ? { pairings } : {}),
      ...(foregrounds
        ? {
            foregrounds: dedupe(foregrounds).sort(
              (a, b) => b.ratio - a.ratio || a.token.localeCompare(b.token),
            ),
          }
        : {}),
    };
  });

  return {
    $schema: SCHEMA_URL,
    schemaVersion: 1,
    package: { name: pkg.name, version: pkg.version },
    generator: 'scripts/manifest/build.ts',
    counts: { tokens: tokens.length, pairs: pairsFile.pairs.length },
    notes: [
      'Components use semantic tokens only; primitive tokens exist to define them.',
      'Text needs 4.5:1 (WCAG 1.4.3); UI boundaries and graphics need 3:1 (1.4.11).',
      'pairings.allowed lists the surfaces a foreground token may be used on; pairings.notAllowed lists surfaces where it fails its minimum.',
      'Pairings with source "checked" are asserted by the contrast unit test; "computed" ones use the same math on the remaining surfaces.',
    ],
    tokens,
  };
}
