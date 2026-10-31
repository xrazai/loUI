# Storybook MCP (AI-012)

Verdict: **enabled.** `@storybook/addon-mcp` 10.6.5 (the same version as Storybook) works with this project on Windows, Storybook 10.6.5 and `@storybook/react-vite`. It is registered in `.storybook/main.ts`.

## What it does

While `storybook dev` is running, the addon serves an MCP server over HTTP (streamable HTTP, server-sent events) at `/mcp` of the Storybook origin, and turns on Storybook's **components manifest** feature (the addon's preset sets `features.componentsManifest: true` itself; no extra config is needed).

| Tool                               | Toolset | Purpose                                                                                         |
| ---------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `get-storybook-story-instructions` | dev     | Conventions for writing and testing stories in this project.                                    |
| `stories-preview`                  | dev     | Preview URLs for stories, to show the result of a UI change.                                    |
| `stories-changed`                  | dev     | Stories that are new, modified or affected by the working-tree changes.                         |
| `stories-find-by-component`        | dev     | Maps component source files to the stories that render them.                                    |
| `test-run`                         | test    | Runs story tests (needs `@storybook/addon-vitest`, installed; includes axe through addon-a11y). |
| `docs-list`                        | docs    | Lists components and docs entries with their IDs.                                               |
| `docs-show`                        | docs    | Component docs: description, stories with snippets, props from react-docgen.                    |
| `docs-show-story`                  | docs    | Detail of one story.                                                                            |

Verified locally on 2026-10-31: `initialize`, `tools/list`, `docs-list` (lists the components) and `docs-show` for `components-button` (description, 19 stories with IDs, props) all responded correctly, and `GET /manifests/components.json` returned the manifest (22 components with stories at that time). `test-run` and `stories-preview` were not exercised.

## How an agent connects

1. Start Storybook: `pnpm storybook` (port 6006; add `-p <port>` to change it).
2. Add the server to the agent:
   - Claude Code: `claude mcp add --transport http loui-storybook http://localhost:6006/mcp`
   - Any MCP client with HTTP transport: URL `http://localhost:6006/mcp`.
   - A project-level `.mcp.json` works too:

     ```json
     {
       "mcpServers": {
         "loui-storybook": { "type": "http", "url": "http://localhost:6006/mcp" }
       }
     }
     ```

3. The agent should call `get-storybook-story-instructions` before writing stories, `docs-list` then `docs-show` before using a component, and `test-run` after UI changes.

The endpoint path can be changed in `.storybook/main.ts` with `{ name: '@storybook/addon-mcp', options: { endpoint: '/custom-mcp' } }`.

## Limitations and notes

- **Dev server only.** `/mcp` exists only while `storybook dev` runs. `storybook build` does not publish an MCP server; check `storybook-static/manifests/components.json` for the static manifest.
- **It documents what has stories.** Only components with a `*.stories.tsx` appear (sub-components such as `Meter` and `TagGroup` are covered by their group's page). Our own `manifest.json` lists every export, including hooks and utilities, which Storybook MCP does not.
- **It does not read our `.md` docs.** Storybook MCP uses TSDoc, react-docgen and stories. The "when to use / when not to use / accessibility / keyboard" notes and the lifecycle `Status:` live in `<Name>.md` and are exposed only through `manifest.json` and `llms.txt`. Copy the important rules into the TSDoc or story descriptions if you want agents using only Storybook MCP to see them.
- **Snippet imports.** Story snippets returned by `docs-show` include imports copied from the story file, so they may show relative imports such as `'../Icon'` next to `'@loui/ds'`. Agents should import from `@loui/ds`.
- **Telemetry.** `core.disableTelemetry` is `true` in `.storybook/main.ts`.
- **Local only.** The server has no authentication. Do not expose the Storybook dev server beyond localhost.

## Relationship to the Loui manifest

| Need                                                                   | Use                                        |
| ---------------------------------------------------------------------- | ------------------------------------------ |
| Live component docs, story previews, running story tests               | Storybook MCP                              |
| Complete offline reference: all exports, tokens, pairings, usage rules | `manifest.json`, `tokens.json`, `llms.txt` |
| Validate generated code against the design rules                       | Planned Loui MCP server (AI-008)           |
