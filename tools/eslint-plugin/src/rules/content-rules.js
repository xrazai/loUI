import { collectStrings, meaningfulChildren, staticString } from '../utils/ast.js';
import { getDsResolver } from '../utils/ds.js';
import { loadContentRules } from '../utils/manifest.js';
import { createRule } from '../utils/rule.js';

/** Props that carry user-visible text, mapped to a content context from content-rules.json. */
const PROP_CONTEXT = {
  'SubMenu.label': 'menu-item',
  title: 'title',
  label: 'label',
  placeholder: 'label',
  description: 'description',
};

/** Context of the text children of a component (the `children` prop). Other components: none. */
const CHILDREN_CONTEXT = {
  Button: 'button',
  MenuItem: 'menu-item',
  Tab: 'tab',
};

/** Keyboard glyphs are data (Kbd, shortcuts), not emoji. */
const KEY_GLYPHS = /[⌘⌥⇧⌃↵⏎⌫⌦⎋⇥←-↓]/gu;

const regexCache = new Map();
function compile(pattern) {
  if (!regexCache.has(pattern)) {
    try {
      regexCache.set(pattern, new RegExp(pattern, 'u'));
    } catch {
      regexCache.set(pattern, null);
    }
  }
  return regexCache.get(pattern);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appliesTo(list, ctx) {
  return list.includes('*') || (ctx !== null && list.includes(ctx));
}

/**
 * Sentence-case heuristic input: proper nouns from the options and short acronyms after the first
 * word ("Export CSV") are lowercased so the JSON pattern does not flag them. An all-caps first word
 * ("NEW ORDER") keeps its acronyms, so shouting is still caught.
 */
function maskForSentenceCase(text, { properNouns, acronyms }) {
  let masked = text;
  for (const noun of properNouns) {
    masked = masked.replace(new RegExp(escapeRegExp(noun), 'gu'), (m) => m.toLowerCase());
  }
  const first = masked.split(/\s+/)[0] ?? '';
  const shouting = first.length > 1 && first === first.toUpperCase() && /\p{Lu}/u.test(first);
  if (acronyms && !shouting) {
    masked = masked.replace(/(?<=\s)\p{Lu}{2,4}(?=[\s.,:;)]|$)/gu, (m) => m.toLowerCase());
  }
  return masked;
}

export default createRule('content-rules', {
  description:
    'Check string literals passed to design system components against the microcopy rules in docs/ai/content-rules.json (AGENTS.md section 6).',
  messages: {
    violation: 'Content rule "{{id}}" ({{where}}): {{hint}} Found "{{text}}".',
    bare: 'Button text "{{text}}" is not a verb plus an object. Say what happens, for example "Create order" (AGENTS.md section 6).',
    phrase: 'Avoid "{{phrase}}" in {{where}}: {{hint}}',
  },
  schema: [
    {
      type: 'object',
      properties: {
        properNouns: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Capitalized names that are allowed inside sentence-case text, for example ["Northwind Web"].',
        },
        acronyms: {
          type: 'boolean',
          description:
            'Allow 2 to 4 letter all-caps words after the first word ("Export CSV"). Default true.',
        },
        ignoreRules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Rule ids from content-rules.json to skip, for example ["sentence-case"].',
        },
        props: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description:
            'Extra prop to context mapping, as "prop" or "Component.prop", for example {"caption": "label"}.',
        },
        children: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description:
            'Extra component name to context mapping for text children, for example {"NavItem": "label"}.',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ properNouns: [], acronyms: true, ignoreRules: [], props: {}, children: {} }],
  create(context, options) {
    const rules = loadContentRules(context);
    if (!rules) return {};
    const ds = getDsResolver(context);
    const ignore = new Set(options.ignoreRules);
    const propContext = { ...PROP_CONTEXT, ...options.props };
    const childrenContext = { ...CHILDREN_CONTEXT, ...options.children };
    const staticRules = rules.rules.filter(
      (r) => r.check === 'static' && r.pattern && !ignore.has(r.id) && compile(r.pattern),
    );
    const phrases = rules.forbidden?.phrases ?? [];
    const bare = new Set((rules.forbidden?.bareButtonLabels ?? []).map((t) => t.toLowerCase()));

    function check(node, raw, ctx, { full }) {
      const text = raw.replace(/\s+/g, ' ').trim();
      if (!/\p{L}/u.test(text)) return;
      const plain = text.replace(KEY_GLYPHS, '');

      for (const rule of staticRules) {
        if (!appliesTo(rule.appliesTo, ctx)) continue;
        const subject = rule.id === 'sentence-case' ? maskForSentenceCase(plain, options) : plain;
        if (rule.id === 'sentence-case' && !full) continue;
        const hit = compile(rule.pattern).test(subject);
        if ((rule.match === 'forbid' && hit) || (rule.match === 'require' && !hit)) {
          context.report({
            node,
            messageId: 'violation',
            data: {
              id: rule.id,
              where: ctx ?? 'any text',
              hint: rule.description.split('. ')[0].replace(/\.$/, '') + '.',
              text,
            },
          });
        }
      }

      if (!ignore.has('forbidden-phrases')) {
        for (const phrase of phrases) {
          if (!appliesTo(phrase.appliesTo, ctx)) continue;
          if (new RegExp(`\\b${escapeRegExp(phrase.value)}\\b`, 'iu').test(plain)) {
            context.report({
              node,
              messageId: 'phrase',
              data: { phrase: phrase.value, where: ctx ?? 'any text', hint: phrase.reason },
            });
          }
        }
      }

      if (full && ctx === 'button' && !ignore.has('button-verb-object')) {
        if (bare.has(plain.replace(/[.!?:]+$/u, '').toLowerCase())) {
          context.report({ node, messageId: 'bare', data: { text } });
        }
      }
    }

    return {
      JSXOpeningElement(node) {
        const name = ds.nameOf(node);
        if (!name) return;

        for (const attribute of node.attributes) {
          if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier')
            continue;
          const ctx =
            propContext[`${name}.${attribute.name.name}`] ?? propContext[attribute.name.name];
          if (!ctx || !attribute.value) continue;
          for (const { node: literal, value } of collectStrings(attribute.value)) {
            check(literal, value, ctx, { full: true });
          }
        }
      },
      JSXElement(node) {
        const name = ds.nameOf(node.openingElement);
        if (!name) return;
        const ctx = childrenContext[name] ?? null;
        const children = meaningfulChildren(node);
        const texts = children.map((child) => {
          if (child.type === 'JSXText') return { node: child, value: child.value };
          if (child.type === 'JSXExpressionContainer') {
            const value = staticString(child);
            if (value !== null) return { node: child, value };
          }
          return null;
        });
        // A single string child is the whole text; with mixed children only the punctuation rules apply.
        const full = children.length === 1;
        texts.forEach((entry) => {
          if (entry) check(entry.node, entry.value, full ? ctx : null, { full });
        });
      },
    };
  },
});
