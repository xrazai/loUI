/**
 * Storybook-only building blocks for the Tokens page. Everything is generated from
 * `generated/tokens.json`, so the page can never drift from the tokens.
 * Not exported from the package. Inline styles are allowed here only to paint token values
 * (swatches, bars); product components must never use them (AGENTS.md section 2).
 */
import { Unstyled } from '@storybook/addon-docs/blocks';
import type { CSSProperties, ReactNode } from 'react';
import { composite, flatten, parseColor, ratio, type Rgba } from '../contrast';
import pairs from '../contrast-pairs.json';
import raw from '../generated/tokens.json';
import styles from './TokenDocs.module.css';

interface FlatToken {
  name: string;
  cssVar: string | null;
  value: string | number | Record<string, string | number>;
  cssValue: string | null;
  type: string;
  tier: 'primitive' | 'semantic' | 'core';
  aliasOf: string | null;
  description: string;
}

const tokens = raw as FlatToken[];
const text = (t: FlatToken) =>
  typeof t.value === 'object' ? JSON.stringify(t.value) : String(t.value);
const byPrefix = (prefix: string) => tokens.filter((t) => t.name.startsWith(prefix));
const colorValue = (name: string): Rgba => {
  const t = tokens.find((x) => x.name === name);
  if (!t) throw new Error(`Unknown token ${name}`);
  return parseColor(text(t));
};

/** Only tokens used as text, icons or borders have a contrast requirement (see contrast-pairs.json). */
const foregrounds = new Set(pairs.pairs.map((p) => p.foreground));

const BACKGROUNDS = ['color.bg', 'color.surface', 'color.surface-raised'] as const;
const PAPER_BACKGROUNDS = ['color.paper'] as const;

function ratioOn(token: FlatToken, background: string): number {
  const bg = flatten([colorValue(background)]);
  return ratio(composite(parseColor(text(token)), bg), bg);
}

function Ratio({ value }: { value: number }) {
  const level = value >= 7 ? 'AAA' : value >= 4.5 ? 'AA' : value >= 3 ? 'UI 3:1' : 'fails';
  return (
    <span className={styles.ratio} data-fail={value < 3 ? '' : undefined}>
      {value.toFixed(2)}:1 <span className={styles.level}>{level}</span>
    </span>
  );
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <Unstyled>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Unstyled>
  );
}

function Name({ token }: { token: FlatToken }) {
  return (
    <>
      <code className={styles.code}>{token.cssVar ?? token.name}</code>
      {token.aliasOf ? <div className={styles.alias}>alias of {token.aliasOf}</div> : null}
    </>
  );
}

