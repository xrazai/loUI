import { loadManifest } from './manifest.js';
import { localName } from './ast.js';

const DEFAULT_PACKAGES = ['loui-ds'];

function isDsSource(source, packages) {
  return packages.some((p) => source === p || source.startsWith(`${p}/`));
}

const resolvers = new WeakMap();

/**
 * Resolves JSX element names to design system component names.
 *
 * An element belongs to the design system when its identifier is imported from `loui-ds` (or
 * `loui-ds/*`; configurable with `settings.loui.packages`), or from a relative path under a name
 * that exists in the manifest (that is how the DS repo's own stories import components).
 * Namespace imports (`import * as DS from 'loui-ds'`, `<DS.Button>`) are supported.
 */
export function getDsResolver(context) {
  const sourceCode = context.sourceCode;
  const cached = resolvers.get(sourceCode);
  if (cached) return cached;

  const packages = context.settings?.loui?.packages ?? DEFAULT_PACKAGES;
  const manifest = loadManifest(context);
  const imports = new Map();
  for (const node of sourceCode.ast.body) {
    if (node.type !== 'ImportDeclaration' || node.importKind === 'type') continue;
    const source = String(node.source.value);
    const ds = isDsSource(source, packages);
    const relative = source.startsWith('.');
    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportSpecifier') {
        if (specifier.importKind === 'type') continue;
        const imported = specifier.imported.name ?? specifier.imported.value;
        if (ds || (relative && manifest.components.has(imported))) {
          imports.set(specifier.local.name, { name: imported, namespace: false });
        }
      } else if (specifier.type === 'ImportNamespaceSpecifier' && ds) {
        imports.set(specifier.local.name, { name: null, namespace: true });
      }
    }
  }

  const resolver = {
    manifest,
    /** The design system component name of an opening element, or null. */
    nameOf(opening) {
      const { root, member } = localName(opening);
      if (root === null) return null;
      const entry = imports.get(root);
      if (!entry) return null;
      if (entry.namespace) return member;
      return entry.name;
    },
  };
  resolvers.set(sourceCode, resolver);
  return resolver;
}
