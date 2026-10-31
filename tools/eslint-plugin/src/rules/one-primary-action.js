import { ancestors, getAttribute, isFunction, staticString } from '../utils/ast.js';
import { getDsResolver } from '../utils/ds.js';
import { createRule } from '../utils/rule.js';

/** Two nodes are exclusive when they sit in different branches of the same conditional. */
function areExclusive(a, b) {
  const chainA = [a, ...ancestors(a)];
  const chainB = new Set([b, ...ancestors(b)]);
  const index = chainA.findIndex((n) => chainB.has(n));
  if (index <= 0) return false;
  const common = chainA[index];
  const childA = chainA[index - 1];
  const childB = [b, ...ancestors(b)].find((n) => n.parent === common);
  if (!childB) return false;
  if (common.type === 'ConditionalExpression' || common.type === 'IfStatement') {
    const branches = [common.consequent, common.alternate];
    return branches.includes(childA) && branches.includes(childB) && childA !== childB;
  }
  if (common.type === 'BlockStatement' || common.type === 'Program') {
    // A node returned from inside an earlier `if` is exclusive with everything after that `if`.
    const [earlier, earlierNode] = a.range[0] < b.range[0] ? [childA, a] : [childB, b];
    return (
      earlier.type === 'IfStatement' &&
      ancestors(earlierNode).some(
        (n) => n.type === 'ReturnStatement' && n.range[0] >= earlier.range[0],
      )
    );
  }
  if (common.type === 'SwitchStatement') {
    return childA.type === 'SwitchCase' && childB.type === 'SwitchCase' && childA !== childB;
  }
  return false;
}

export default createRule('one-primary-action', {
  description:
    'Warn when more than one Button with variant="primary" is rendered in the same component function (heuristic).',
  messages: {
    many: 'More than one primary Button in this scope. A screen has one main action; use variant="secondary" or "ghost" for the others (AGENTS.md section 13).',
  },
  schema: [
    {
      type: 'object',
      properties: {
        components: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Design system components that carry the primary variant. Default ["Button"].',
        },
        scopes: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Components that start a separate scope, because they are their own screen layer. Default ["Dialog", "ConfirmDialog", "Sheet", "Popover", "InlineConfirm"].',
        },
        max: {
          type: 'integer',
          minimum: 1,
          description: 'Primary actions allowed per scope. Default 1.',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [
    {
      components: ['Button'],
      scopes: ['Dialog', 'ConfirmDialog', 'Sheet', 'Popover', 'InlineConfirm'],
      max: 1,
    },
  ],
  create(context, options) {
    const ds = getDsResolver(context);
    const components = new Set(options.components);
    const scopes = new Set(options.scopes);
    /** scope node -> primary Button opening elements, in source order */
    const groups = new Map();

    function scopeOf(opening) {
      for (const node of ancestors(opening.parent)) {
        if (isFunction(node)) return node;
        if (node.type === 'JSXElement' && scopes.has(ds.nameOf(node.openingElement) ?? ''))
          return node;
      }
      return opening.parent;
    }

    return {
      JSXOpeningElement(node) {
        const name = ds.nameOf(node);
        if (!name || !components.has(name)) return;
        const variant = getAttribute(node, 'variant');
        if (!variant || staticString(variant.value) !== 'primary') return;
        const scope = scopeOf(node);
        const list = groups.get(scope) ?? [];
        list.push(node);
        groups.set(scope, list);
      },
      'Program:exit'() {
        for (const list of groups.values()) {
          list.forEach((node, index) => {
            const before = list.slice(0, index).filter((other) => !areExclusive(node, other));
            if (before.length >= options.max)
              context.report({ node: node.name, messageId: 'many' });
          });
        }
      },
    };
  },
});
