# @loui/ds-mcp

A stdio [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI agents exact, current knowledge of Loui DS: components and props, tokens, guides, recipes, and a snippet validator. Task: AI-008. Built on `@modelcontextprotocol/sdk` 1.32 (`McpServer`, `registerTool` with zod input and output schemas, `registerResource`).

It reads the generated files, so it cannot drift from the code: `docs/manifest.json`, `docs/tokens.json`, `docs/ai/content-rules.json`, `docs/ai/components/*.md`, `docs/guides/*.md`, `docs/llms.txt`, and `docs/recipes/*.md` when recipes exist.

## Run

Node 24 runs the TypeScript source directly (native type stripping), so there is no build step in the repository:

```sh
node tools/mcp-server/src/cli.ts            # from the repo root
node tools/mcp-server/src/cli.ts --root path/to/dir-with-manifest.json
```

`pnpm --filter @loui/ds-mcp build` (tsdown) emits `dist/cli.js`, the `loui-ds-mcp` bin, for use outside the repository, where Node refuses to strip types under `node_modules`.

### Where the data comes from

In order: `--root <dir>` or `LOUI_DS_ROOT` (an explicit root that is wrong fails loudly), the installed `@loui/ds` package (`dist/`, then `docs/`), then the `docs/` folder found walking up from the working directory (the repository). The directory must contain `manifest.json`; the other files are optional.

## Connect

The repository's `.mcp.json` already registers the server, so Claude Code started in this repo picks it up (approve it once).

Claude Code, elsewhere:

```sh
claude mcp add loui-ds -- node /absolute/path/to/loui-ds/tools/mcp-server/src/cli.ts
# or, with the built bin and an explicit data directory:
claude mcp add loui-ds -e LOUI_DS_ROOT=/absolute/path/to/loui-ds/docs -- node /absolute/path/to/loui-ds/tools/mcp-server/dist/cli.js
```

Cursor (`.cursor/mcp.json`) and VS Code (`.vscode/mcp.json`, key `servers` instead of `mcpServers`):

```json
{
  "mcpServers": {
    "loui-ds": {
      "command": "node",
      "args": ["tools/mcp-server/src/cli.ts"]
    }
  }
}
```

The server speaks MCP on stdout, so it never prints anything else there; diagnostics go to stderr.

## Tools

All tools are read-only. Each returns concise text plus `structuredContent` that matches its `outputSchema`.

| Tool               | Input                                                                       | Returns                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list_components`  | `query?`, `group?` (Components, Primitives, Patterns), `status?`, `kind?`   | Name, kind, group, entry point, import statement, status, one-line description.                                                                                          |
| `get_component`    | `name`                                                                      | Props (type, required, default, allowed values, docs), variants, message keys, accessibility and keyboard notes, examples, related. Also hooks, providers and utilities. |
| `search_tokens`    | `query?`, `type?`, `tier?` (default semantic), `limit?`                     | CSS variable, value, description, and contrast pairings (allowed and not-allowed surfaces).                                                                              |
| `get_guidelines`   | `topic`: principles, content, accessibility, getting-started, using-with-ai | The guide as Markdown.                                                                                                                                                   |
| `get_recipe`       | `name?`                                                                     | A recipe from `docs/recipes/`; without a name, the list. Says so when there are none yet.                                                                                |
| `validate_snippet` | `code`, `filename?`                                                         | Findings with line, column, severity, rule id and a fix hint.                                                                                                            |

`validate_snippet` runs ESLint in memory (typescript-eslint parser, TSX) with `eslint-plugin-loui` `recommended`, and adds four manifest checks under the `loui-mcp/` prefix:

- `unknown-export`: an imported `@loui/ds` name that does not exist (with did-you-mean), also for `<DS.Name>`.
- `missing-import`: a manifest component used in JSX without an import.
- `missing-required-prop`: a prop the manifest marks required is absent (skipped when the element spreads props).
- `invalid-prop-value`: a literal value outside the prop's allowed values, such as `variant="huge"`.

Type-only imports are ignored. Dynamic values are never reported.

## Resources

| URI                        | Content                                                                   |
| -------------------------- | ------------------------------------------------------------------------- |
| `loui://guides/<name>`     | A guide (`principles`, `content-guidelines`, ...).                        |
| `loui://components/<Name>` | The generated component page (falls back to a rendering of the manifest). |
| `loui://llms.txt`          | The llms.txt index with the rules for generated UI.                       |
| `loui://content-rules`     | `content-rules.json`.                                                     |

## Keeping it in sync

Nothing is copied: the server loads the files on start. After changing components, tokens or docs, run `pnpm manifest:build` (also part of `pnpm build`) and restart the server (restart the MCP connection in your client). `pnpm manifest:check` fails CI when the committed `docs/` copies are stale.

## Development

```sh
pnpm --filter @loui/ds-mcp test    # tsc --noEmit, then Vitest
pnpm test:tools                    # every package in tools/
```

Tests use the SDK's `InMemoryTransport` for every tool and resource, and spawn the real stdio process once.

`eslint-plugin-loui` is a workspace dependency (private), so the built bin is meant to run inside the monorepo until the plugin is published.
