# Contributing to Loui DS

Everything in this repository is in English (code, comments, docs, commits, issues). Read [AGENTS.md](AGENTS.md) first: it holds the conventions and applies to humans and AI agents alike.

## Setup

Requirements: Node 24 (see `.nvmrc`) and pnpm 12.

```sh
pnpm install
pnpm exec playwright install chromium   # browser tests
pnpm storybook                          # http://localhost:6006
```

On Windows, `start.cmd` installs dependencies if needed and starts Storybook.

## Scripts

| Script                                  | Purpose                                                      |
| --------------------------------------- | ------------------------------------------------------------ |
| `pnpm storybook`                        | Develop and browse components                                |
| `pnpm check`                            | Tokens, lint, typecheck, tests, build: run before every push |
| `pnpm check:ci`                         | What CI runs (adds manifest, tree-shaking and API checks)    |
| `pnpm test` / `test:unit` / `test:a11y` | Vitest projects; `test:a11y` runs axe on every story         |
| `pnpm lint` / `pnpm format`             | ESLint and Stylelint / Prettier                              |
| `pnpm tokens:build`                     | Rebuild CSS variables from `src/tokens`                      |
| `pnpm manifest:build`                   | Regenerate `manifest.json`, `llms.txt` and component docs    |
| `pnpm api:update`                       | Update the public API snapshots in `api/` (review the diff)  |

## Workflow

1. Pick a task by ID from [TODO.md](TODO.md). One task or one component per change set.
2. Implement it following [AGENTS.md](AGENTS.md): tokens only, accessibility first, no inline styles. See [docs/contributing/component-workflow.md](docs/contributing/component-workflow.md) for a new component.
3. When the task is finished, **remove it from `TODO.md` and record it in [CHANGELOG.md](CHANGELOG.md)** under `[Unreleased]`, keeping the ID.
4. Open a pull request. The template contains the **Definition of Done** (AGENTS.md section 11); every box must hold before merge.

## Visual baselines

Every story is screenshot-tested (`tests/visual/README.md`). Baselines are platform-suffixed; CI compares against the **Linux** ones.

- Locally: `pnpm test:visual` to compare, `pnpm test:visual:update` to rewrite. Review each changed image before committing.
- Linux baselines are generated in the pinned Playwright container by the manual **Visual baselines (linux)** workflow (Actions tab, Run workflow). Pull the result with `pnpm visual:pull-linux` and commit it.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint through a Husky hook: `feat(button): add loading state`, `fix(tokens): raise text-3 contrast`, `docs: ...`, `test: ...`, `chore: ...`. Do not bypass the hooks.

## Changesets

Any user-visible change (anything in `src/`, tokens, `exports`, or docs consumers rely on) needs a changeset: run `pnpm changeset`, choose the bump per the [versioning policy](docs/release/versioning.md) and describe the change for a consumer. Internal work (tests, CI, refactors without API or visual effect) does not. Never run `changeset version` directly; see [docs/release/README.md](docs/release/README.md).

## Reporting issues

Use the issue templates (bug, component request, token change). For security problems follow [SECURITY.md](SECURITY.md).
