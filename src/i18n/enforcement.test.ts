import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { scanSource } from '../test/scanI18n';
import type { MessageCatalog, MessageSet } from './messages';

/**
 * i18n enforcement (TEST-010, ADR-0005): no hard-coded user-facing string in component code,
 * and every message catalog is complete in both shipped locales.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = ['components', 'patterns']
  .flatMap((folder) => walk(join(root, folder)))
  .filter((path) => path.endsWith('.tsx') && !/\.(stories|test|fixtures)\.tsx$/.test(path))
  .sort();

describe('scanner', () => {
  it('reports JSX text, string children and literal user-visible props', () => {
    const found = scanSource(
      'sample.tsx',
      [
        'export const A = () => (',
        '  <button aria-label="Close" title={open ? "Open" : t.open} data-x="q">',
        '    Save',
        "    {'Cancel'}",
        '    {t.done}',
        '  </button>',
        ');',
      ].join('\n'),
    );
    expect(found.map((item) => `${item.kind}:${item.name ?? ''}:${item.text}`)).toEqual([
      'attribute:aria-label:Close',
      'attribute:title:Open',
      'jsx-text::Save',
      'jsx-text::Cancel',
    ]);
  });

  it('ignores symbols, non-letter text, other props and dynamic values', () => {
    const found = scanSource(
      'sample.tsx',
      [
        'export const A = ({ label }) => (',
        '  <span className="x" data-icon="check" aria-label={label} placeholder={t.search}>',
        '    ×',
        '    {1}',
        '    {" "}',
        '  </span>',
        ');',
      ].join('\n'),
    );
    expect(found).toEqual([]);
  });

  it('honors an i18n-ignore comment with a reason, on the same line or the line above', () => {
    const found = scanSource(
      'sample.tsx',
      [
        'export const A = () => (',
        '  <div>',
        '    {/* i18n-ignore: the product name is not translated */}',
        '    <b>Loui</b>',
        '    <Icon name="x" /* i18n-ignore: icon key */ label="x-circle" />',
        '    <hr />',
        '    <i>Bare</i> {/* i18n-ignore: */}',
        '  </div>',
        ');',
      ].join('\n'),
    );
    expect(found.map((item) => item.text)).toEqual(['Bare']);
  });
});

describe('component source has no hard-coded user-facing strings', () => {
  it('scans the component and pattern sources', () => {
    expect(sourceFiles.length).toBeGreaterThan(80);
  });

  it('finds none (use the message catalog, or add `// i18n-ignore: <reason>`)', () => {
    const violations = sourceFiles.flatMap((path) =>
      scanSource(path, readFileSync(path, 'utf8')).map((item) => {
        const where = `${relative(root, path).split(sep).join('/')}:${String(item.line)}`;
        return `${where} ${item.kind}${item.name ? ` ${item.name}` : ''} "${item.text}"`;
      }),
    );
    expect(violations).toEqual([]);
  });
});

type AnyCatalog = MessageCatalog<MessageSet>;

const catalogModules = import.meta.glob<{ messages?: AnyCatalog }>(
  ['../components/**/*.messages.ts', '../patterns/**/*.messages.ts', '../hooks/**/*.messages.ts'],
  { eager: true },
);

describe('message catalogs', () => {
  const catalogs = Object.entries(catalogModules).sort(([a], [b]) => a.localeCompare(b));

  it('finds the catalogs', () => {
    expect(catalogs.length).toBeGreaterThan(30);
    for (const [path, module] of catalogs) {
      expect(module.messages, path).toBeDefined();
    }
  });

  it.each(catalogs)('%s: en and pt-BR have identical keys and the same kinds', (path, module) => {
    const catalog = module.messages;
    if (!catalog) throw new Error(`${path} exports no messages catalog.`);
    const keys = (set: MessageSet) => Object.keys(set).sort();
    expect(keys(catalog['pt-BR']), path).toEqual(keys(catalog.en));
    for (const key of keys(catalog.en)) {
      const english = catalog.en[key];
      const portuguese = catalog['pt-BR'][key];
      expect(typeof portuguese, `${path} "${key}"`).toBe(typeof english);
      if (typeof english === 'function' && typeof portuguese === 'function') {
        expect(portuguese.length, `${path} "${key}" arity`).toBe(english.length);
      }
      if (typeof portuguese === 'string') {
        expect(portuguese.trim(), `${path} "${key}" is empty`).not.toBe('');
      }
    }
  });

  it.each(catalogs)('%s: extra locales do not add or drop keys', (path, module) => {
    const catalog = module.messages;
    if (!catalog) throw new Error(`${path} exports no messages catalog.`);
    for (const [locale, set] of Object.entries(catalog)) {
      if (!set || locale === 'en' || locale === 'pt-BR') continue;
      expect(Object.keys(set).sort(), `${path} ${locale}`).toEqual(Object.keys(catalog.en).sort());
    }
  });
});
