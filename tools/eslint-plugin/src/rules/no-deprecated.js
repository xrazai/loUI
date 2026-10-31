import { getDsResolver } from '../utils/ds.js';
import { createRule } from '../utils/rule.js';

function propDeprecation(prop) {
  if (!prop) return null;
  if (typeof prop.deprecated === 'string') return prop.deprecated;
  if (prop.deprecated === true || prop.status === 'deprecated') return '';
  const match = /@deprecated\b\s*(.*)/.exec(prop.description ?? '');
  return match ? match[1].trim() : null;
}

export default createRule('no-deprecated', {
  description:
    'Warn about design system components and props that the manifest marks as deprecated.',
  messages: {
    component:
      '{{name}} is deprecated.{{hint}} Never use deprecated components (AGENTS.md section 13).',
    prop: 'The {{prop}} prop of {{name}} is deprecated.{{hint}}',
  },
  schema: [
    {
      type: 'object',
      properties: {
        deprecatedComponents: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description:
            'Extra deprecated components: name to migration hint. Merged with the manifest.',
        },
        deprecatedProps: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Extra deprecated props as "Component.prop": migration hint.',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ deprecatedComponents: {}, deprecatedProps: {} }],
  create(context, options) {
    const ds = getDsResolver(context);
    const hint = (text) => (text ? ` ${text}` : '');

    return {
      JSXOpeningElement(node) {
        const name = ds.nameOf(node);
        if (!name) return;
        const entry = ds.manifest.components.get(name);

        if (name in options.deprecatedComponents || entry?.status === 'deprecated') {
          const migration = options.deprecatedComponents[name] ?? '';
          context.report({
            node: node.name,
            messageId: 'component',
            data: { name, hint: hint(migration) },
          });
          return;
        }

        for (const attribute of node.attributes) {
          if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier')
            continue;
          const prop = attribute.name.name;
          let migration = options.deprecatedProps[`${name}.${prop}`] ?? null;
          if (migration === null && entry) {
            const found = [...(entry.props ?? []), ...(entry.inheritedProps ?? [])].find(
              (p) => p.name === prop,
            );
            migration = propDeprecation(found);
          }
          if (migration !== null) {
            context.report({
              node: attribute,
              messageId: 'prop',
              data: { name, prop, hint: hint(migration) },
            });
          }
        }
      },
    };
  },
});
