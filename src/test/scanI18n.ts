import ts from 'typescript';

/**
 * Static scan for hard-coded user-facing strings in component source (TEST-010, ADR-0005).
 *
 * Every visible string and every ARIA string in a component comes from its message catalog.
 * This scanner reads a `.tsx` file with the TypeScript compiler API and reports:
 *
 * - `jsx-text`: JSX text (or a string literal child, `{'Save'}`) that contains letters;
 * - `attribute`: a string literal passed to a user-visible or ARIA prop (`aria-label`, `title`,
 *   `placeholder`, `alt`, `label`, ...), also through a conditional or a template literal
 *   without substitutions.
 *
 * Values that are not literals (`{t.close}`, `{label}`) are never reported: they come from
 * messages or from the caller. A genuine non-text literal (an icon name, a CSS key) is allowed
 * with a comment on the same line or the line above:
 *
 *     // i18n-ignore: <reason>
 *
 * The reason is required.
 */

export interface I18nViolation {
  kind: 'jsx-text' | 'attribute';
  /** The attribute name, for `attribute` violations. */
  name?: string;
  text: string;
  line: number;
}

/** Props whose string value is read by people or assistive technology. */
export const USER_VISIBLE_PROPS: ReadonlySet<string> = new Set([
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-placeholder',
  'aria-valuetext',
  'title',
  'placeholder',
  'alt',
  'label',
  'description',
  'errorMessage',
  'tooltip',
  'emptyMessage',
  'loadingLabel',
]);

const IGNORE = /i18n-ignore:\s*[^\s*/]/;
const LETTER = /\p{L}/u;

function stringsOf(expression: ts.Expression): ts.Expression[] {
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression) ||
    ts.isTemplateExpression(expression)
  ) {
    return [expression];
  }
  if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)) {
    return stringsOf(expression.expression);
  }
  if (ts.isConditionalExpression(expression)) {
    return [...stringsOf(expression.whenTrue), ...stringsOf(expression.whenFalse)];
  }
  if (
    ts.isBinaryExpression(expression) &&
    (expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
      expression.operatorToken.kind === ts.SyntaxKind.BarBarToken)
  ) {
    return [...stringsOf(expression.left), ...stringsOf(expression.right)];
  }
  return [];
}

/** The fixed text of a literal; for a template with substitutions, its fixed parts. */
function literalText(node: ts.Expression): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(' ');
  }
  return '';
}

export function scanSource(fileName: string, source: string): I18nViolation[] {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const lines = source.split('\n');
  const found: I18nViolation[] = [];

  const lineOf = (node: ts.Node) => file.getLineAndCharacterOfPosition(node.getStart(file)).line;
  const ignored = (node: ts.Node) => {
    const line = lineOf(node);
    return IGNORE.test(lines[line] ?? '') || IGNORE.test(lines[line - 1] ?? '');
  };

  const report = (violation: Omit<I18nViolation, 'line'>, node: ts.Node) => {
    if (ignored(node)) return;
    found.push({ ...violation, line: lineOf(node) + 1 });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      const text = node.text.replace(/\s+/g, ' ').trim();
      if (LETTER.test(text)) report({ kind: 'jsx-text', text }, node);
    } else if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) {
      // A string literal rendered as a child: {'Save'}.
      for (const literal of stringsOf(node.expression)) {
        const text = literalText(literal).trim();
        if (LETTER.test(text)) report({ kind: 'jsx-text', text }, literal);
      }
    } else if (
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      USER_VISIBLE_PROPS.has(node.name.text)
    ) {
      // The same props passed through an object: { 'aria-label': 'Close' }.
      for (const literal of stringsOf(node.initializer)) {
        const text = literalText(literal).trim();
        if (LETTER.test(text)) report({ kind: 'attribute', name: node.name.text, text }, node);
      }
    } else if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(file);
      if (USER_VISIBLE_PROPS.has(name)) {
        const initializer = node.initializer;
        const literals = ts.isStringLiteral(initializer)
          ? [initializer]
          : ts.isJsxExpression(initializer) && initializer.expression
            ? stringsOf(initializer.expression)
            : [];
        for (const literal of literals) {
          const text = literalText(literal).trim();
          if (LETTER.test(text)) report({ kind: 'attribute', name, text }, node);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}
