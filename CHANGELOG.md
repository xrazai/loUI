# Changelog

All notable changes to this project are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning will follow [Semantic Versioning](https://semver.org/) once the first release is cut.

**Workflow:** when a task from [TODO.md](TODO.md) is finished, remove it from the TODO and add an entry below under `[Unreleased]` (keeping the task ID). On release, `[Unreleased]` is renamed to the version and date by the release process.

## [Unreleased]

### Added

- **CMP-NAV-01** (2026-10-31) `Tabs`, `TabList`, `Tab`, `TabPanel` on React Aria: roving focus, linked panels, `keyboardActivation`, tone counts with text alternative, decorative shortcut hint.
- **CMP-FRM-09** (2026-10-31) `SegmentedControl` as a single-selection `ToggleButtonGroup` (value control, not a tablist), sizes sm/md, counts, `fullWidth`.
- **CMP-FRM-10** (2026-10-31) `SuggestionChip`: dashed button with plus icon that inserts text (never sends).
- **CMP-NAV-03** (2026-10-31) `NavItem`: real link (router-aware) or button, `aria-current="page"`, count pill with accessible text.
- **CMP-LAY-01** (2026-10-31) `Sidebar`: `aside` with one labelled `nav` per section, workspace, status (`role="status"`), footer and user blocks; width token 240px (handoff's 248px dropped).
- **CMP-LAY-02** (2026-10-31) `TopBar`: 64px `header` (handoff code had 56px), title/subtitle or breadcrumb, actions slot.
- **CMP-LAY-03** (2026-10-31) `Breadcrumb`: ordered list in a named `nav`, decorative separators, current page as text.
- **CMP-LAY-04** (2026-10-31) `Accordion` on React Aria Disclosure: headings wrap triggers, single/multiple expansion, controlled `value`.
- **CMP-DAT-02** (2026-10-31) `Pagination`: named `nav`, `aria-current`, polite range summary, tested pure helpers `getPageItems` / `getPageCount` / `getItemRange`.
- **BASE-002** (2026-10-31) `SkipLink` (moves focus to the target) and `.ds-sr-only` utility class.
- **AI-002** (2026-10-31) Component manifest generator `scripts/manifest/` (`pnpm manifest:build`, runs after `tsdown` in `pnpm build`; `pnpm manifest:check` detects stale committed copies): props from TypeScript, TSDoc, message keys and English defaults, CSS variables used, stories, doc sections, status; hooks, utilities and icons. JSON Schema `schemas/manifest.schema.json`; tests validate schema and coverage.
- **AI-004** (2026-10-31) Token manifest `docs/tokens.json` with descriptions and allowed contrast pairings (schema `schemas/tokens.schema.json`).
- **AI-005** (2026-10-31) Generated `llms.txt`, `llms-full.txt` and per-component `docs/ai/components/<Name>.md`; packaged as `@loui/ds/manifest.json`, `tokens.json`, `llms.txt`, `llms-full.txt`.
- **AI-010** (2026-10-31) Machine-readable microcopy rules `docs/ai/content-rules.json` with schema and self-checking examples.
- **AI-012** (2026-10-31) Storybook MCP enabled (`@storybook/addon-mcp` 10.6.5): `pnpm storybook` serves `/mcp` and the components manifest; connection guide in `docs/ai/storybook-mcp.md`.
- **DOCS-004 / DOCS-005 / DOCS-006 / DOCS-008** (2026-10-31) Guides in `docs/guides/` rendered in Storybook (Introduction, Getting started, Principles, Content guidelines, Accessibility, Using with AI) — principles and content rules translated from the handoff; root `README.md`; Storybook sidebar ordered Introduction → Guides → Foundations → Components → Patterns.
- **ARCH-008 / ARCH-009** (2026-10-31) Shared `Field` building blocks (`Label`, `Description`, `FieldError`, `FieldMessages`, `RequiredMark`) used by every field; one disabled/invalid/required model. Validation defaults to `native` (errors appear after the first submit attempt, focus moves to the first invalid field); `aria` opt-in for live feedback.
- **ARCH-003** (2026-10-31) Handoff prop-spread bug fixed by design (consumer `onFocus`/`onBlur` composed with internal handlers); regression tests in Input, Textarea and Select.
- **CMP-FRM-03** (2026-10-31) `Input` on React Aria `TextField`: label/description/error wiring, `mono`, adornments, sizes, read-only, dashed disabled border.
- **CMP-FRM-04** (2026-10-31) `Textarea`: associated `aside`, `autoGrow`, debounced polite character count (pluralized messages).
- **CMP-FRM-05** (2026-10-31) `Select` on React Aria: placeholder from messages, sections, disabled items, typeahead, check icon; keeps consumer order (`sortByText` documented for alphabetical lists).
- **CMP-FRM-06** (2026-10-31) `Checkbox` + `CheckboxGroup` (native input via RAC `CheckboxField`): indeterminate, description outside the accessible name, form participation.
- **CMP-FRM-07** (2026-10-31) `RadioGroup` + `Radio`: single tab stop with roving focus, label required by the types, vertical by default.
- **CMP-FRM-08** (2026-10-31) `Switch` (RAC `SwitchField`): no double toggle, label placement start/end, off track meets 3:1.
- **TOOLING** (2026-10-31) Stylelint allows `currentcolor` and CSS system colors (forced-colors blocks); ADR-0002 amended for dynamic values as `--ds-<component>-*` custom properties.
- **ICON-001 / ICON-002 / ICON-003** (2026-10-31) `Icon` wrapping bundled `lucide-react` (no CDN): decorative by default, `label` → `role="img"`, sizes `xs…lg` from tokens, 1.5px non-scaling stroke, `directional` RTL mirroring; curated allow-list of 24 icons (`iconSet`, `iconNames`) exported for the manifest.
- **CMP-FRM-01** (2026-10-31) `Button` on React Aria: variants `primary | secondary | ghost | danger | danger-solid`, sizes 32/40/48 (handoff docs said 28/32/40), `leading`/`trailing`, `fullWidth`, width-stable `isPending`; CSS-only hover via component tokens.
- **CMP-FRM-02** (2026-10-31) `IconButton`: `label` required by the type system, no duplicate `title`, ≥ 24px target, no text-glyph children.
- **CMP-FBK-06** (2026-10-31) `Spinner`: English default label with `pt-BR` catalog, decorative mode, static ring under reduced motion.
- **GAP-002** (partial, 2026-10-31) `Link` on React Aria with `DSProvider` routing: underlined inline links (WCAG 1.4.1), `standalone` variant, safe `target="_blank"` with icon and hidden "opens in a new tab" note.
- **TEST-005** (2026-10-31) Visual-regression harness `tests/visual/stories.visual.test.tsx`: discovers every story, renders inside `DSProvider` after `document.fonts.ready`, freezes animations, `toMatchScreenshot`; per-story `parameters.visual` options; win32 baselines (Docker baselines pending CI).
- **CMP-DSP-01** (2026-10-31) `Badge`: token tones, decorative dot; canvas test asserts ≥ 4.5:1 text contrast on every tone.
- **CMP-DSP-02** (2026-10-31) `Tag` + `TagGroup` on React Aria: Backspace/Delete removal, 24px remove button named "Remove {label}" from messages.
- **CMP-DSP-03** (2026-10-31) `Card`: title is a real heading (`headingLevel`) wired with `aria-labelledby`; `raised` variant; actions slot.
- **CMP-DSP-04** (2026-10-31) `Avatar`: `name` drives locale-aware initials and alt text, image error fallback, `decorative` mode; `getInitials` utility.
- **CMP-DSP-05** (2026-10-31) `Kbd`: platform-aware `Mod` (SSR-safe), symbols spoken via messages (`en`, `pt-BR`).
- **CMP-DAT-05** (2026-10-31) `EmptyState`: configurable heading level, icon, primary/secondary actions, compact/bordered variants.
- **CMP-DAT-06** (2026-10-31) `Skeleton`: always hidden from assistive technology, `lines`/`circle`, pulse disabled under reduced motion.
- **CMP-FBK-05** (2026-10-31) `Progress` (determinate + indeterminate) and `Meter` on React Aria, locale-aware percentages, tones.
- **CMP-FBK-01** (2026-10-31) `Alert`: decorative icon plus visually hidden tone prefix, `urgent` → `role="alert"`, default `status`, `announce={false}` for static alerts, dismiss via `IconButton`.
- **TOK-001 / TOK-002** (2026-10-31) DTCG 2025.10 token source in `src/tokens/*.json` (primitive → semantic, every token has a `$description` for humans and AI), built with Terrazzo + a custom plugin into `src/styles/tokens.css` (`@layer tokens`, 120 `--ds-*` variables), `src/tokens/generated/tokens.ts` (`TokenName` union) and a flat `tokens.json`. `pnpm tokens:build` / `pnpm tokens:check` (stale output fails `pnpm check`). Component-scoped tokens load from `src/tokens/component/*.json`.
- **TOK-004** (2026-10-31) Contrast fixes (decided by the PM, logged in `docs/tokens/changes.md`): `--ds-text-3` `#7A7A82` → `#86868E` (now ≥ 4.55:1 on every surface); new `--ds-line-control` `#64646B` for form-control boundaries (≥ 3.02:1 on bg/surface/raised); `--ds-paper-accent` `#B8603E` → `#A95839` (4.53:1). 63 pairs in `src/tokens/contrast-pairs.json` enforced by `contrast.test.ts`.
- **TOK-003** (partial, 2026-10-31) New tokens closing handoff gaps: z-index scale (`--ds-z-dropdown…tooltip`), single `--ds-opacity-disabled` (.35), `--ds-swatch-ring`, icon sizes `--ds-icon-xs…lg`, `--ds-target-min` (24px), `--ds-row-h-dense`, `--ds-duration-progress`.
- **TOK-005 / TOK-006 / TOK-007 / TOK-009** (2026-10-31) Type scale with 11.5px caption floor; motion tokens + `prefers-reduced-motion` neutralization; focus rings with transparent outline fallback for `forced-colors`; strictly increasing z-index scale.
- **BASE-001** (2026-10-31) Layered base CSS (`reset`, `tokens`, `base`, `fonts`): `color-scheme: dark`, underlined in-text links (WCAG 1.4.1), global `:focus-visible`, `[data-theme="paper"]` scope, forced-colors basics, `ds-spin` / `ds-pulse` keyframes.
- **FONT-001 / FONT-002 / FONT-003** (2026-10-31) Self-hosted variable Geist and Geist Mono woff2 (OFL license included) shipped in `dist/fonts/`, `font-display: swap`, metric-matched fallback faces, tabular-numerals guidance. `geist` is now a dev dependency.
- **TEST-006 / TEST-011** (2026-10-31) Snapshot test of the generated token JSON; test that every `var(--ds-*)` used in `src/**/*.css` exists; Stylelint strict values extended to opacity, outline color and durations.
- **FDN-001** (partial, 2026-10-31) Storybook `Foundations/Tokens` page generated from the flat token JSON (swatches with contrast ratios, type, spacing, radius, sizes, shadows, motion, z-index).
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
