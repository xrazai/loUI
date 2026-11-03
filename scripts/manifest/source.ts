/**
 * Static analysis of the public API (`src/index.ts`, `src/patterns/index.ts`) with the TypeScript
 * compiler API: which names are exported, what kind they are and where they are declared.
 */
import path from 'node:path';
import ts from 'typescript';

export type ExportKind =
  'component' | 'provider' | 'hook' | 'utility' | 'constant' | 'icon' | 'reexport';

export interface PublicExport {
  name: string;
  kind: ExportKind;
  /** `loui-ds` or `loui-ds/patterns`. */
  entryPoint: string;
  /** Repository-relative, forward-slash path of the declaring file. */
  sourceFile: string;
  /** Resolved (alias-free) symbol. */
  symbol: ts.Symbol;
  declaration: ts.Declaration;
  /** For re-exports from another package. */
  from?: string;
}

export interface Analysis {
  program: ts.Program;
  checker: ts.TypeChecker;
  exports: PublicExport[];
  compilerOptions: ts.CompilerOptions;
}

const ENTRIES = [
  { file: 'src/index.ts', entryPoint: 'loui-ds' },
  { file: 'src/patterns/index.ts', entryPoint: 'loui-ds/patterns' },
] as const;

export function toRelative(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}

function loadOptions(root: string): ts.CompilerOptions {
  const configPath = path.join(root, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, (file) => ts.sys.readFile(file));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  return { ...parsed.options, noEmit: true, types: ['vite/client'], skipLibCheck: true };
}

export function analyze(root: string): Analysis {
  const compilerOptions = loadOptions(root);
  const rootNames = [
    ...ENTRIES.map((e) => path.join(root, e.file)),
    path.join(root, 'src/css-modules.d.ts'),
  ];
  const program = ts.createProgram({ rootNames, options: compilerOptions });
  const checker = program.getTypeChecker();
  const exports: PublicExport[] = [];

  for (const entry of ENTRIES) {
    const sourceFile = program.getSourceFile(path.join(root, entry.file));
    if (!sourceFile) continue;
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) continue; // a file without imports or exports (an empty entry point)
    for (const exp of checker.getExportsOfModule(moduleSymbol)) {
      const classified = classify(root, checker, exp, entry.entryPoint);
      if (classified) exports.push(classified);
    }
  }
  exports.sort((a, b) => a.name.localeCompare(b.name));
  return { program, checker, exports, compilerOptions };
}

/** Follows re-exports to the declaration; returns the chain of symbols visited. */
function resolveChain(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol[] {
  const chain = [symbol];
  let current = symbol;
  while (current.flags & ts.SymbolFlags.Alias) {
    const next = checker.getImmediateAliasedSymbol(current);
    if (!next || next === current) break;
    chain.push(next);
    current = next;
  }
  return chain;
}

function classify(
  root: string,
  checker: ts.TypeChecker,
  exp: ts.Symbol,
  entryPoint: string,
): PublicExport | undefined {
  const chain = resolveChain(checker, exp);
  const resolved = chain[chain.length - 1];
  if (!resolved) return undefined;
  if (!(resolved.flags & ts.SymbolFlags.Value)) return undefined; // types and interfaces
  const declaration = resolved.valueDeclaration ?? resolved.declarations?.[0];
  if (!declaration) return undefined;
  const name = exp.getName();
  const files = chain.flatMap((s) =>
    (s.declarations ?? []).map((d) => toRelative(root, d.getSourceFile().fileName)),
  );
  const sourceFile = toRelative(root, declaration.getSourceFile().fileName);
  const base = { name, entryPoint, sourceFile, symbol: resolved, declaration };

  // Re-export from another package: `export { isRTL } from 'react-aria-components'`.
  const specifier = exp.declarations?.[0];
  if (specifier && ts.isExportSpecifier(specifier)) {
    const moduleSpecifier = specifier.parent.parent.moduleSpecifier;
    if (
      moduleSpecifier &&
      ts.isStringLiteral(moduleSpecifier) &&
      !moduleSpecifier.text.startsWith('.')
    ) {
      return { ...base, kind: 'reexport', from: moduleSpecifier.text };
    }
  }
  if (/Icon$/.test(name) && files.some((f) => f.endsWith('src/components/Icon/icons.ts')))
    return { ...base, kind: 'icon' };

  const isFunction =
    checker.getTypeOfSymbolAtLocation(resolved, declaration).getCallSignatures().length > 0;
  const pascal = /^[A-Z][A-Za-z0-9]*$/.test(name);
  const upper = /^[A-Z][A-Z0-9_]*$/.test(name) && name.includes('_');
  if (sourceFile.startsWith('src/providers/') && pascal && isFunction)
    return { ...base, kind: 'provider' };
  if (/^use[A-Z]/.test(name) && isFunction) return { ...base, kind: 'hook' };
  if (
    (sourceFile.startsWith('src/components/') || sourceFile.startsWith('src/patterns/')) &&
    pascal &&
    !upper &&
    isFunction
  ) {
    return { ...base, kind: 'component' };
  }
  if (isFunction) return { ...base, kind: 'utility' };
  return { ...base, kind: 'constant' };
}

/** TSDoc text and tags of a symbol. */
export function docOf(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
): { text: string; tags: Map<string, string> } {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  const tags = new Map<string, string>();
  for (const tag of symbol.getJsDocTags(checker)) {
    tags.set(tag.name, ts.displayPartsToString(tag.text).trim());
  }
  return { text, tags };
}

export function typeToString(checker: ts.TypeChecker, type: ts.Type, node?: ts.Node): string {
  return checker.typeToString(
    type,
    node,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
  );
}

export function signatureOf(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
  declaration: ts.Declaration,
): {
  signature: string;
  params: { name: string; type: string; required: boolean }[];
  returns: string;
} {
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = type.getCallSignatures()[0];
  if (!signature) {
    const text = typeToString(checker, type, declaration);
    return { signature: text, params: [], returns: text };
  }
  const params = signature.getParameters().map((param) => {
    const decl = param.valueDeclaration;
    const paramType = checker.getTypeOfSymbolAtLocation(param, decl ?? declaration);
    const required =
      decl && ts.isParameter(decl)
        ? !decl.questionToken && !decl.initializer && !decl.dotDotDotToken
        : true;
    return { name: param.getName(), type: typeToString(checker, paramType, declaration), required };
  });
  return {
    signature: checker.signatureToString(
      signature,
      declaration,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
    ),
    params,
    returns: typeToString(checker, signature.getReturnType(), declaration),
  };
}
