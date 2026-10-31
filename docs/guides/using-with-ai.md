# Using with AI

Loui DS is built to be operated by AI coding agents as well as by people. Everything an agent needs is generated from the source of truth, so it cannot drift: the manifests are rebuilt by `pnpm manifest:build` (and on every `pnpm build`).

## Start here

1. Read `AGENTS.md` in the repository: the conventions, the rules, the definition of done.
2. Load `llms.txt` (an index with the rules and links) or `llms-full.txt` (everything in one file).
3. Query `manifest.json` and `tokens.json` for exact names, props and values.
4. Prefer a verified story or recipe over inventing markup.

## What is available

| File                      | Contents                                                                                                                                                                                                                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest.json`           | Every exported component, hook and utility: import statement, status, description, props with types, defaults and descriptions, variants, sizes and tones, message keys with English defaults, CSS variables, stories, documentation sections, related components. Validated by `schemas/manifest.schema.json`. |
| `tokens.json`             | Every design token: CSS variable, resolved value, description ("use for", "not for") and allowed pairings: which text tokens pass on which surfaces, with measured contrast ratios.                                                                                                                             |
| `llms.txt`                | The [llms.txt](https://llmstxt.org) index: what the system is, rules for generated UI, and links to guides and per-component pages.                                                                                                                                                                             |
| `llms-full.txt`           | Guides, token summary and every component page in one file, for retrieval or a single context load.                                                                                                                                                                                                             |
| `ai/components/<Name>.md` | One generated Markdown page per component: import, props table, variants, messages, tokens used, and the hand-written usage notes.                                                                                                                                                                              |
| `ai/content-rules.json`   | The microcopy rules as data (casing, button labels, errors, empty states, forbidden characters), validated by `schemas/content-rules.schema.json`.                                                                                                                                                              |

In the repository these live in `docs/`. In the published package they are in `dist/` and exported as `@loui/ds/manifest.json` and friends once the package is published.

## Regenerating

```sh
pnpm manifest:build   # writes docs/ and dist/
pnpm manifest:check   # fails when the committed docs/ copies are stale
```

The manifest is built with the TypeScript compiler API and react-docgen-typescript from the real exports of `src/index.ts`, so a component that is not exported is not listed. A unit test fails when an exported component has no description, no story or no `<Name>.md`.

### Component status

Each component has a lifecycle status: `experimental`, `stable` or `deprecated`. The manifest reads it from, in this order:

1. a `@status` (or `@deprecated`) tag in the TSDoc of the exported component,
2. the `Status: <value>` line under the title of `<Name>.md`,
3. otherwise it defaults to `experimental`.

Do not use `experimental` or `deprecated` components in recipes or generated code unless the user asks.

## Rules an agent must follow

- Use only exported components, hooks and tokens; never write raw colors, pixel values or inline styles.
- One primary action per screen, top right.
- Every interactive element needs an accessible name; icon-only controls require `label`.
- Follow the [content guidelines](./content-guidelines.md): sentence case, verb + object buttons, no exclamation marks, no emoji.
- Format money, dates and numbers with the provided utilities. Money is an integer in minor units.
- Check a text and surface pairing in `tokens.json` before using it; for example `--ds-text-3` has a narrower set of allowed surfaces than `--ds-text`.

## Storybook MCP

While Storybook runs (`pnpm storybook`), it serves an MCP endpoint at `http://localhost:6006/mcp` through `@storybook/addon-mcp`. It lets an agent list components, read their docs and stories, get preview URLs and run story tests. Connect Claude Code with:

```sh
claude mcp add --transport http loui-storybook http://localhost:6006/mcp
```

Details, tools and limitations: `docs/ai/storybook-mcp.md`.

## Roadmap

An ESLint plugin that enforces these rules (AI-007), a dedicated Loui MCP server backed by the manifest with `validate_snippet` (AI-008), tested recipes (AI-006) and a Claude Code skill (AI-009) are tracked in the project TODO.
