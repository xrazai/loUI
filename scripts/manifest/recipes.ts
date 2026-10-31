/**
 * Reads the recipe docs (`docs/recipes/*.md`, written by hand around the source block that
 * `src/recipes/sync.ts` keeps current) so the manifest and the llms files can list them.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { ManifestRecipe } from './types';

export interface RecipeDoc extends ManifestRecipe {
  /** Markdown of the whole doc, LF line endings. */
  content: string;
}

/** The first paragraph after the title and the `Status:` line. */
function firstParagraph(lines: string[]): string {
  const start = lines.findIndex((line) => /^Status:/.test(line));
  const body = lines.slice(start + 1);
  const first = body.findIndex((line) => line.trim() !== '');
  if (first === -1) return '';
  const paragraph: string[] = [];
  for (const line of body.slice(first)) {
    if (line.trim() === '') break;
    paragraph.push(line.trim());
  }
  return paragraph.join(' ');
}

export function readRecipeDocs(root: string): RecipeDoc[] {
  const folder = path.join(root, 'docs/recipes');
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const content = readFileSync(path.join(folder, file), 'utf8').replace(/\r\n/g, '\n');
      const lines = content.split('\n');
      const name = /^#\s+(.+)$/m.exec(content)?.[1]?.trim() ?? file.replace(/\.md$/, '');
      const status = /^Status:\s*(\S+)/m.exec(content)?.[1] ?? 'experimental';
      return {
        name,
        description: firstParagraph(lines),
        status,
        doc: `recipes/${file}`,
        content,
      };
    });
}
