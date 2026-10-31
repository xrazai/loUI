import { readFileSync } from 'node:fs';
import rule from '../src/rules/content-rules.js';
import { contentRulesPath, createTester, ds, tsx } from './helpers.js';
import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import { settings } from './helpers.js';

createTester().run('content-rules', rule, {
  valid: [
    { ...tsx, code: ds(`const a = <Button>Create order</Button>;`) },
    { ...tsx, code: ds(`const a = <Button>{'Mark as shipped'}</Button>;`) },
    { ...tsx, code: ds(`const a = <Button>Export CSV</Button>;`) },
    { ...tsx, code: ds(`const a = <Button>Create <b>order</b></Button>;`) },
    { ...tsx, code: ds(`const a = <Button>{label}</Button>;`) },
    { ...tsx, code: ds(`const a = <Dialog title="Delete order">Body</Dialog>;`) },
    { ...tsx, code: ds(`const a = <MenuItem>Move to…</MenuItem>;`) },
    { ...tsx, code: ds(`const a = <Tab>Open orders</Tab>;`) },
    { ...tsx, code: ds(`const a = <SubMenu label="Move to…" />;`) },
    {
      ...tsx,
      code: ds(`const a = <Input label="Email address" placeholder="name@example.com" />;`),
    },
    { ...tsx, code: ds(`const a = <Input label="Shortcut" placeholder="⌘K" />;`) },
    {
      ...tsx,
      code: ds(`const a = <Button>Open Northwind Web</Button>;`),
      options: [{ properNouns: ['Northwind Web'] }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button>Save As</Button>;`),
      options: [{ ignoreRules: ['sentence-case'] }],
    },
    // Plain DOM text and non-DS components are not checked.
    { ...tsx, code: ds(`const a = <p>Saved!</p>;`) },
    { ...tsx, code: `const a = <Button>OK!</Button>;` },
    { ...tsx, code: ds(`const a = <Card>Order Saved</Card>;`) },
  ],
  invalid: [
    {
      ...tsx,
      code: ds(`const a = <Button>New Order</Button>;`),
      errors: [{ messageId: 'violation' }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button>NEW ORDER</Button>;`),
      errors: [{ messageId: 'violation' }],
    },
    { ...tsx, code: ds(`const a = <Button>Mark As Shipped</Button>;`), errors: 1 },
    { ...tsx, code: ds(`const a = <Dialog title="Delete Order">x</Dialog>;`), errors: 1 },
    { ...tsx, code: ds(`const a = <Tab>Open Orders</Tab>;`), errors: 1 },
    { ...tsx, code: ds(`const a = <Input label="Customer Name" />;`), errors: 1 },
    {
      ...tsx,
      code: ds(`const a = <Button>Saved!</Button>;`),
      errors: [{ messageId: 'violation' }],
    },
    {
      ...tsx,
      code: ds(`const a = <Alert>Order saved!</Alert>;`),
      errors: [{ messageId: 'violation' }],
    },
    {
      ...tsx,
      code: ds(`const a = <Dialog title="Done 🎉">x</Dialog>;`),
      errors: [{ messageId: 'violation' }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button>Saving...</Button>;`),
      errors: [{ messageId: 'violation' }],
    },
    {
      ...tsx,
      code: ds(`const a = <Button>Move to…</Button>;`),
      errors: [{ messageId: 'violation' }],
    },
    { ...tsx, code: ds(`const a = <Input placeholder="Search..." />;`), errors: 1 },
    { ...tsx, code: ds(`const a = <Button>OK</Button>;`), errors: [{ messageId: 'bare' }] },
    { ...tsx, code: ds(`const a = <Button>{'Submit'}</Button>;`), errors: [{ messageId: 'bare' }] },
    { ...tsx, code: ds(`const a = <Button>send</Button>;`), errors: [{ messageId: 'bare' }] },
    {
      ...tsx,
      code: ds(`const a = <Button>Click here</Button>;`),
      errors: [{ messageId: 'phrase' }],
    },
    // Multiple problems in one string are reported separately.
    { ...tsx, code: ds(`const a = <Button>Save Draft!</Button>;`), errors: 2 },
    { ...tsx, code: ds(`const a = <Button>Hello! </Button>;`), errors: 1 },
  ],
});

describe('content-rules.json stays the single source of truth', () => {
  it('only static rules with a compilable pattern drive the lint rule', () => {
    const json = JSON.parse(readFileSync(contentRulesPath, 'utf8'));
    const statics = json.rules.filter((r) => r.check === 'static');
    expect(statics.map((r) => r.id).sort()).toEqual(
      ['no-decorative-ellipsis', 'no-emoji', 'no-exclamation', 'sentence-case'].sort(),
    );
    for (const rule of statics) expect(() => new RegExp(rule.pattern, 'u')).not.toThrow();
  });

  it('the good and bad examples in the JSON behave as documented', () => {
    const json = JSON.parse(readFileSync(contentRulesPath, 'utf8'));
    for (const rule of json.rules.filter((r) => r.check === 'static')) {
      const re = new RegExp(rule.pattern, 'u');
      for (const bad of rule.examples.bad) {
        // Mixed-case misses are fine for the heuristic, but a bad example must never be "good" for
        // punctuation rules.
        if (rule.id !== 'sentence-case') expect(re.test(bad), `${rule.id}: ${bad}`).toBe(true);
      }
      for (const good of rule.examples.good)
        expect(re.test(good), `${rule.id}: ${good}`).toBe(false);
    }
  });
});

describe('reported rule ids', () => {
  function ids(code) {
    const linter = new Linter();
    const messages = linter.verify(
      ds(code),
      [
        {
          files: ['**/*.tsx'],
          languageOptions: {
            parser: tseslint.parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
          plugins: { t: { rules: { r: rule } } },
          settings,
          rules: { 't/r': 'warn' },
        },
      ],
      { filename: 'App.tsx' },
    );
    return messages.map((m) => /Content rule "([^"]+)"/.exec(m.message)?.[1] ?? m.messageId);
  }

  it('names the JSON rule that was broken', () => {
    expect(ids('const a = <Button>New Order</Button>;')).toEqual(['sentence-case']);
    expect(ids('const a = <Button>NEW ORDER</Button>;')).toEqual(['sentence-case']);
    expect(ids('const a = <Button>Saved!</Button>;')).toEqual(['no-exclamation']);
    expect(ids('const a = <Dialog title="Done 🎉">x</Dialog>;')).toEqual(['no-emoji']);
    expect(ids('const a = <Button>Saving...</Button>;')).toEqual(['no-decorative-ellipsis']);
    expect(ids('const a = <Button>Save Draft!</Button>;').sort()).toEqual([
      'no-exclamation',
      'sentence-case',
    ]);
  });
});
