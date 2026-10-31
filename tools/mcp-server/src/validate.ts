import { ESLint, type Linter, type Rule } from 'eslint';
import loui from 'eslint-plugin-loui';
import tseslint from 'typescript-eslint';
import { suggest } from './data.ts';
import type { DsData } from './data.ts';
import type { Manifest, ManifestEntry } from './types.ts';

export interface Finding {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fix: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: number;
  warnings: number;
  findings: Finding[];
}

/** Minimal shape of the ESTree nodes the rule reads. */
interface N {
  type: string;
  name?: string | N;
  value?: unknown;
  source?: { value: unknown };
  importKind?: string;
  specifiers?: N[];
  imported?: N;
  local?: N;
  attributes?: N[];
  children?: N[];
  expression?: N;
  quasis?: { value: { cooked: string } }[];
  expressions?: N[];
  object?: N;
  property?: N;
  parent?: N;
}

const PACKAGE_RE = /^@loui\/ds(\/patterns)?$/;

const FIXES: Record<string, string> = {
  'loui/no-raw-colors':
    'Use a semantic color token: var(--ds-text), var(--ds-surface), var(--ds-line), ... Find one with search_tokens (type "color"). For SVG use currentColor.',
  'loui/no-raw-spacing':
    'Use var(--ds-space-N) or the spacing props of a layout component (Stack gap). Find tokens with search_tokens (type "dimension").',
  'loui/one-primary-action':
    'Keep one Button variant="primary" per screen (top right). Make the others secondary or ghost.',
  'loui/icon-button-label':
    'Give the IconButton (or Icon) a short accessible name: label="Close panel". It becomes aria-label.',
  'loui/no-deprecated':
    'Replace the deprecated component or prop with the alternative named in get_component.',
  'loui/allowed-icons':
    'Use an icon from the curated set. The manifest lists it under icons.names (get_component Icon).',
  'loui/content-rules':
    'Rewrite the text per the content rules: sentence case, verb + object on buttons, no "!" or emoji. Call get_guidelines with topic "content".',
  'loui/no-inline-style-visual':
    'Remove visual inline styles (colors, borders, shadows, radius). Use component props and tokens; only layout values may be inline.',
  'loui-mcp/unknown-export':
    'This name is not exported by @loui/ds. Call list_components to find the right one and copy its import statement.',
  'loui-mcp/missing-import':
    'Import the component from @loui/ds (get_component returns the exact import statement).',
  'loui-mcp/missing-required-prop':
    'Add the required prop. get_component lists every prop with its type and description.',
  'loui-mcp/invalid-prop-value':
    'Use one of the allowed values listed in get_component for this prop.',
};

function nameOf(node: N | undefined): string | null {
  if (!node) return null;
  if (node.type === 'JSXIdentifier' || node.type === 'Identifier') return node.name as string;
  return null;
}

function stringValue(node: N | undefined): string | null {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'JSXExpressionContainer') return stringValue(node.expression);
  if (node.type === 'TemplateLiteral' && node.expressions?.length === 0) {
    return node.quasis?.[0]?.value.cooked ?? null;
  }
  return null;
}

