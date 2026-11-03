// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyTransform } from 'jscodeshift/src/testUtils';
import { describe, expect, it } from 'vitest';
import { parseMigrationHint } from './hint';
import { buildArgs, listTransforms } from './run';
import * as applyDeprecations from './transforms/apply-deprecations';
import * as renameProp from './transforms/rename-prop';

const root = fileURLToPath(new URL('../../', import.meta.url));

const input = `import { Button as Btn, Card } from '@loui/ds';
import { Button } from 'other-lib';

export function Screen() {
  return (
    <Card>
      <Btn legacyTone="primary" size="sm">Save</Btn>
      <Btn legacyTone="primary" variant="ghost">Cancel</Btn>
      <Button legacyTone="x">Other library</Button>
    </Card>
  );
}
`;

const options = { component: 'Button', from: 'legacyTone', to: 'variant' };

describe('rename-prop (AI-011)', () => {
  it('renames the prop on design system elements only, including aliased imports', () => {
    const output = applyTransform(renameProp, options, { path: 'Screen.tsx', source: input });
    expect(output).toContain('<Btn variant="primary" size="sm">Save</Btn>');
    // Same name from another package: untouched.
    expect(output).toContain('<Button legacyTone="x">Other library</Button>');
    // The target prop already exists: left for manual review.
    expect(output).toContain('<Btn legacyTone="primary" variant="ghost">Cancel</Btn>');
  });

  it('is idempotent and reports an unmodified file as empty', () => {
    const once = applyTransform(renameProp, options, { path: 'Screen.tsx', source: input });
    expect(applyTransform(renameProp, options, { path: 'Screen.tsx', source: once })).toBe('');
  });

  it('leaves files without the component alone', () => {
    const source = `import { Card } from '@loui/ds';\nexport const a = <Card legacyTone="x" />;\n`;
    expect(applyTransform(renameProp, options, { path: 'a.tsx', source })).toBe('');
  });

  it('requires its options', () => {
    expect(() => applyTransform(renameProp, {}, { path: 'a.tsx', source: input })).toThrow(
      /--component/,
    );
  });
});

describe('apply-deprecations', () => {
  const deprecations = JSON.stringify({
    components: [
      {
        name: 'Button',
        props: [
          { name: 'legacyTone', deprecated: 'Use variant.' },
          { name: 'oldSize', deprecated: 'Use size together with density.' },
        ],
      },
    ],
  });

  it('applies rename hints from the manifest and skips hints it cannot apply', () => {
    const source = `import { Button } from '@loui/ds';\nexport const a = <Button legacyTone="x" oldSize="s" />;\n`;
    const output = applyTransform(applyDeprecations, { deprecations }, { path: 'a.tsx', source });
    expect(output).toContain('<Button variant="x" oldSize="s" />');
  });
});

describe('parseMigrationHint', () => {
  it.each([
    ['Use variant.', 'variant'],
    ['Use `variant` instead.', 'variant'],
    ['use variant instead of tone', 'variant'],
    ['Renamed to variant.', 'variant'],
  ])('reads "%s" as a rename to %s', (hint, to) => {
    expect(parseMigrationHint(hint)).toEqual({ kind: 'rename', to });
  });

  it.each(['', 'Removed.', 'Use size together with density.', 'Use <Panel> instead.', 'Use a.b'])(
    'does not guess for "%s"',
    (hint) => {
      expect(parseMigrationHint(hint)).toBeNull();
    },
  );
});

describe('runner', () => {
  it('lists the transforms and builds jscodeshift arguments', () => {
    expect(listTransforms()).toEqual(['apply-deprecations', 'rename-prop']);
    const { args } = buildArgs(['rename-prop', 'src', '--dry', '--from=a']);
    expect(args).toContain('--parser=tsx');
    expect(args).toContain('--dry');
    expect(args.at(-1)).toBe('src');
  });

  it('rejects unknown codemods and missing paths', () => {
    expect(() => buildArgs(['nope', 'src'])).toThrow(/Unknown codemod/);
    expect(() => buildArgs(['rename-prop'])).toThrow(/at least one/);
    expect(() => buildArgs([])).toThrow(/Usage/);
  });

  it('transforms files on disk through the real jscodeshift CLI', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'loui-codemod-'));
    try {
      const file = path.join(dir, 'Screen.tsx');
      writeFileSync(file, input);
      const { args } = buildArgs([
        'rename-prop',
        dir,
        '--component=Button',
        '--from=legacyTone',
        '--to=variant',
        '--silent',
      ]);
      const bin = path.join(root, 'node_modules/jscodeshift/bin/jscodeshift.js');
      const result = spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(file, 'utf8')).toContain('<Btn variant="primary" size="sm">');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
