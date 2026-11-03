/**
 * Sample codemod: rename a prop of a design system component.
 *
 *   pnpm codemod rename-prop src --component=Button --from=legacyTone --to=variant
 *
 * Only elements whose component is imported from `@loui/ds` or `@loui/ds/patterns` (also under
 * an alias, `import { Button as B }`) are touched. A prop is left alone, and a warning is
 * reported, when the element already has the target prop. Namespace imports (`DS.Button`) are not
 * handled.
 */
import type { API, FileInfo, Options } from 'jscodeshift';

export const parser = 'tsx';

export const PACKAGES = ['@loui/ds', '@loui/ds/patterns'];

type J = API['jscodeshift'];
type Root = ReturnType<J>;

/** Local names under which `component` is imported from the design system in this file. */
export function localNames(
  j: J,
  root: Root,
  component: string,
  packages: string[] = PACKAGES,
): Set<string> {
  const names = new Set<string>();
  root.find(j.ImportDeclaration).forEach((declaration) => {
    const source = declaration.node.source.value;
    if (typeof source !== 'string' || !packages.includes(source)) return;
    for (const specifier of declaration.node.specifiers ?? []) {
      if (specifier.type !== 'ImportSpecifier') continue;
      const imported = specifier.imported.name as string;
      if (imported !== component) continue;
      names.add((specifier.local?.name ?? imported) as string);
    }
  });
  return names;
}

/** Renames `from` to `to` on the given local element names. Returns the number of renames. */
export function renameProp(
  j: J,
  root: Root,
  locals: Set<string>,
  from: string,
  to: string,
  warn: (message: string) => void = () => undefined,
): number {
  let count = 0;
  root.find(j.JSXOpeningElement).forEach((element) => {
    const name = element.node.name;
    if (name.type !== 'JSXIdentifier' || !locals.has(name.name)) return;
    const attributes = element.node.attributes ?? [];
    const named = (n: string) =>
      attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === n,
      );
    const attribute = named(from);
    if (attribute?.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') return;
    if (named(to)) {
      warn(`<${name.name}> already has "${to}"; left "${from}" for manual review.`);
      return;
    }
    attribute.name.name = to;
    count += 1;
  });
  return count;
}

export default function transform(file: FileInfo, api: API, options: Options): string | undefined {
  const { component, from, to } = options as { component?: string; from?: string; to?: string };
  if (!component || !from || !to) {
    throw new Error('rename-prop needs --component, --from and --to.');
  }
  const j = api.jscodeshift;
  const root = j(file.source);
  const locals = localNames(j, root, component);
  if (locals.size === 0) return undefined;
  const count = renameProp(j, root, locals, from, to, (message) => {
    (api as Partial<API>).report?.(`${file.path}: ${message}`);
  });
  return count > 0 ? root.toSource() : undefined;
}
