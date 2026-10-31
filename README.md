# Loui DS

A dark, minimal, functional React design system for internal tools, dashboards and apps. Design tokens, accessible components built on [React Aria Components](https://react-aria.adobe.com/), and AI-ready documentation, in one package: `@loui/ds`.

**Live Storybook:** <https://xrazai.github.io/loUI/> · **For AI agents:** [llms.txt](https://xrazai.github.io/loUI/llms.txt), [llms-full.txt](https://xrazai.github.io/loUI/llms-full.txt), [manifest.json](https://xrazai.github.io/loUI/manifest.json), [tokens.json](https://xrazai.github.io/loUI/tokens.json)

> Status: pre-release (`0.0.0`, private, unlicensed). All components are `experimental`; APIs can still change.

## Highlights

- **Accessible by default.** WCAG 2.2 AA target, keyboard contracts, axe on every story.
- **Tokens first.** Every color, space, radius and duration is a `--ds-*` CSS variable built from DTCG JSON. No raw values in components.
- **React 19, SSR-safe,** CSS Modules in named cascade layers, no runtime styling library.
- **i18n built in.** English by default, `pt-BR` included, every string overridable through `DSProvider`.
- **Made for agents too.** A generated component manifest, token manifest and `llms.txt` keep AI tools exact.

## Install

```sh
pnpm add @loui/ds react react-dom
```

The package is private; install it from your private registry or workspace. Requires React 19 and Node 24 or later for tooling.

## Quick start

```tsx
import '@loui/ds/styles.css';
import { Alert, Button, DSProvider } from '@loui/ds';

export function App() {
  return (
    <DSProvider locale="en-US">
      <Alert tone="warning" title="Low stock">
        3 rolls of linen are left. Reorder to avoid delays.
      </Alert>
      <Button variant="primary" onPress={() => console.log('created')}>
        Create order
      </Button>
    </DSProvider>
  );
}
```

More in [Getting started](docs/guides/getting-started.md): the stylesheet, `DSProvider`, fonts, theming and server-side rendering.

## Documentation

| Where                                                   | What                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| Storybook (`pnpm storybook`)                            | Components, tokens, guides and live examples                             |
| [Introduction](docs/guides/introduction.md)             | What is in the package and how it is built                               |
| [Principles](docs/guides/principles.md)                 | The three rules, clarity and focus, agent principles, visual foundations |
| [Content guidelines](docs/guides/content-guidelines.md) | Microcopy rules                                                          |
| [Accessibility](docs/guides/accessibility.md)           | Conformance target, keyboard model, how we test                          |
| [Using with AI](docs/guides/using-with-ai.md)           | Manifest, `llms.txt`, content rules, Storybook MCP                       |
| [Architecture decisions](docs/adr)                      | Why things are the way they are (ADR-0001 to ADR-0010)                   |
| [AGENTS.md](AGENTS.md)                                  | Conventions for people and agents working on this repository             |

## For AI tools

Generated, always in sync with the source, committed under `docs/` and shipped in `dist/`:

- [`docs/llms.txt`](docs/llms.txt) and [`docs/llms-full.txt`](docs/llms-full.txt): index and full documentation.
- [`docs/manifest.json`](docs/manifest.json): every component, hook and utility with props, variants, messages, stories and usage notes.
- [`docs/tokens.json`](docs/tokens.json): every token with allowed text and surface pairings.
- [`docs/ai/content-rules.json`](docs/ai/content-rules.json): microcopy rules as data.
- [`docs/ai/components/`](docs/ai/components): one Markdown page per component.

## Quick start (Windows)

Double-click `start.cmd` in the repo root (or run it from a terminal). It installs pnpm and the dependencies if they are missing, starts Storybook and opens http://localhost:6006 in your browser. On any OS, `pnpm install` then `pnpm start` does the same.

## Scripts

| Command                                        | Purpose                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm start`                                   | Start Storybook on port 6006 and open it in the browser           |
| `pnpm storybook`                               | Storybook on port 6006 (also serves the MCP endpoint at `/mcp`)   |
| `pnpm build`                                   | Library build to `dist/`, then the AI manifests                   |
| `pnpm build-storybook`                         | Static Storybook                                                  |
| `pnpm lint` / `pnpm typecheck`                 | ESLint and Stylelint / TypeScript                                 |
| `pnpm test`                                    | All Vitest projects (unit, browser, visual, storybook)            |
| `pnpm test:unit` / `pnpm test:browser`         | Node-only tests / component tests in Chromium                     |
| `pnpm test:a11y`                               | Story a11y checks and browser axe tests                           |
| `pnpm test:visual` / `pnpm test:visual:update` | Visual regression / reviewed baseline update                      |
| `pnpm tokens:build` / `pnpm tokens:check`      | Build tokens / verify committed output is current                 |
| `pnpm manifest:build` / `pnpm manifest:check`  | Regenerate / verify the manifests, `llms.txt` and component pages |
| `pnpm check`                                   | The gate: tokens, lint, typecheck, tests and build                |
| `pnpm changeset`                               | Record a release note                                             |

## Contributing

Read [AGENTS.md](AGENTS.md) first: it is the single source of truth for conventions. Work comes from [TODO.md](TODO.md); finished work is recorded in [CHANGELOG.md](CHANGELOG.md). Components follow the [component workflow](docs/contributing/component-workflow.md). Commits follow Conventional Commits. Everything in this repository is written in English.

After adding or changing a component, regenerate the AI-facing documentation and commit it:

```sh
pnpm manifest:build
```

## Project layout

```
src/
  components/<Name>/   component, CSS Module, messages, stories, tests, <Name>.md
  tokens/              DTCG JSON sources and generated output
  styles/              layered base CSS and fonts
  hooks/ utils/ i18n/  hooks, locale-aware utilities, message catalogs
  docs/                Storybook guide pages
  patterns/            domain patterns (second entry point)
docs/                  guides, ADRs, architecture notes, generated AI docs
schemas/               JSON Schemas for the manifests and content rules
scripts/               token and manifest tooling
```

## License

UNLICENSED for now (ADR-0004). The owner decides before any publication.
