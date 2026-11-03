/**
 * Builds the component manifest: public exports + TSDoc + props (react-docgen-typescript) +
 * messages + CSS variables + stories + hand-written docs.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { withCompilerOptions } from 'react-docgen-typescript';
import type { ComponentDoc, PropItem } from 'react-docgen-typescript';
import ts from 'typescript';
import { analyze, docOf, signatureOf, toRelative } from './source';
import type { Analysis, PublicExport } from './source';
import { readRecipeDocs } from './recipes';
import { backticked, bullets, codeBlocks, findSection, parseDoc } from './markdown';
import type {
  InheritedGroup,
  Manifest,
  ManifestComponent,
  ManifestFunction,
  ManifestMessage,
  ManifestProp,
  ManifestProvider,
  Related,
  Status,
  StoryEntry,
} from './types';

export interface BuildOptions {
  /** Loads a TypeScript module (messages files). Defaults to a native dynamic import (tsx/vite). */
  importModule?: (file: string) => Promise<unknown>;
  /** Called with non-fatal problems (missing doc, no props found...). */
  warn?: (message: string) => void;
}

const SCHEMA_URL = 'https://loui.dev/schemas/manifest.schema.json';
const STATUSES = new Set<string>(['experimental', 'stable', 'deprecated']);
/** Interfaces that only carry standard DOM attributes and events; summarized by count. */
const DOM_GENERIC = new Set([
  'HTMLAttributes',
  'DOMAttributes',
  'AriaAttributes',
  'AriaRole',
  'Attributes',
  'ClassAttributes',
  'RefAttributes',
  'GlobalDOMAttributes',
  'GlobalDOMEvents',
  'SVGAttributes',
  'ButtonHTMLAttributes',
  'InputHTMLAttributes',
  'AnchorHTMLAttributes',
  'TextareaHTMLAttributes',
  'LabelHTMLAttributes',
  'SelectHTMLAttributes',
  'ImgHTMLAttributes',
  'HTMLProps',
  'ProgressHTMLAttributes',
  'MeterHTMLAttributes',
]);

function readText(file: string): string {
  return readFileSync(file, 'utf8');
}

