/** Small AST helpers shared by the rules. Plain ESTree + JSX, no type information needed. */

/** Name of a property key (`margin`, `'margin'`, `` `--x` ``) or null when it is dynamic. */
export function keyName(property) {
  if (property.type !== 'Property') return null;
  const key = property.key;
  if (!property.computed && key.type === 'Identifier') return key.name;
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value;
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0)
    return key.quasis[0].value.cooked;
  return null;
}

/** Unwraps `as`, `satisfies` and non-null wrappers. */
export function unwrap(node) {
  let current = node;
  while (
    current &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression' ||
      current.type === 'ParenthesizedExpression')
  ) {
    current = current.expression;
  }
  return current;
}

const CLASS_HELPERS = new Set(['clsx', 'cn', 'cx', 'classNames', 'classnames', 'twMerge']);

/**
 * Every statically known string reachable from `node`: literals, template literals without
 * expressions, both branches of `?:` and `&&`/`||`/`??`, and the arguments of class helpers.
 * Returns `{ node, value }` pairs so a rule can report on the exact literal.
 */
export function collectStrings(node, out = []) {
  const n = unwrap(node);
  if (!n) return out;
  switch (n.type) {
    case 'Literal':
      if (typeof n.value === 'string') out.push({ node: n, value: n.value });
      break;
    case 'TemplateLiteral':
      if (n.expressions.length === 0) out.push({ node: n, value: n.quasis[0].value.cooked ?? '' });
      break;
    case 'JSXExpressionContainer':
      collectStrings(n.expression, out);
      break;
    case 'ConditionalExpression':
      collectStrings(n.consequent, out);
      collectStrings(n.alternate, out);
      break;
    case 'LogicalExpression':
      collectStrings(n.left, out);
      collectStrings(n.right, out);
      break;
    case 'CallExpression':
      if (n.callee.type === 'Identifier' && CLASS_HELPERS.has(n.callee.name)) {
        for (const arg of n.arguments) collectStrings(arg, out);
      }
      break;
    default:
      break;
  }
  return out;
}

/** The single static string of `node`, or null when it is dynamic or not a string. */
export function staticString(node) {
  const n = unwrap(node?.type === 'JSXExpressionContainer' ? node.expression : node);
  if (!n) return null;
  if (n.type === 'Literal' && typeof n.value === 'string') return n.value;
  if (n.type === 'TemplateLiteral' && n.expressions.length === 0)
    return n.quasis[0].value.cooked ?? '';
  return null;
}

/** The `style={{ ... }}` object of a JSX attribute, or null. */
export function styleObject(attribute) {
  if (attribute.type !== 'JSXAttribute' || attribute.name.name !== 'style') return null;
  if (attribute.value?.type !== 'JSXExpressionContainer') return null;
  const expression = unwrap(attribute.value.expression);
  return expression?.type === 'ObjectExpression' ? expression : null;
}

/** Finds a JSX attribute by name on an opening element. */
export function getAttribute(opening, name) {
  for (const attribute of opening.attributes) {
    if (
      attribute.type === 'JSXAttribute' &&
      attribute.name.type === 'JSXIdentifier' &&
      attribute.name.name === name
    ) {
      return attribute;
    }
  }
  return null;
}

export function hasSpread(opening) {
  return opening.attributes.some((a) => a.type === 'JSXSpreadAttribute');
}

/** Local element name: `Button`, `DS.Button` (root and member), or the intrinsic tag. */
export function localName(opening) {
  const name = opening.name;
  if (name.type === 'JSXIdentifier') return { root: name.name, member: null };
  if (name.type === 'JSXMemberExpression') {
    let object = name.object;
    while (object.type === 'JSXMemberExpression') object = object.object;
    return { root: object.name, member: name.property.name };
  }
  return { root: null, member: null };
}

/** Ancestors from the nearest parent outwards. */
export function ancestors(node) {
  const list = [];
  for (let p = node.parent; p; p = p.parent) list.push(p);
  return list;
}

export function isFunction(node) {
  return (
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  );
}

/** Non-whitespace children of a JSX element. */
export function meaningfulChildren(element) {
  return element.children.filter((c) => !(c.type === 'JSXText' && c.value.trim() === ''));
}
