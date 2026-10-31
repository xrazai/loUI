import {
  getAttribute,
  hasSpread,
  localName,
  meaningfulChildren,
  staticString,
} from '../utils/ast.js';
import { getDsResolver } from '../utils/ds.js';
import { createRule } from '../utils/rule.js';

export default createRule('icon-button-label', {
  description:
    'Require an accessible name on IconButton (label) and on buttons whose only child is an Icon.',
  messages: {
    missingLabel:
      'IconButton needs a non-empty `label`: it is the accessible name and the tooltip text (AGENTS.md section 8).',
    iconOnly:
      'This button only contains an icon, so it has no accessible name. Use <IconButton label="..." icon={...} />, or add aria-label (AGENTS.md section 8).',
  },
  schema: [
    {
      type: 'object',
      properties: {
        buttons: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Elements treated as buttons for the icon-only check. Default ["button", "Button"].',
        },
      },
      additionalProperties: false,
    },
  ],
  defaultOptions: [{ buttons: ['button', 'Button'] }],
  create(context, options) {
    const ds = getDsResolver(context);
    const buttons = new Set(options.buttons);

    /** The element's DS name, or its local name when it is not imported from the DS (JS users, wrappers). */
    function nameOf(opening) {
      return ds.nameOf(opening) ?? localName(opening).root;
    }

    function isIcon(opening) {
      const name = nameOf(opening);
      return name !== null && (name === 'Icon' || /Icon$/.test(name));
    }

    function named(opening, attributes) {
      if (hasSpread(opening)) return true;
      return attributes.some((attribute) => {
        const found = getAttribute(opening, attribute);
        return found !== null && staticString(found.value)?.trim() !== '';
      });
    }

    return {
      JSXOpeningElement(node) {
        if (nameOf(node) !== 'IconButton' || hasSpread(node)) return;
        const label = getAttribute(node, 'label');
        const value = label ? staticString(label.value) : null;
        if (!label || (value !== null && value.trim() === '')) {
          context.report({ node: node.name, messageId: 'missingLabel' });
        }
      },
      JSXElement(node) {
        const opening = node.openingElement;
        if (!buttons.has(nameOf(opening) ?? '')) return;
        const children = meaningfulChildren(node);
        const only = children.length === 1 ? children[0] : null;
        if (only?.type !== 'JSXElement' || !isIcon(only.openingElement)) return;
        if (named(opening, ['aria-label', 'aria-labelledby'])) return;
        // The design system Icon takes its own `label` prop, which names the button.
        if (named(only.openingElement, ['label', 'aria-label'])) return;
        context.report({ node: opening.name, messageId: 'iconOnly' });
      },
    };
  },
});
