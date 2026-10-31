import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  RECIPE_NAMES,
  SOURCE_END,
  SOURCE_START,
  docSource,
  extractSource,
  replaceSource,
  rewriteImports,
  toKebab,
} from './docs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relative: string) => readFileSync(path.join(root, relative), 'utf8');

describe('recipe docs', () => {
  describe('rewriteImports', () => {
    it('maps relative imports to the package and merges the ones that share a module', () => {
      const source = [
        "import { useState } from 'react';",
        "import { Button } from '../../index';",
        "import type { BadgeTone } from '../../index';",
        "import { ApprovalCard } from '../../patterns';",
        "import { useUndoable } from '../../hooks/useUndoable';",
        '',
        'export const x = 1;',
        '',
      ].join('\n');
      expect(rewriteImports(source)).toBe(
        [
          "import { useState } from 'react';",
          "import { Button, useUndoable } from '@loui/ds';",
          "import type { BadgeTone } from '@loui/ds';",
          "import { ApprovalCard } from '@loui/ds/patterns';",
          '',
          'export const x = 1;',
          '',
        ].join('\n'),
      );
    });

    it('refuses an import a consumer could not write', () => {
      expect(() => rewriteImports("import { RecipeHost } from '../RecipeHost';\n")).toThrow(
        /cannot import/,
      );
    });
  });

  describe('extractSource and replaceSource', () => {
    const doc = `# Title\n\n${SOURCE_START}\n\`\`\`tsx\nold\n\`\`\`\n${SOURCE_END}\n\nafter\n`;

    it('reads and replaces only the marked block', () => {
      expect(extractSource(doc)).toBe('old');
      const next = replaceSource(doc, 'new\nlines');
      expect(extractSource(next)).toBe('new\nlines');
      expect(next.startsWith('# Title')).toBe(true);
      expect(next.endsWith('after\n')).toBe(true);
    });

    it('does not interpret $ patterns in the code', () => {
      expect(extractSource(replaceSource(doc, 'const a = `$&${1}`;'))).toBe('const a = `$&${1}`;');
    });
  });

  it('names every recipe folder', () => {
    for (const name of RECIPE_NAMES) {
      expect(existsSync(path.join(root, 'src/recipes', name, `${name}.tsx`)), name).toBe(true);
    }
    expect(toKebab('FormWithValidation')).toBe('form-with-validation');
  });

  describe.each(RECIPE_NAMES)('%s', (name) => {
    const docPath = `docs/recipes/${toKebab(name)}.md`;

    it('has a doc whose code block is the recipe source (run `pnpm exec tsx src/recipes/sync.ts`)', async () => {
      const markdown = read(docPath);
      const expected = await docSource(read(`src/recipes/${name}/${name}.tsx`));
      expect(extractSource(markdown)).toBe(expected);
    });

    it('has a story, a test and an overview entry', () => {
      expect(existsSync(path.join(root, 'src/recipes', name, `${name}.stories.tsx`))).toBe(true);
      expect(existsSync(path.join(root, 'src/recipes', name, `${name}.test.tsx`))).toBe(true);
      expect(read('src/recipes/Overview.mdx')).toContain(toKebab(name));
    });

    it('only imports from the package in the doc', () => {
      const code = extractSource(read(docPath)) ?? '';
      expect(code).not.toMatch(/from '\.\.?\//);
    });
  });
});
