const DOCS_BASE = 'tools/eslint-plugin/README.md';

/** Wraps a rule definition with the shared docs metadata. */
export function createRule(
  name,
  { description, messages, schema = [], defaultOptions = [], create },
) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description, url: `${DOCS_BASE}#${name}` },
      messages,
      schema,
    },
    defaultOptions,
    create(context) {
      const options = { ...(defaultOptions[0] ?? {}), ...(context.options[0] ?? {}) };
      return create(context, options);
    },
  };
}