function unquote(value: string): string {
  return value.replace(/^["'`]|["'`]$/g, '');
}

function packageOf(fileName: string): string {
  const normalized = fileName.split('\\').join('/');
  const match = /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/.exec(
    normalized,
  );
  return match?.[1] ?? 'unknown';
}

/** Components exported by the package, with their props taken from react-docgen-typescript. */
function createParser(compilerOptions: ts.CompilerOptions) {
  return withCompilerOptions(compilerOptions, {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    savePropValueAsString: true,
    skipChildrenPropWithoutDoc: false,
  });
}

/**
 * Migration hint of a `@deprecated` tag in a prop description (react-docgen-typescript appends
 * the tags to the description). Returns undefined when the prop is not deprecated and an empty
 * string when the tag has no text. The hint runs until the next tag.
 */
export function deprecationOf(description: string): string | undefined {
  const match = /(?:^|\n)@deprecated\b[ \t]*([^\n]*(?:\n(?!@)[^\n]*)*)/.exec(description);
  if (!match) return undefined;
  return (match[1] ?? '').replace(/\s+/g, ' ').trim();
}

function convertProp(item: PropItem): ManifestProp {
  const members =
    item.type.name === 'enum' && Array.isArray(item.type.value)
      ? (item.type.value as { value: string }[]).map((v) => ({
          text: unquote(v.value),
          // Numeric literal members (`4`) are printed bare; string literals are quoted.
          numeric: v.value === unquote(v.value) && /^-?\d+(\.\d+)?$/.test(v.value),
        }))
      : undefined;
  const values = members ? [...new Set(members.map((m) => m.text))] : undefined;
  const literal = (m: { text: string; numeric: boolean }) => (m.numeric ? m.text : `'${m.text}'`);
  const type = members ? [...new Set(members.map(literal))].join(' | ') : item.type.name;
  const rawDefault = item.defaultValue
    ? String((item.defaultValue as { value: unknown }).value)
    : undefined;
  const defaultValue =
    rawDefault === undefined
      ? undefined
      : members?.some((m) => m.numeric && m.text === rawDefault)
        ? rawDefault
        : values?.includes(rawDefault)
          ? `'${rawDefault}'`
          : rawDefault;
  const deprecated = deprecationOf(item.description);
  return {
    name: item.name,
    type,
    required: item.required,
    ...(defaultValue === undefined ? {} : { default: defaultValue }),
    description: item.description.trim(),
    ...(values ? { values } : {}),
    ...(deprecated === undefined ? {} : { deprecated }),
  };
}

function splitProps(doc: ComponentDoc | undefined): {
  props: ManifestProp[];
  inherited: InheritedGroup[];
} {
  if (!doc) return { props: [], inherited: [] };
  const props: ManifestProp[] = [];
  const groups = new Map<string, { group: InheritedGroup; items: PropItem[] }>();
  for (const item of Object.values(doc.props)) {
    const fileName = item.parent?.fileName ?? '';
    if (!item.parent || !fileName.includes('node_modules')) {
      props.push(convertProp(item));
      continue;
    }
    const iface = item.parent.name;
    const source = packageOf(fileName);
    const key = `${source}::${iface}`;
    let entry = groups.get(key);
    if (!entry) {
      entry = {
        group: {
          source,
          interface: iface,
          domGeneric: DOM_GENERIC.has(iface) || source === '@types/react',
          count: 0,
        },
        items: [],
      };
      groups.set(key, entry);
    }
    entry.group.count += 1;
    entry.items.push(item);
  }
  const inherited = [...groups.values()]
    .map(({ group, items }) => {
      if (group.domGeneric) return group;
      return {
        ...group,
        props: items
          .map((item) => ({
            name: item.name,
            type: convertProp(item).type,
            required: item.required,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    })
    .sort(
      (a, b) =>
        Number(a.domGeneric) - Number(b.domGeneric) || a.interface.localeCompare(b.interface),
    );
  props.sort((a, b) => Number(b.required) - Number(a.required));
  return { props, inherited };
}

// --- Messages ---------------------------------------------------------------------------------

interface MessagesInfo {
  locales: string[];
  keys: ManifestMessage[];
}

function messageDescriptions(
  file: string,
): Map<string, { description?: string; signature?: string }> {
  const result = new Map<string, { description?: string; signature?: string }>();
  const source = ts.createSourceFile(
    file,
    readText(file),
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );
  const visit = (node: ts.Node): void => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'en' &&
      ts.isObjectLiteralExpression(node.initializer) &&
      result.size === 0
    ) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) continue;
        const key =
          ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : undefined;
        if (key === undefined) continue;
        const comments = ts
          .getJSDocCommentsAndTags(prop)
          .filter((c): c is ts.JSDoc => ts.isJSDoc(c))
          .map((c) => ts.getTextOfJSDocComment(c.comment) ?? '')
          .join(' ')
          .trim();
        const initializer = ts.isPropertyAssignment(prop) ? prop.initializer : undefined;
        const signature =
          initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
            ? `(${initializer.parameters.map((p) => p.getText(source)).join(', ')})`
            : undefined;
        result.set(key, {
          ...(comments ? { description: comments } : {}),
          ...(signature ? { signature } : {}),
        });
      }
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}

function sampleArgs(signature: string): unknown[] {
  const inner = signature.slice(1, -1).trim();
  if (inner === '') return [];
  return inner.split(',').map((param) => {
    const [name = '', type = ''] = param.split(':').map((s) => s.trim());
    if (type === 'string') return `{${name}}`;
    if (type === 'number') return 2;
    return undefined;
  });
}

async function loadMessages(
  file: string,
  importModule: (file: string) => Promise<unknown>,
): Promise<MessagesInfo | undefined> {
  const mod = (await importModule(file)) as {
    messages?: Record<string, Record<string, unknown> | undefined>;
  };
  const catalog = mod.messages;
  const en = catalog?.['en'];
  if (!catalog || !en) return undefined;
  const meta = messageDescriptions(file);
  const keys: ManifestMessage[] = Object.entries(en).map(([key, value]) => {
    const info = meta.get(key);
    if (typeof value === 'function') {
      let example: string | undefined;
      try {
        const out: unknown = (value as (...args: unknown[]) => unknown)(
          ...sampleArgs(info?.signature ?? '()'),
        );
        if (typeof out === 'string') example = out;
      } catch {
        example = undefined;
      }
      return {
        key,
        kind: 'function',
        ...(example === undefined ? {} : { default: example }),
        ...(info?.signature ? { signature: info.signature } : {}),
        ...(info?.description ? { description: info.description } : {}),
      };
    }
    return {
      key,
      kind: 'string',
      default: String(value),
      ...(info?.description ? { description: info.description } : {}),
    };
  });
  return { locales: Object.keys(catalog).filter((l) => catalog[l] !== undefined), keys };
}

// --- Stories ----------------------------------------------------------------------------------

function sanitizeId(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function unwrap(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isSatisfiesExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyOf(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.ObjectLiteralElementLike | undefined {
  return object.properties.find(
    (p) =>
      p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === name,
  );
}

function parseStories(
  file: string,
): { title: string; tags: string[]; items: StoryEntry[] } | undefined {
  const source = ts.createSourceFile(
    file,
    readText(file),
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );
  let title = '';
  let tags: string[] = [];
  const exported: { name: string; initializer: ts.Expression | undefined; description: string }[] =
    [];
  const topLevelObjects = new Map<string, ts.ObjectLiteralExpression>();
  let metaName: string | undefined;

  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      const isExport =
        statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const init = declaration.initializer ? unwrap(declaration.initializer) : undefined;
        if (init && ts.isObjectLiteralExpression(init))
          topLevelObjects.set(declaration.name.text, init);
        if (isExport) {
          const description = ts
            .getJSDocCommentsAndTags(statement)
            .filter((c): c is ts.JSDoc => ts.isJSDoc(c))
            .map((c) => ts.getTextOfJSDocComment(c.comment) ?? '')
            .join(' ')
            .trim();
          exported.push({ name: declaration.name.text, initializer: init, description });
        }
      }
    } else if (ts.isExportAssignment(statement)) {
      const expression = unwrap(statement.expression);
      if (ts.isIdentifier(expression)) metaName = expression.text;
      else if (ts.isObjectLiteralExpression(expression)) topLevelObjects.set('default', expression);
    }
  }
  const meta = topLevelObjects.get(metaName ?? 'default') ?? topLevelObjects.get('meta');
  if (!meta) return undefined;
  const titleProp = propertyOf(meta, 'title');
  if (
    titleProp &&
    ts.isPropertyAssignment(titleProp) &&
    ts.isStringLiteralLike(titleProp.initializer)
  ) {
    title = titleProp.initializer.text;
  }
  const tagsProp = propertyOf(meta, 'tags');
  if (
    tagsProp &&
    ts.isPropertyAssignment(tagsProp) &&
    ts.isArrayLiteralExpression(tagsProp.initializer)
  ) {
    tags = tagsProp.initializer.elements.filter(ts.isStringLiteralLike).map((e) => e.text);
  }
  const items: StoryEntry[] = exported
    .filter((e) => e.name !== (metaName ?? 'meta'))
    .map((e) => ({
      name: e.name,
      id: `${sanitizeId(title)}--${sanitizeId(e.name)}`,
      ...(e.description ? { description: e.description } : {}),
      hasPlay:
        e.initializer && ts.isObjectLiteralExpression(e.initializer)
          ? propertyOf(e.initializer, 'play') !== undefined
          : false,
    }));
  return { title, tags, items };
}

// --- Misc helpers -----------------------------------------------------------------------------

function cssVariables(folderAbs: string): string[] {
  const vars = new Set<string>();
  for (const file of readdirSync(folderAbs).filter((f) => f.endsWith('.module.css'))) {
    for (const match of readText(path.join(folderAbs, file)).matchAll(
      /var\(\s*(--ds-[a-z0-9-]+)/gi,
    )) {
      if (match[1]) vars.add(match[1]);
    }
  }
  return [...vars].sort();
}

function importedComponents(file: string, componentNames: Set<string>): string[] {
  const source = ts.createSourceFile(
    file,
    readText(file),
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );
  const used = new Set<string>();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    if (!statement.moduleSpecifier.text.startsWith('../')) continue;
    if (statement.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const original = (element.propertyName ?? element.name).text;
        if (componentNames.has(original)) used.add(original);
      }
    }
  }
  return [...used].sort();
}

function statusFrom(
  tags: Map<string, string>,
  docStatus: string | undefined,
): { status: Status; source: 'jsdoc' | 'doc' | 'default' } {
  if (tags.has('deprecated')) return { status: 'deprecated', source: 'jsdoc' };
  const tag = tags.get('status')?.toLowerCase();
  if (tag && STATUSES.has(tag)) return { status: tag as Status, source: 'jsdoc' };
  if (docStatus && STATUSES.has(docStatus)) return { status: docStatus as Status, source: 'doc' };
  return { status: 'experimental', source: 'default' };
}

function providerKeys(sourceText: string): string[] {
  return [...sourceText.matchAll(/useMessages\(\s*'([A-Za-z]+)'/g)].map((m) => m[1] ?? '');
}

// --- Public API -------------------------------------------------------------------------------

export async function buildManifest(root: string, options: BuildOptions = {}): Promise<Manifest> {
  const warn = options.warn ?? (() => undefined);
  const importModule =
    options.importModule ??
    ((file: string) => import(pathToFileURL(file).href) as Promise<unknown>);
  const analysis: Analysis = analyze(root);
  const { checker } = analysis;
  const pkg = JSON.parse(readText(path.join(root, 'package.json'))) as {
    name: string;
    version: string;
  };
  const parser = createParser(analysis.compilerOptions);
  const docgenCache = new Map<string, ComponentDoc[]>();
  const docgen = (file: string): ComponentDoc[] => {
    let docs = docgenCache.get(file);
    if (!docs) {
      docs = parser.parse(path.join(root, file));
      docgenCache.set(file, docs);
    }
    return docs;
  };

  const exportsByKind = (kind: PublicExport['kind']) =>
    analysis.exports.filter((e) => e.kind === kind);
  const componentExports = exportsByKind('component');
  const componentNames = new Set(componentExports.map((e) => e.name));

  const components: ManifestComponent[] = [];
  for (const exp of componentExports) {
    const folderRel = path.posix.dirname(exp.sourceFile);
    const folderName = path.posix.basename(folderRel);
    const folderAbs = path.join(root, folderRel);
    const { text, tags } = docOf(checker, exp.symbol);
    const docPath = path.join(folderAbs, `${folderName}.md`);
    const parsedDoc = existsSync(docPath) ? parseDoc(readText(docPath)) : undefined;
    const { status, source: statusSource } = statusFrom(tags, parsedDoc?.status);
    const doc = docgen(exp.sourceFile).find((d) => d.displayName === exp.name);
    if (!doc) warn(`${exp.name}: react-docgen-typescript found no props in ${exp.sourceFile}`);
    const { props, inherited } = splitProps(doc);

    const variants: ManifestComponent['variants'] = {};
    for (const key of ['variant', 'size', 'tone'] as const) {
      const values = props.find((p) => p.name === key)?.values;
      if (values) variants[key] = values;
    }

    const sourceText = readText(path.join(root, exp.sourceFile));
    const keys = [...new Set(providerKeys(sourceText))];
    let messages: ManifestComponent['messages'];
    const messagesFile = path.join(folderAbs, `${folderName}.messages.ts`);
    const hasMessagesProp = props.some((p) => p.name === 'messages');
    if (existsSync(messagesFile) && (exp.name === folderName || hasMessagesProp)) {
      const info = await loadMessages(messagesFile, importModule);
      if (info) {
        const providerKey = keys[0];
        messages = { ...(providerKey ? { providerKey } : {}), ...info };
      }
    }

    const storyFiles = readdirSync(folderAbs).filter((f) => f.endsWith('.stories.tsx'));
    const stories: ManifestComponent['stories'] = { title: '', tags: [], items: [] };
    for (const file of storyFiles) {
      const parsed = parseStories(path.join(folderAbs, file));
      if (!parsed) continue;
      stories.title = stories.title || parsed.title;
      stories.tags = [...new Set([...stories.tags, ...parsed.tags])];
      stories.items.push(...parsed.items);
    }

    let docs: ManifestComponent['docs'] = null;
    if (parsedDoc) {
      const section = (...ids: string[]) => findSection(parsedDoc.sections, ...ids);
      const keyboardSection = section('keyboard');
      const a11y = section('accessibility');
      const keyPattern =
        /`(?:Enter|Space|Tab|Shift\+Tab|Esc(?:ape)?|Arrow\w*|Home|End|PageUp|PageDown|Backspace|Delete|[←→↑↓])[^`]*`/;
      const keyboard = keyboardSection
        ? bullets(keyboardSection.content)
        : bullets(a11y?.content ?? '').filter((b) => keyPattern.test(b));
      docs = {
        path: toRelative(root, docPath),
        summary: parsedDoc.summary,
        whenToUse: bullets(section('when-to-use')?.content ?? ''),
        whenNotToUse: bullets(section('when-not-to-use')?.content ?? ''),
        keyboard,
        examples: codeBlocks(section('examples')?.content ?? '')
          .filter((b) => ['tsx', 'jsx', 'ts'].includes(b.lang))
          .map((b) => b.code),
        sections: parsedDoc.sections,
      };
    }

    const alternatives: Related['alternatives'] = [];
    for (const item of docs?.whenNotToUse ?? []) {
      for (const name of backticked(item)) {
        if (
          name !== exp.name &&
          componentNames.has(name) &&
          !alternatives.some((a) => a.name === name)
        ) {
          alternatives.push({ name, reason: item });
        }
      }
    }
    const uses = importedComponents(path.join(root, exp.sourceFile), componentNames).filter(
      (n) => n !== exp.name,
    );

    components.push({
      name: exp.name,
      kind: 'component',
      entryPoint: exp.entryPoint,
      importStatement: `import { ${exp.name} } from '${exp.entryPoint}';`,
      folder: folderRel,
      sourceFile: exp.sourceFile,
      status,
      statusSource,
      description: text || (doc?.description ?? '').trim(),
      props,
      inheritedProps: inherited,
      variants,
      ...(messages ? { messages } : {}),
      cssVariables: cssVariables(folderAbs),
      stories,
      docs,
      related: { alternatives, uses, usedBy: [] },
    });
  }
  for (const component of components) {
    component.related.usedBy = components
      .filter((other) => other.related.uses.includes(component.name))
      .map((other) => other.name)
      .sort();
  }

  const providers: ManifestProvider[] = exportsByKind('provider').map((exp) => {
    const { text, tags } = docOf(checker, exp.symbol);
    const doc = docgen(exp.sourceFile).find((d) => d.displayName === exp.name);
    return {
      name: exp.name,
      kind: 'provider',
      entryPoint: exp.entryPoint,
      importStatement: `import { ${exp.name} } from '${exp.entryPoint}';`,
      sourceFile: exp.sourceFile,
      status: statusFrom(tags, undefined).status,
      description: text,
      props: splitProps(doc).props,
      docs: 'docs/guides/getting-started.md',
    };
  });

  const toFunction = (exp: PublicExport, kind: ManifestFunction['kind']): ManifestFunction => {
    const { text } = docOf(checker, exp.symbol);
    const sig = signatureOf(checker, exp.symbol, exp.declaration);
    return {
      name: exp.name,
      kind,
      entryPoint: exp.entryPoint,
      importStatement: `import { ${exp.name} } from '${exp.entryPoint}';`,
      sourceFile: exp.sourceFile,
      description: text,
      signature: kind === 'constant' ? sig.signature : `${exp.name}${sig.signature}`,
      params: sig.params,
      returns: sig.returns,
      docs: exp.sourceFile.startsWith('src/i18n/')
        ? 'docs/architecture/i18n.md'
        : 'docs/architecture/utilities.md',
    };
  };
  const hooks = exportsByKind('hook').map((e) => toFunction(e, 'hook'));
  const utilities = [
    ...exportsByKind('utility').map((e) => toFunction(e, 'utility')),
    ...exportsByKind('constant').map((e) => toFunction(e, 'constant')),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const iconNames = exportsByKind('icon').map((e) => e.name);
  const recipes = readRecipeDocs(root);

  return {
    $schema: SCHEMA_URL,
    schemaVersion: 1,
    package: { name: pkg.name, version: pkg.version },
    generator: 'scripts/manifest/build.ts',
    entryPoints: [
      {
        path: '.',
        importPath: 'loui-ds',
        description: 'Core components, hooks, i18n and utilities.',
      },
      {
        path: './patterns',
        importPath: 'loui-ds/patterns',
        description: 'Domain patterns (generic names). Empty until patterns land.',
      },
      {
        path: './styles.css',
        importPath: 'loui-ds/styles.css',
        description: 'Layered CSS: tokens (--ds-*), base and every component.',
      },
    ],
    counts: {
      components: components.length,
      hooks: hooks.length,
      utilities: utilities.length,
      icons: iconNames.length,
      recipes: recipes.length,
    },
    components,
    recipes: recipes.map(({ name, description, status, doc }) => ({
      name,
      description,
      status,
      doc,
    })),
    providers,
    hooks,
    utilities,
    icons: {
      entryPoint: 'loui-ds',
      source: 'lucide-react',
      description:
        'Bundled Lucide icons, exported with an `Icon` suffix. Pass one to `Icon`, `IconButton` or a `leading`/`trailing` slot. Decorative unless labelled.',
      names: iconNames,
    },
    reexports: exportsByKind('reexport').map((e) => ({ name: e.name, from: e.from ?? '' })),
  };
}