/** Color swatches with value, description and contrast against the surfaces they sit on. */
export function ColorTable({
  tier,
  paper = false,
}: {
  tier: 'primitive' | 'semantic';
  paper?: boolean;
}) {
  const isPaper = (t: FlatToken) => t.name.startsWith('color.paper');
  const rows = tokens.filter(
    (t) => t.type === 'color' && t.tier === tier && isPaper(t) === paper && t.cssVar !== null,
  );
  const backgrounds = paper ? PAPER_BACKGROUNDS : BACKGROUNDS;
  return (
    <Table
      head={['Swatch', 'Variable', 'Value', 'Use', ...backgrounds.map((b) => `On ${b.slice(6)}`)]}
    >
      {rows.map((t) => (
        <tr key={t.name}>
          <td>
            <span className={styles.swatch} style={{ background: `var(${t.cssVar ?? ''})` }} />
          </td>
          <td>
            <Name token={t} />
          </td>
          <td>
            <code className={styles.code}>{text(t)}</code>
          </td>
          <td className={styles.desc}>{t.description}</td>
          {backgrounds.map((b) => (
            <td key={b}>
              {foregrounds.has(t.name) ? (
                <Ratio value={ratioOn(t, b)} />
              ) : (
                <span className={styles.level}>n/a</span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </Table>
  );
}

const sample = 'Interfaces without noise 0123456789';

export function TypeScale() {
  const roles = byPrefix('typography.');
  return (
    <Table head={['Role', 'Specimen', 'Spec', 'Use']}>
      {roles.map((t) => {
        const v = t.value as Record<string, string | number>;
        const role = t.name.split('.')[1] ?? '';
        const px = Number.parseFloat(String(v['fontSize']));
        const lineHeight = `${String(Math.round(px * Number(v['lineHeight'])))}px`;
        const style: CSSProperties = {
          fontFamily: String(v['fontFamily']),
          fontSize: String(v['fontSize']),
          fontWeight: Number(v['fontWeight']),
          letterSpacing: String(v['letterSpacing']),
          lineHeight,
          textTransform: role === 'caption' ? 'uppercase' : undefined,
          fontVariantNumeric: ['num', 'num-lg', 'meta'].includes(role) ? 'tabular-nums' : undefined,
        };
        return (
          <tr key={t.name}>
            <th scope="row">
              <code className={styles.code}>--ds-fs-{role}</code>
            </th>
            <td style={style}>{sample}</td>
            <td className={styles.mono}>
              {String(v['fontSize'])} / {lineHeight} · {String(v['fontWeight'])}
              {v['letterSpacing'] === '0px' ? '' : ` · ${String(v['letterSpacing'])}`}
            </td>
            <td className={styles.desc}>{t.description}</td>
          </tr>
        );
      })}
    </Table>
  );
}

export function FontFamilies() {
  return (
    <Table head={['Variable', 'Specimen', 'Stack']}>
      {byPrefix('font.').map((t) => (
        <tr key={t.name}>
          <td>
            <Name token={t} />
          </td>
          <td style={{ fontFamily: `var(${t.cssVar ?? ''})`, fontSize: 'var(--ds-fs-heading)' }}>
            Geist 0123456789 ABC abc
          </td>
          <td className={styles.mono}>{text(t)}</td>
        </tr>
      ))}
    </Table>
  );
}

/** Bars sized by the token itself (space, radius, size). */
export function DimensionTable({
  prefix,
  shape = 'bar',
}: {
  prefix: string;
  shape?: 'bar' | 'box';
}) {
  return (
    <Table head={['Variable', 'Value', 'Preview', 'Use']}>
      {byPrefix(prefix).map((t) => (
        <tr key={t.name}>
          <td>
            <Name token={t} />
          </td>
          <td className={styles.mono}>{text(t)}</td>
          <td>
            {shape === 'bar' ? (
              <span
                className={styles.bar}
                style={{ inlineSize: `min(var(${t.cssVar ?? ''}), 16rem)` }}
              />
            ) : (
              <span className={styles.box} style={{ borderRadius: `var(${t.cssVar ?? ''})` }} />
            )}
          </td>
          <td className={styles.desc}>{t.description}</td>
        </tr>
      ))}
    </Table>
  );
}

export function ShadowTable() {
  return (
    <Table head={['Variable', 'Value', 'Preview', 'Use']}>
      {byPrefix('shadow.').map((t) => (
        <tr key={t.name}>
          <td>
            <Name token={t} />
          </td>
          <td className={styles.mono}>{text(t)}</td>
          <td>
            <span className={styles.card} style={{ boxShadow: `var(${t.cssVar ?? ''})` }} />
          </td>
          <td className={styles.desc}>{t.description}</td>
        </tr>
      ))}
    </Table>
  );
}

/** Plain name / value / description rows (motion, z-index, opacity, focus). */
export function ValueTable({ prefixes }: { prefixes: string[] }) {
  const rows = tokens.filter((t) => prefixes.some((p) => t.name.startsWith(p)));
  return (
    <Table head={['Variable', 'Value', 'Use']}>
      {rows.map((t) => (
        <tr key={t.name}>
          <td>
            <Name token={t} />
          </td>
          <td className={styles.mono}>{text(t)}</td>
          <td className={styles.desc}>{t.description}</td>
        </tr>
      ))}
    </Table>
  );
}
