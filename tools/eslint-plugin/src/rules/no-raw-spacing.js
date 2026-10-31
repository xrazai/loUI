import { keyName, styleObject, unwrap } from '../utils/ast.js';
import { createRule } from '../utils/rule.js';

/** margin*, padding*, gap family and the sizing properties (width, height, min/max, logical). */
const SPACING_PROPERTY =
  /^(?:(?:margin|padding)(?:Top|Right|Bottom|Left|Block|Inline)?(?:Start|End)?|gap|rowGap|columnGap|(?:min|max)?(?:Width|Height|InlineSize|BlockSize)|(?:min|max)?(?:width|height)|(?:min|max)?(?:inline|block)Size)$/i;

function unitPattern(units) {
  return new RegExp(`(?<![\\w.-])-?(?:\\d+\\.?\\d*|\\.\\d+)(?:${units.join('|')})(?![\\w-])`, 'i');
}

export default createRule('no-raw-spacing', {
  description:
    'Disallow px, rem and em literals (and unitless numbers) in style props for margin, padding, gap and sizing; use spacing tokens.',
  messages: {
    raw: 'Raw spacing "{{value}}" for {{property}}. Use var(--ds-space-*) or a spacing prop of a layout component (AGENTS.md section 2, rule 4).',
  },
  schema: [
    {
      type: 'object',
      properties: {
        units: {
          type: 'array',
          items: { type: 'string' },
          description: 'CSS units that count as raw. Default ["px", "rem", "em"].',
        },
        ignoreProperties: {
          type: 'array',
          items: { type: 'string' },
          description: 'Style property names to skip, for example ["maxWidth"].',
        },
        extraProperties: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional style property names to check, for example ["top", "left"].',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ units: ['px', 'rem', 'em'], ignoreProperties: [], extraProperties: [] }],
  create(context, options) {
    const units = unitPattern(options.units);
    const ignore = new Set(options.ignoreProperties);
    const extra = new Set(options.extraProperties);

    return {
      JSXAttribute(node) {
        const object = styleObject(node);
        if (!object) return;
        for (const property of object.properties) {
          const key = keyName(property);
          if (key === null || key.startsWith('--') || ignore.has(key)) continue;
          if (!SPACING_PROPERTY.test(key) && !extra.has(key)) continue;
          const value = unwrap(property.value);
          if (!value) continue;

          if (value.type === 'Literal' && typeof value.value === 'number') {
            // React treats a unitless number as px. Zero is always fine.
            if (value.value !== 0) {
              context.report({
                node: value,
                messageId: 'raw',
                data: { value: `${value.value}px`, property: key },
              });
            }
            continue;
          }
          if (
            value.type === 'UnaryExpression' &&
            value.operator === '-' &&
            value.argument.type === 'Literal' &&
            typeof value.argument.value === 'number' &&
            value.argument.value !== 0
          ) {
            context.report({
              node: value,
              messageId: 'raw',
              data: { value: `-${value.argument.value}px`, property: key },
            });
            continue;
          }
          const text =
            value.type === 'Literal' && typeof value.value === 'string'
              ? value.value
              : value.type === 'TemplateLiteral' && value.expressions.length === 0
                ? (value.quasis[0].value.cooked ?? '')
                : null;
          if (text === null) continue;
          // `0px` is zero; everything else with a raw unit is flagged.
          for (const match of text.matchAll(new RegExp(units.source, 'gi'))) {
            if (/^-?0*\.?0+[a-z]+$/i.test(match[0])) continue;
            context.report({
              node: value,
              messageId: 'raw',
              data: { value: match[0], property: key },
            });
            break;
          }
        }
      },
    };
  },
});
