import { keyName, styleObject } from '../utils/ast.js';
import { getDsResolver } from '../utils/ds.js';
import { createRule } from '../utils/rule.js';

export default createRule('no-inline-style-visual', {
  description:
    'Disallow style props on design system components that set visual properties directly; only --ds-* custom properties are allowed.',
  messages: {
    visual:
      '{{component}} must not receive the visual property "{{property}}" through `style`. Pass a --ds-* custom property, or use the component props (ADR-0002 amendment, AGENTS.md section 9).',
    prefix:
      'Custom property "{{property}}" on {{component}} should start with "{{prefix}}" (AGENTS.md section 9).',
  },
  schema: [
    {
      type: 'object',
      properties: {
        allowProperties: {
          type: 'array',
          items: { type: 'string' },
          description: 'Style properties that may be set directly, for example ["width"].',
        },
        customPropertyPrefix: {
          type: 'string',
          description:
            'When set, custom properties must start with this prefix (for example "--ds-"). Default "--" (any custom property).',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ allowProperties: [], customPropertyPrefix: '--' }],
  create(context, options) {
    const ds = getDsResolver(context);
    const allowed = new Set(options.allowProperties);
    return {
      JSXOpeningElement(node) {
        const component = ds.nameOf(node);
        if (!component) return;
        for (const attribute of node.attributes) {
          const object = styleObject(attribute);
          if (!object) continue;
          for (const property of object.properties) {
            const key = keyName(property);
            if (key === null) continue;
            if (key.startsWith('--')) {
              if (!key.startsWith(options.customPropertyPrefix)) {
                context.report({
                  node: property.key,
                  messageId: 'prefix',
                  data: { component, property: key, prefix: options.customPropertyPrefix },
                });
              }
            } else if (!allowed.has(key)) {
              context.report({
                node: property.key,
                messageId: 'visual',
                data: { component, property: key },
              });
            }
          }
        }
      },
    };
  },
});
