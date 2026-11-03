// @vitest-environment node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { generate } from './generate';

/**
 * Docs and types must not drift (GAP-021): every literal value the manifest documents for a prop
 * (`gap`, `variant`, `size`, …) and every documented default is assigned to the real prop type
 * of the real component and has to compile. The manifest is generated from the same types, so a
 * failure means the docs print a value the type does not accept (for example `'4'` for a
 * numeric key).
 */
const root = fileURLToPath(new URL('../../', import.meta.url));
const slash = (file: string): string => file.split('\\').join('/');
const entryFiles: Record<string, string> = {
  'loui-ds': slash(path.join(root, 'src/index')),
  'loui-ds/patterns': slash(path.join(root, 'src/patterns/index')),
};
const LITERAL = /^('[^']*'|-?\d+(\.\d+)?|true|false)$/;

interface Prop {
  name: string;
  type: string;
  default?: string;
}
interface Component {
  name: string;
  importStatement: string;
  props: Prop[];
}

function literalsOf(prop: Prop): string[] | undefined {
  const parts = prop.type.split(' | ').map((p) => p.trim());
  return parts.every((p) => LITERAL.test(p)) ? parts : undefined;
}

describe('documented prop values type-check', () => {
  it('accepts every literal value and default in the manifest', async () => {
    // Generated in-process, so the check covers the current generator even before
    // `pnpm manifest:build` refreshes the committed docs/manifest.json.
    const manifest = (await generate(root)).manifest as unknown as { components: Component[] };
    const imports: string[] = [];
    const checks: string[] = [];
    const labels: string[] = [];
    for (const component of manifest.components) {
      const entry = entryFiles[/from '([^']+)'/.exec(component.importStatement)?.[1] ?? ''];
      if (!entry) continue;
      const alias = `C${String(imports.length)}`;
      let used = false;
      for (const prop of component.props) {
        const literals = literalsOf(prop);
        if (!literals) continue;
        const values = new Set(literals);
        if (prop.default && LITERAL.test(prop.default)) values.add(prop.default);
        for (const value of values) {
          used = true;
          checks.push(
            `{ const v: Props<typeof ${alias}>[${JSON.stringify(prop.name)}] = ${value}; void v; }`,
          );
          labels.push(`${component.name}.${prop.name} = ${value}`);
        }
      }
      if (used) imports.push(`import { ${component.name} as ${alias} } from '${entry}';`);
    }
    const header = [
      ...imports,
      'type Props<T> = T extends (props: infer P) => unknown ? P : never;',
    ];
    const source = [...header, ...checks].join('\n');
    const virtual = slash(path.join(root, 'src/__doc_types__.tsx'));

    const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), (f) => ts.sys.readFile(f));
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const options: ts.CompilerOptions = { ...parsed.options, noEmit: true, types: [] };
    const host = ts.createCompilerHost(options);
    const original = { ...host };
    const fileExists = (f: string): boolean => original.fileExists.call(host, f);
    const readFile = (f: string): string | undefined => original.readFile.call(host, f);
    const getSourceFile: ts.CompilerHost['getSourceFile'] = (...args) =>
      original.getSourceFile.call(host, ...args);
    host.fileExists = (f) => slash(f) === virtual || fileExists(f);
    host.readFile = (f) => (slash(f) === virtual ? source : readFile(f));
    host.getSourceFile = (f, lang, onError, shouldCreate) =>
      slash(f) === virtual
        ? ts.createSourceFile(f, source, lang)
        : getSourceFile(f, lang, onError, shouldCreate);
    const program = ts.createProgram([virtual], options, host);
    const sourceFile = program.getSourceFile(virtual);
    const errors = ts
      .getPreEmitDiagnostics(program, sourceFile)
      .filter((d) => d.file !== undefined && slash(d.file.fileName) === virtual)
      .map((d) => {
        const line = d.file?.getLineAndCharacterOfPosition(d.start ?? 0).line ?? 0;
        const label = labels[line - header.length] ?? `line ${String(line)}`;
        return `${label}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`;
      });
    expect(errors).toEqual([]);
    expect(labels.length).toBeGreaterThan(100);
  }, 240_000);
});
