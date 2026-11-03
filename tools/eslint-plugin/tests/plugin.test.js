import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import plugin from '../src/index.js';
import { settings } from './helpers.js';

describe('plugin', () => {
  it('exports the eight rules with docs urls and messages', () => {
    const names = Object.keys(plugin.rules).sort();
    expect(names).toEqual([
      'allowed-icons',
      'content-rules',
      'icon-button-label',
      'no-deprecated',
      'no-inline-style-visual',
      'no-raw-colors',
      'no-raw-spacing',
      'one-primary-action',
    ]);
    for (const name of names) {
      const { meta } = plugin.rules[name];
      expect(meta.docs.url).toBe(`tools/eslint-plugin/README.md#${name}`);
      expect(meta.docs.description.length).toBeGreaterThan(20);
      expect(Object.keys(meta.messages).length).toBeGreaterThan(0);
    }
  });

  it('recommended config: errors for 1, 2, 4, 8 and warnings for 3, 5, 6, 7', () => {
    const { rules } = plugin.configs.recommended;
    expect(rules).toEqual({
      'loui/no-raw-colors': 'error',
      'loui/no-raw-spacing': 'error',
      'loui/icon-button-label': 'error',
      'loui/no-inline-style-visual': 'error',
      'loui/one-primary-action': 'warn',
      'loui/no-deprecated': 'warn',
      'loui/allowed-icons': 'warn',
      'loui/content-rules': 'warn',
    });
  });

  it('works end to end through the recommended flat config', async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        { files: ['**/*.tsx'], languageOptions: { parser: tseslint.parser } },
        { ...plugin.configs.recommended, settings },
      ],
    });
    const [result] = await eslint.lintText(
      `import { Button, IconButton } from 'loui-ds';
       import { Plus } from 'lucide-react';
       export const A = () => (
         <div style={{ color: '#fff', gap: 8 }}>
           <IconButton icon={Plus} />
           <Button variant="primary">New Order</Button>
           <Button variant="primary">Save</Button>
         </div>
       );`,
      { filePath: 'src/App.tsx' },
    );
    const ids = result.messages.map((m) => m.ruleId).sort();
    expect(ids).toEqual(
      [
        'loui/allowed-icons',
        'loui/content-rules',
        'loui/icon-button-label',
        'loui/no-raw-colors',
        'loui/no-raw-spacing',
        'loui/one-primary-action',
      ].sort(),
    );
    expect(result.messages.every((m) => m.fatal !== true)).toBe(true);
  });
});
