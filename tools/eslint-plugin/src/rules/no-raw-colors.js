import { collectStrings, keyName, styleObject } from '../utils/ast.js';
import { COLOR_PROPERTY, findRawColor } from '../utils/colors.js';
import { getDsResolver } from '../utils/ds.js';
import { createRule } from '../utils/rule.js';

const SVG_COLOR_ATTRIBUTES = new Set([
  'fill',
  'stroke',
  'stopColor',
  'floodColor',
  'lightingColor',
  'color',
]);
const STYLED_TAGS = new Set(['css', 'keyframes', 'createGlobalStyle', 'injectGlobal']);
/** Tailwind-style arbitrary values: `bg-[#fff]`, `text-[rgb(0,0,0)]`. */
const ARBITRARY = /\[[^\]]*\]/g;

function isStyledTag(tag) {
  if (tag.type === 'Identifier') return tag.name === 'styled' || STYLED_TAGS.has(tag.name);
  if (tag.type === 'MemberExpression')
    return tag.object.type === 'Identifier' && tag.object.name === 'styled';
  if (tag.type === 'CallExpression') return isStyledTag(tag.callee);
  return false;
}

export default createRule('no-raw-colors', {
  description:
    'Disallow hex, rgb(), hsl() and named colors in style props, SVG color attributes, class names and styled strings; use var(--ds-*) tokens.',
  messages: {
    raw: 'Raw color "{{value}}" in {{where}}. Use a var(--ds-*) color token or a design system component (AGENTS.md section 2, rule 4).',
  },
  schema: [
    {
      type: 'object',
      properties: {
        allow: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Exact color values (case-insensitive) that are accepted, for example ["#000"].',
        },
        named: {
          type: 'boolean',
          description:
            'Also flag bare color names such as "red" in color properties. Default true.',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ allow: [], named: true }],
  create(context, options) {
    const ds = getDsResolver(context);
    const allow = new Set(options.allow.map((v) => v.toLowerCase()));

    function check(node, value, where, named) {
      const found = findRawColor(value, { named: named && options.named });
      if (found && !allow.has(found.toLowerCase())) {
        context.report({ node, messageId: 'raw', data: { value: found, where } });
      }
    }

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !node.value) return;
        const name = node.name.name;

        if (name === 'style') {
          const object = styleObject(node);
          if (!object) return;
          for (const property of object.properties) {
            const key = keyName(property);
            if (key === null) continue;
            // Custom properties may carry a color; check the value but never bare color names.
            const named = COLOR_PROPERTY.test(key) && !key.startsWith('--');
            for (const { node: literal, value } of collectStrings(property.value)) {
              check(literal, value, `the style prop (${key})`, named);
            }
          }
          return;
        }

        if (SVG_COLOR_ATTRIBUTES.has(name)) {
          // On a design system component these are data props (for example Swatch `color`), not paint.
          if (node.parent.type === 'JSXOpeningElement' && ds.nameOf(node.parent)) return;
          for (const { node: literal, value } of collectStrings(node.value)) {
            check(literal, value, `the ${name} attribute`, true);
          }
          return;
        }

        if (name === 'className') {
          for (const { node: literal, value } of collectStrings(node.value)) {
            for (const match of value.matchAll(ARBITRARY))
              check(literal, match[0], 'className', false);
          }
        }
      },
      TaggedTemplateExpression(node) {
        if (!isStyledTag(node.tag)) return;
        for (const quasi of node.quasi.quasis) {
          check(quasi, quasi.value.cooked ?? '', 'a styled string', false);
        }
      },
    };
  },
});