function createUsageRule(manifest: Manifest, entries: ManifestEntry[]): Rule.RuleModule {
  const exported = new Map<string, ManifestEntry | null>();
  for (const entry of entries) exported.set(entry.name, entry);
  for (const icon of manifest.icons?.names ?? []) exported.set(icon, null);
  for (const re of manifest.reexports ?? []) exported.set(re.name, null);
  const allNames = [...exported.keys()];

  return {
    meta: { type: 'problem', schema: [], messages: {} },
    create(context) {
      const sourceCode = context.sourceCode;
      /** local name -> exported DS name, or `*` for a namespace import. */
      const locals = new Map<string, string>();
      const report = (node: N, ruleId: string, message: string) => {
        const loc = (node as unknown as { loc: NonNullable<Rule.Node['loc']> }).loc;
        context.report({ loc, message: `${ruleId}|${message}` });
      };
      const unknown = (node: N, name: string, source: string) => {
        const hints = suggest(name, allNames);
        report(
          node,
          'loui-mcp/unknown-export',
          `"${name}" is not exported by ${source}.${hints.length ? ` Did you mean ${hints.join(', ')}?` : ''}`,
        );
      };
      const isDeclared = (node: N, name: string): boolean => {
        let scope: ReturnType<typeof sourceCode.getScope> | null = sourceCode.getScope(
          node as unknown as Rule.Node,
        );
        while (scope) {
          if (scope.set.has(name)) return true;
          scope = scope.upper;
        }
        return false;
      };

      return {
        ImportDeclaration(raw) {
          const node = raw as unknown as N;
          const source = node.source?.value;
          if (typeof source !== 'string' || !PACKAGE_RE.test(source)) return;
          if (node.importKind === 'type') return;
          for (const spec of node.specifiers ?? []) {
            if (spec.type === 'ImportNamespaceSpecifier') {
              const local = nameOf(spec.local);
              if (local) locals.set(local, '*');
              continue;
            }
            if (spec.type !== 'ImportSpecifier' || spec.importKind === 'type') continue;
            const imported = nameOf(spec.imported) ?? (spec.imported?.value as string | undefined);
            const local = nameOf(spec.local);
            if (!imported || !local) continue;
            if (!exported.has(imported)) {
              unknown(spec, imported, source);
              continue;
            }
            locals.set(local, imported);
          }
        },
        JSXOpeningElement(raw: Rule.Node) {
          const node = raw as unknown as N;
          const nameNode = node.name as N;
          let exportName: string | null = null;
          if (nameNode.type === 'JSXIdentifier') {
            const local = nameNode.name as string;
            const mapped = locals.get(local);
            if (mapped && mapped !== '*') exportName = mapped;
            else if (!mapped && /^[A-Z]/.test(local) && !isDeclared(node, local)) {
              const entry = exported.get(local);
              if (entry) {
                report(
                  nameNode,
                  'loui-mcp/missing-import',
                  `<${local}> is used but not imported. It is exported by ${entry.entryPoint}: ${entry.importStatement}`,
                );
              }
              return;
            }
          } else if (nameNode.type === 'JSXMemberExpression') {
            const objectName = nameOf(nameNode.object);
            const prop = nameOf(nameNode.property);
            if (objectName && prop && locals.get(objectName) === '*') {
              if (!exported.has(prop)) {
                unknown(nameNode, prop, '@loui/ds');
                return;
              }
              exportName = prop;
            }
          }
          if (!exportName) return;
          const entry = exported.get(exportName);
          if (!entry?.props) return;

          const attrs = node.attributes ?? [];
          const hasSpread = attrs.some((a) => a.type === 'JSXSpreadAttribute');
          const given = new Map<string, N>();
          for (const attr of attrs) {
            if (attr.type === 'JSXAttribute') {
              const attrName = nameOf(attr.name as N);
              if (attrName) given.set(attrName, attr);
            }
          }
          if (!hasSpread) {
            const parent = node.parent;
            const hasChildren = (parent?.children ?? []).some(
              (c) => !(c.type === 'JSXText' && String(c.value).trim() === ''),
            );
            for (const prop of entry.props) {
              if (!prop.required || prop.name === 'ref') continue;
              if (given.has(prop.name)) continue;
              if (prop.name === 'children' && hasChildren) continue;
              report(
                nameNode,
                'loui-mcp/missing-required-prop',
                `<${exportName}> requires the "${prop.name}" prop${prop.type ? ` (${prop.type})` : ''}.`,
              );
            }
          }
          for (const [attrName, attr] of given) {
            const prop = entry.props.find((p) => p.name === attrName);
            if (!prop?.values?.length) continue;
            const value = stringValue(attr.value as N | undefined);
            if (value !== null && !prop.values.includes(value)) {
              report(
                attr,
                'loui-mcp/invalid-prop-value',
                `<${exportName} ${attrName}="${value}"> is not allowed. Use one of: ${prop.values.join(', ')}.`,
              );
            }
          }
        },
      };
    },
  };
}

const eslintCache = new WeakMap<DsData, ESLint>();

function getEslint(data: DsData): ESLint {
  const cached = eslintCache.get(data);
  if (cached) return cached;
  const usage = createUsageRule(data.manifest, data.entries);
  const loui_settings: Record<string, unknown> = { manifest: data.manifest };
  if (data.contentRules) loui_settings['contentRules'] = data.contentRules;
  const baseConfig: Linter.Config[] = [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
      },
      plugins: { 'loui-mcp': { rules: { usage } } },
      settings: { loui: loui_settings },
      rules: { 'loui-mcp/usage': 'error' },
    },
    loui.configs.recommended,
  ];
  const eslint = new ESLint({ overrideConfigFile: true, baseConfig, cwd: process.cwd() });
  eslintCache.set(data, eslint);
  return eslint;
}

/**
 * Lints a TSX snippet in memory with `eslint-plugin-loui` (recommended) plus three manifest
 * checks: imported names exist, required props are present, literal prop values are allowed.
 */
export async function validateSnippet(
  data: DsData,
  code: string,
  filename = 'snippet.tsx',
): Promise<ValidationResult> {
  const eslint = getEslint(data);
  const [result] = await eslint.lintText(code, { filePath: filename });
  const findings: Finding[] = (result?.messages ?? []).map((m) => {
    let ruleId = m.ruleId ?? 'parse-error';
    let message = m.message;
    if (ruleId === 'loui-mcp/usage') {
      const [id, ...rest] = message.split('|');
      ruleId = id ?? ruleId;
      message = rest.join('|');
    }
    return {
      ruleId,
      severity: m.severity === 2 ? ('error' as const) : ('warning' as const),
      message,
      line: m.line,
      column: m.column,
      ...(m.endLine === undefined ? {} : { endLine: m.endLine }),
      ...(m.endColumn === undefined ? {} : { endColumn: m.endColumn }),
      fix:
        FIXES[ruleId] ??
        (ruleId === 'parse-error'
          ? 'Fix the syntax error first; the snippet must be valid TSX.'
          : ''),
    };
  });
  findings.sort((a, b) => a.line - b.line || a.column - b.column);
  const errors = findings.filter((f) => f.severity === 'error').length;
  return { ok: errors === 0, errors, warnings: findings.length - errors, findings };
}
