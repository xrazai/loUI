import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

/**
 * Recipe docs (`docs/recipes/<kebab-name>.md`) embed the recipe's source, rewritten for
 * consumers. This module is the single place that does the rewrite, so the docs can be generated
 * (`src/recipes/sync.ts`) and checked (`docs.test.ts`) instead of drifting.
 *
 * Plain TypeScript with no React or browser API: it runs in Node (the `unit` test project and
 * the sync script).
 */

/** Folder names of `src/recipes/`. The order is the order of the overview. */
export const RECIPE_NAMES = [
  'ApprovalQueue',
  'CommandPaletteSetup',
  'DestructiveConfirm',
  'DetailSheet',
  'FilterableTable',
  'FormWithValidation',
  'SettingsPage',
  'UndoableAction',
] as const;

export type RecipeName = (typeof RECIPE_NAMES)[number];

export const SOURCE_START = '<!-- recipe-source:start -->';
export const SOURCE_END = '<!-- recipe-source:end -->';

/** `DestructiveConfirm` becomes `destructive-confirm`. */
export function toKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Where each relative import of a recipe lands in a consumer's app. Recipes may only import
 * what the package exports; anything else makes the sync fail instead of shipping a snippet
 * that cannot be pasted.
 */
const PACKAGE_IMPORTS: Readonly<Record<string, string>> = {
  '../../index': '@loui/ds',
  // useUndoable lives in src/hooks and is exported from the package root.
  '../../hooks/useUndoable': '@loui/ds',
  '../../patterns': '@loui/ds/patterns',
};

interface ImportStatement {
  isType: boolean;
  specifier: string;
  names: string[];
}

const IMPORT_PATTERN = /^import (type )?\{([^}]*)\} from '([^']+)';\n/gm;

function mapSpecifier(specifier: string): string {
  if (!specifier.startsWith('.')) return specifier;
  const mapped = PACKAGE_IMPORTS[specifier];
  if (!mapped) {
    throw new Error(
      `A recipe imports "${specifier}", which a consumer cannot import. Use the package exports: ${Object.keys(PACKAGE_IMPORTS).join(', ')}.`,
    );
  }
  return mapped;
}

/** Rewrites the imports to the package names and merges the ones that now share a module. */
export function rewriteImports(source: string): string {
  const statements: ImportStatement[] = [];
  const body = source.replace(
    IMPORT_PATTERN,
    (_match, type: string | undefined, names: string, specifier: string) => {
      const mapped = mapSpecifier(specifier);
      const list = names
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);
      const existing = statements.find((s) => s.isType === Boolean(type) && s.specifier === mapped);
      if (existing) existing.names.push(...list);
      else statements.push({ isType: Boolean(type), specifier: mapped, names: list });
      return '';
    },
  );
  const imports = statements
    .map(({ isType, specifier, names }) => {
      const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b, 'en'));
      return `import ${isType ? 'type ' : ''}{ ${unique.join(', ')} } from '${specifier}';\n`;
    })
    .join('');
  return imports + body;
}

let prettierOptions: Promise<prettier.Options> | undefined;

/** The source of a recipe as shown in its doc: package imports, formatted like the repository. */
export async function docSource(source: string): Promise<string> {
  prettierOptions ??= prettier
    .resolveConfig(fileURLToPath(new URL('./docs.ts', import.meta.url)))
    .then((config) => config ?? {});
  const formatted = await prettier.format(rewriteImports(source), {
    ...(await prettierOptions),
    parser: 'typescript',
  });
  return formatted.trimEnd();
}

const BLOCK_PATTERN = new RegExp(
  // Prettier puts blank lines around the fence, so allow any whitespace between marker and fence.
  `${SOURCE_START}\\s*\`\`\`tsx\\r?\\n([\\s\\S]*?)\\r?\\n\`\`\`\\s*${SOURCE_END}`,
);

/** The code between the source markers of a recipe doc, or `null` when the markers are missing. */
export function extractSource(markdown: string): string | null {
  return BLOCK_PATTERN.exec(markdown)?.[1] ?? null;
}

/** Puts `code` between the source markers. Throws when the doc has no markers. */
export function replaceSource(markdown: string, code: string): string {
  if (!BLOCK_PATTERN.test(markdown)) {
    throw new Error(`The doc has no "${SOURCE_START}" block to fill.`);
  }
  return markdown.replace(
    BLOCK_PATTERN,
    () => `${SOURCE_START}\n\n\`\`\`tsx\n${code}\n\`\`\`\n\n${SOURCE_END}`,
  );
}
