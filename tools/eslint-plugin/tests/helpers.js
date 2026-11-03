import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { afterAll, describe, it } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.afterAll = afterAll;

const here = path.dirname(fileURLToPath(import.meta.url));

/** Small manifest: enough components, one deprecated component, one deprecated prop, an icon set. */
export const manifest = {
  components: [
    {
      name: 'Button',
      status: 'stable',
      props: [{ name: 'variant' }, { name: 'legacyTone', deprecated: 'Use variant.' }],
    },
    { name: 'IconButton', status: 'stable', props: [{ name: 'label' }] },
    { name: 'Icon', status: 'stable', props: [{ name: 'label' }] },
    { name: 'Card', status: 'stable', props: [] },
    { name: 'Dialog', status: 'stable', props: [] },
    {
      name: 'Alert',
      status: 'stable',
      props: [{ name: 'title', description: '@deprecated Use heading.' }],
    },
    { name: 'OldBanner', status: 'deprecated', props: [] },
    { name: 'MenuItem', status: 'stable', props: [] },
    { name: 'SubMenu', status: 'stable', props: [{ name: 'label' }] },
    { name: 'Swatch', status: 'stable', props: [{ name: 'color' }] },
    { name: 'Tab', status: 'stable', props: [] },
    { name: 'Input', status: 'stable', props: [{ name: 'label' }, { name: 'placeholder' }] },
  ],
  icons: { names: ['PlusIcon', 'LoaderIcon', 'XIcon', 'SearchIcon'] },
};

/** The real microcopy rules: the JSON is the single source of truth, tests read it too. */
export const contentRulesPath = path.resolve(here, '../../../docs/ai/content-rules.json');

export const settings = { loui: { manifest, contentRulesPath } };

export function createTester() {
  return new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings,
  });
}

/** Wraps a snippet with the DS imports most tests need. */
export function ds(
  code,
  names = 'Button, IconButton, Icon, Card, Dialog, Alert, OldBanner, MenuItem, SubMenu, Swatch, Tab, Input',
) {
  return `import { ${names} } from 'loui-ds';\n${code}`;
}

export const tsx = { filename: 'App.tsx' };
