# Changelog

All notable changes to this project are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning will follow [Semantic Versioning](https://semver.org/) once the first release is cut.

**Workflow:** when a task from [TODO.md](TODO.md) is finished, remove it from the TODO and add an entry below under `[Unreleased]` (keeping the task ID). On release, `[Unreleased]` is renamed to the version and date by the release process.

## [Unreleased]

### Added

- **ARCH-006** (2026-10-31) `DSProvider` (wraps RAC `I18nProvider` + `RouterProvider`), `defineMessages` (compiler-enforced `pt-BR` parity with `en`), `useMessages` (instance > provider > locale > language > `en`), `plural` via `Intl.PluralRules`, `useDSLocale`; `renderWithProvider(ui, { locale, messages })`. Docs: `docs/architecture/i18n.md`.
- **ARCH-007** (2026-10-31) Locale-aware utilities: `formatCurrency`/`parseCurrencyInput` (integer minor units), `formatNumber`, `formatPercent`, `formatDate`, `toISODate`, DST-safe `daysBetween`, `dueStatus`, `formatRelativeDays`, `compareText`/`sortByText` (accent-insensitive `Intl.Collator`), `normalizeSearch`/`matchesSearch`/`highlightMatch`, WCAG `relativeLuminance`/`contrastRatio`/`readableTextOn`. Docs: `docs/architecture/utilities.md`.
- **ARCH-004** (2026-10-31) Hooks not covered by React Aria: `useControllableState` (react-stately), `useMediaQuery`, `usePrefersReducedMotion`, `useHotkey` (scoped, ignores editable fields and IME composition, platform-aware Mod key).
- **ARCH-012** (2026-10-31) `ComponentStatus` lifecycle type and dev-only `warnDeprecated` helper.
- **DOCS-WF** (2026-10-31) `docs/contributing/component-workflow.md`: step-by-step migration procedure for component agents.
- **SETUP-001** (2026-10-31) Git repository on `main`; handoff imported untouched as the first commit; `.gitignore`, `.gitattributes` (LF), `.editorconfig`, `.nvmrc` (Node 24).
- **ADR-001…ADR-010** (2026-10-31) Accepted ADRs in `docs/adr/` (taken by the PM while the owner is away; revisable): React Aria Components 1.22 as behavior layer; CSS Modules + `@layer` + data attributes; DTCG 2025.10 tokens built with Terrazzo, CSS variables prefixed `--ds-`; name "Loui DS", package `@loui/ds` (private, UNLICENSED); English-default i18n with `DSProvider` and per-component catalogs (`pt-BR` shipped); integer minor units for money; dark-only theme with `paper` scope; `@loui/ds` + `@loui/ds/patterns` entry points; React 19 only; Vitest 5 browser mode + axe-core + Storybook 10 for testing.
- **SETUP-002** (2026-10-31) Workspace scaffold: pnpm 12.16, TypeScript 6.0 strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`), tsdown 0.23 build with CSS Modules (`@tsdown/css`), `exports` for `.`, `./patterns`, `./styles.css`; React 19.3, react-aria-components 1.22.1.
- **SETUP-003** (2026-10-31) ESLint 10 flat config (typescript-eslint strict, react-hooks, `jsx-a11y-x` fork), Stylelint 17 with `declaration-strict-value` (raw colors, z-index, font sizes, radii rejected), Prettier.
- **SETUP-004** (2026-10-31) Husky + lint-staged pre-commit, commitlint (Conventional Commits), Changesets config.
- **SETUP-006** (2026-10-31) `CLAUDE.md` importing `AGENTS.md`; PR template with the Definition of Done.
- **SETUP-008** (2026-10-31) `docs/adr/` with template.
- **TEST-001** (2026-10-31) Vitest 5 projects (`unit` node, `browser` chromium via Playwright, `visual`, `storybook` via `@storybook/addon-vitest`), `renderWithProvider`, `expectNoA11yViolations` (axe-core 4.14, WCAG 2.0–2.2 A/AA tags); Storybook 10.6 with a11y addon failing tests on violations.
- **BASE-002** (partial, 2026-10-31) `VisuallyHidden` primitive — reference implementation of the component conventions (ref as prop, CSS Module, story, browser test with axe).

- **PLAN-001** (2026-10-31) Analyzed the design handoff in `raw_files/design_handoff_erp_tecidos/`: 211 files — 58 components in 9 groups, CSS tokens (`colors`, `typography`, `spacing`, `fonts`, `base`) plus Tokens Studio `tokens.json`, 16 foundation cards, and written guidelines. ERP screens (`ERP.dc.html`, `support.js`) were intentionally left out of scope.
- **PLAN-002** (2026-10-31) Created [TODO.md](TODO.md): phased roadmap (setup and ADRs, foundation, architecture, component migration, testing, AI-ready foundation, docs, release), with task IDs, priorities, sizes and dependencies.
- **PLAN-003** (2026-10-31) Created [AGENTS.md](AGENTS.md): project rules for agents, decision status, design principles and content rules translated to English, visual foundations summary, accessibility requirements and keyboard contract, engineering conventions, testing strategy, Definition of Done and working procedure.
- **PLAN-004** (2026-10-31) Created this changelog and the TODO → CHANGELOG workflow.
- **PLAN-005** (2026-10-31) Audited the handoff and recorded findings in TODO Appendices A and B: measured WCAG contrast failures in tokens (`--text-3` on raised surfaces, `--line-strong` as control border, `--paper-accent`), spec-versus-code drift, hard-coded Portuguese strings, missing delivered files, and per-component accessibility defects.
