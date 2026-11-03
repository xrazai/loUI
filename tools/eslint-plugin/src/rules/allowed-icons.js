import { getDsResolver } from '../utils/ds.js';
import { createRule } from '../utils/rule.js';

/** Old or alternative Lucide names that map onto the curated set. */
const ALIASES = {
  Loader2: 'LoaderIcon',
  LoaderCircle: 'LoaderIcon',
  AlertCircle: 'CircleAlertIcon',
  CheckCircle: 'CircleCheckIcon',
  XCircle: 'CircleXIcon',
  AlertTriangle: 'TriangleAlertIcon',
  MoreHorizontal: 'EllipsisIcon',
};

function curatedName(imported, icons) {
  if (ALIASES[imported]) return ALIASES[imported];
  const base = imported.replace(/^Lucide/, '').replace(/Icon$/, '');
  const candidate = `${base}Icon`;
  return icons.has(candidate) ? candidate : null;
}

function matches(source, sources) {
  return sources.some((s) => source === s || source.startsWith(`${s}/`));
}

export default createRule('allowed-icons', {
  description:
    'Warn about direct lucide-react imports in app code; icons come from the curated set exported by loui-ds.',
  messages: {
    useCurated:
      'Import {{curated}} from "{{from}}" instead of {{name}} from lucide-react. Only the curated icon set is part of the design system (ICON-003).',
    notCurated:
      '{{name}} is not in the curated icon set. Use one of the icons exported by "{{from}}", or ask for it to be added to the set (ICON-003).',
    namespace:
      'Do not import all of lucide-react. Import icons from "{{from}}" (curated set, ICON-003).',
  },
  schema: [
    {
      type: 'object',
      properties: {
        sources: {
          type: 'array',
          items: { type: 'string' },
          description: 'Module names treated as raw icon libraries. Default ["lucide-react"].',
        },
        from: {
          type: 'string',
          description: 'Module the curated icons come from. Default "loui-ds".',
        },
        allow: {
          type: 'array',
          items: { type: 'string' },
          description: 'Imported names that may still come from the library.',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ sources: ['lucide-react'], from: 'loui-ds', allow: [] }],
  create(context, options) {
    const ds = getDsResolver(context);
    const allow = new Set(options.allow);
    return {
      ImportDeclaration(node) {
        if (node.importKind === 'type' || !matches(String(node.source.value), options.sources))
          return;
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            context.report({
              node: specifier,
              messageId: 'namespace',
              data: { from: options.from },
            });
            continue;
          }
          if (specifier.importKind === 'type') continue;
          const name =
            specifier.type === 'ImportDefaultSpecifier'
              ? 'default'
              : (specifier.imported.name ?? specifier.imported.value);
          if (allow.has(name)) continue;
          const curated = curatedName(name, ds.manifest.icons);
          context.report({
            node: specifier,
            messageId: curated ? 'useCurated' : 'notCurated',
            data: { name, curated: curated ?? '', from: options.from },
          });
        }
      },
    };
  },
});
