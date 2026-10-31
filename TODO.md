# TODO — Loui DS (working name)

Roadmap to complete the design system: **foundation, tokens and components**. ERP screens (`ERP.dc.html`) are **out of scope** for now.

Source material: `raw_files/design_handoff_erp_tecidos/` (read-only reference, see [AGENTS.md](AGENTS.md)).
Snapshot of the handoff: 58 React components (`.jsx` + `.d.ts` + `.prompt.md`), 5 token CSS files + `tokens.json`, 16 foundation cards, 9 component showcase cards.

## How this file works

1. Pick the highest-priority open task whose dependencies are done.
2. Complete it, meeting the **Definition of Done** in [AGENTS.md](AGENTS.md#definition-of-done).
3. **Move the finished task out of this file and into [CHANGELOG.md](CHANGELOG.md)** (under `[Unreleased]`, keeping its ID). Never leave a finished task here.
4. New work discovered along the way gets a new ID in the right section.

Task format: `- [ ] **ID** (priority · size) Title — details. _Depends: …_`

- Priority: **P0** blocks everything · **P1** core to a usable v0.1 · **P2** needed for v1.0 · **P3** future / nice to have
- Size: **S** < 1 day · **M** 1–3 days · **L** > 3 days

Everything in this project is written in **English** (code, comments, docs, UI strings, tests, commits). Only the conversation with the owner is in Portuguese.

---

## Phase 0 — Project setup and decisions

### Setup

- [ ] **SETUP-005** (P1 · M) CI on GitHub Actions (`.github/workflows/ci.yml` runs `check:ci`, `publint`, `size` on push/PR to `main`, repo github.com/xrazai/loUI): keep it green, add branch protection with required checks, and add the visual job once Linux baselines exist (TEST-019).
- [ ] **SETUP-007** (P2 · S) `CONTRIBUTING.md`, issue templates (bug, component request, token change), `CODEOWNERS`. (PR template with the Definition of Done already exists.)
- [ ] **SETUP-009** (P2 · S) Add `build-storybook` and `attw` to CI (budgets and `check:ci` exist).

All ADRs 0001–0010 are accepted (see `docs/adr/` and CHANGELOG). New decisions get a new ADR.

---

## Phase 1 — Foundation (tokens, type, icons, themes)

### Tokens

- [ ] **TOK-003** (P1 · S) **Remaining token gaps** (z-index, opacity, swatch ring, icon sizes and progress duration are done): decide `color-mix` percentages for hover/tint states (6/12/18/30/35%), extra compact heights (22/24/26/28 px), 5px checkbox and 8px matrix-cell radii, `brightness(.88/.9)` hover filters. Component agents add component-scoped tokens in `src/tokens/component/`; promote repeated ones to semantic tokens.
- [ ] **TOK-008** (P2 · M) Theme architecture: `color-scheme: dark`, `[data-theme]` scoping, `paper` scope, `prefers-contrast: more` overrides, `forced-colors` mapping to system colors. _Depends: ADR-007_
- [ ] **TOK-010** (P2 · S) Breakpoint and container tokens (the handoff app assumes min-width 1180 px; define what the DS itself guarantees: components must work from 320 px wide).
- [ ] **TOK-011** (P2 · S) Round-trip test between CSS output and the Tokens Studio JSON so Figma and code cannot drift.
- [ ] **TOK-012** (P2 · S) Paper theme: remap signal colors (success, warning, danger) inside `[data-theme="paper"]` so they pass contrast on `--ds-paper` (only neutrals and accent are remapped today).
- [ ] **TOK-013** (P2 · S) Verify `forced-colors: active` rendering in a real browser (Playwright `forcedColors` emulation) for base focus styles and every component; the CSS exists but is unexercised.
- [ ] **TOK-014** (P2 · S) `--ds-line-control` is 2.8:1 on `--ds-surface-hover`; audit components whose control background changes on hover or sits on hover surfaces (e.g. inside menus) and add a hover border token if needed.

### Typography and fonts


### Icons


### Base styles


### Foundation documentation (port from `guidelines/*.html`, translate to English)

- [ ] **FDN-001** (P1 · S) Colors page prose (usage, do and don't) on top of the generated `Foundations/Tokens` page (swatches and ratios already exist).
- [ ] **FDN-002** (P1 · S) Typography: display, body, mono.
- [ ] **FDN-003** (P1 · S) Spacing scale, control sizes, radius, elevation.
- [ ] **FDN-004** (P1 · S) States (rest, hover, focus, disabled), keyboard model, principles, wordmark.
- [ ] **FDN-005** (P2 · S) Motion, layering, iconography, content (microcopy) rules.

---

## Phase 2 — Architecture and shared primitives

- [ ] **ARCH-010** (P1 · M) Build and exports: ESM with per-component entry points, `exports` map, `sideEffects` for CSS, generated `.d.ts` (the handoff `.d.ts` files rely on the global `JSX` namespace, removed in React 19), `"use client"` banners, `publint` + `are-the-types-wrong` in CI.
- [ ] **ARCH-011** (P2 · S) Logical CSS properties (`inline-start/end`) throughout so RTL is possible later; document the decision.

---

## Phase 3 — Component migration

Each task = port the handoff component to TypeScript in English **and** meet the full Definition of Done (tokens-only CSS module, stories for every state, unit tests, axe tests, keyboard contract tests, visual baseline, docs, manifest entry). The notes after "Fix:" are defects/gaps found in the handoff code that the migration must resolve. Handoff path: `raw_files/design_handoff_erp_tecidos/components/<group>/<Name>.jsx`.

Suggested order: **forms → feedback → display → navigation → inputs → layout → data → patterns (erp, agents)**.

### Forms


### Feedback


### Display


### Navigation


### Inputs


### Layout


### Data


### Patterns — `erp/` group (see ADR-008 for placement and renaming)


### Patterns — `agents/` group


---

## Phase 4 — Testing infrastructure

Goal: **no component merges without regression and accessibility coverage.** Strategy and conventions live in AGENTS.md.

- [ ] **TEST-004** (P1 · L) **Keyboard-contract tests**, one per ARIA Authoring Practices pattern used (button, checkbox, radio group, switch, tabs, menu, combobox, listbox, dialog, popover/disclosure, accordion, slider, spinbutton, grid, breadcrumb, table, tooltip, toast/alert). The contract table in AGENTS.md is the spec; each row becomes tests (Tab order, arrows, Home/End, Enter/Space, Esc, focus restore).
- [ ] **TEST-007** (P1 · S) **Public API regression:** `api-extractor` (or `.d.ts` snapshot) report committed to the repo; PR fails on unreviewed export/prop changes. Add `publint` and `are-the-types-wrong` checks.
- [ ] **TEST-009** (P1 · S) Tree-shaking test: importing `Button` alone must not pull `Chart`/`DataTable` (budgets per entry already exist).
- [ ] **TEST-010** (P1 · M) **i18n tests:** every built-in string is in the `messages` catalog (a test fails if a JSX string literal or `aria-label` literal appears in `src/` outside the catalog); `en` and `pt-BR` catalogs have identical keys; long-string (German-like +40%) and RTL pseudo-locale smoke renders.
- [ ] **TEST-012** (P2 · M) Interaction tests as Storybook `play` functions for complex flows (destructive confirm with Cancel focus, undo toast, combobox select, date selection, table sort/select/paginate) reused by both unit and visual runs.
- [ ] **TEST-013** (P2 · S) Manual screen-reader checklist per release (NVDA + Firefox, VoiceOver + Safari, TalkBack optional) stored in `docs/a11y/`; record results per component.
- [ ] **TEST-014** (P2 · S) WCAG 2.2 specifics as explicit tests: target size ≥ 24 px (2.5.8), focus not obscured by sticky bars/toasts (2.4.11), dragging alternatives (2.5.7), consistent help, reflow at 320 px (1.4.10), text spacing override (1.4.12).
- [ ] **TEST-015** (P2 · S) Flaky-test policy: retries only in visual CI, quarantine label, weekly review; coverage reported but not the quality gate (a11y + contract tests are).
- [ ] **TEST-016** (P3 · M) Mutation/fuzz testing for utilities (`formatCurrency`, `compareText`, `dueInfo`, color luminance) with property-based tests (`fast-check`).
- [ ] **TEST-017** (P2 · S) Drag-and-drop and paste paths of `FileUpload` are untested (React Aria rejects synthetic `DragEvent`s); cover with Playwright native drag or a documented manual check.
- [ ] **TEST-018** (P2 · S) Screen-reader verification of `ChatPanel` streaming announcements and `Toast` (NVDA, VoiceOver) — behavior follows practitioner guidance but is untested with real AT.
- [ ] **TEST-019** (P1 · M) Linux visual baselines generated in the pinned Playwright container (`mcr.microsoft.com/playwright:v1.64.1-noble`) via a manual `workflow_dispatch` job, committed, then a CI visual job; harness tolerance is 0.2% so regenerate from scratch after component changes.
- [ ] **TEST-020** (P2 · S) Visual baselines for open popovers (Select, Combobox, DatePicker open only in `play`): add open-state stories or a `play`-before-screenshot harness option. Also cap Menu popover width for long labels.
- [ ] **TEST-021** (P2 · S) Remaining read-once-after-hover style assertions (Checkbox, ChoiceTiles, Combobox, Input, RadioGroup, Select, Switch) → poll like Button/Link to remove flakiness under load.

---

## Phase 5 — AI-ready foundation

Goal: LLMs and coding agents can discover, use and validate the design system correctly, and cannot silently violate its rules.

- [ ] **AI-001** (P0 · S, ongoing) Keep `AGENTS.md` accurate (it is the entry point for agents; `CLAUDE.md` imports it). Review it whenever conventions change.
- [ ] **AI-006** (P1 · M) **Golden examples / recipes:** small, fully tested compositions (destructive confirm, form with validation, filterable table, empty state, settings page, undo toast, approval queue). Each passes axe, keyboard-contract and visual tests, and is referenced from the manifest so agents imitate verified patterns instead of inventing markup.
- [ ] **AI-015** (P2 · S) Resolve `eslint-plugin-loui` dogfooding warnings: 82 `no-raw-spacing` in story wrappers (move to layout primitives / tokens), `content-rules` bare "Done" button in `Popover.stories.tsx`, `properNouns` for region labels in `RadioGroup.stories.tsx`, `no-inline-style-visual` in `Avatar.stories.tsx`, non-curated icons in `AgentCard.stories.tsx`; then raise story linting to `error`. Add a manifest field for deprecated props.
- [ ] **AI-011** (P2 · M) Codemod infrastructure (`jscodeshift`) shipped with every breaking change; deprecations carry migration hints agents can apply automatically.
- [ ] **AI-013** (P3 · L) More AI-native components: tool-call/step display, citations/sources, feedback controls (thumbs), regenerate action, markdown renderer recipe for `ChatPanel.renderContent`. (Streaming, Stop/Retry, approval cards are done.)
- [ ] **AI-014** (P3 · M) Snapshot evaluation set: a list of natural-language UI prompts + expected component usage, run against the MCP/manifest in CI to catch regressions in AI-facing docs.

---

## Phase 6 — Documentation site (Storybook)

- [ ] **DOCS-003** (P1 · M) Foundations section generated from tokens (FDN-001…005).
- [ ] **DOCS-007** (P2 · S) Publish docs (static hosting) with search; link from README.

---

## Phase 7 — Packaging, release and governance

- [ ] **REL-001** (P1 · M) Package build output verified in a clean consumer app (Vite + Next.js fixtures in `examples/`), including CSS delivery and tree-shaking.
- [ ] **REL-002** (P1 · S) Changesets release flow, provenance-enabled npm publish (or private registry), pre-release channel (`0.x`).
- [ ] **REL-003** (P2 · S) Versioning policy: semver, what counts as breaking (token value change? visual change?), deprecation window, support policy.
- [ ] **REL-004** (P2 · S) Component lifecycle process (proposal → experimental → stable → deprecated) with checklist and owner.
- [ ] **REL-005** (P2 · S) Figma workflow: Tokens Studio sync, component naming parity, Code Connect mapping (optional).
- [ ] **REL-006** (P3 · S) Telemetry-free usage guidance: how consumers report issues; security policy (`SECURITY.md`).

---

## Backlog — gaps not in the handoff (needs decision before work)

The handoff inventory is missing common building blocks. Confirm which belong in the DS:

- [ ] **GAP-001** (P2 · M) Layout primitives: `Stack`, `Inline`, `Grid`, `Container`, `Divider/Separator`, `ScrollArea`, `AppShell` (Sidebar + TopBar + content landmarks + skip link).
- [ ] **GAP-002** (P2 · M) Typography components: `Text`, `Heading` (semantic level separate from visual size), `Code`. (`Link` is done.)
- [ ] **GAP-003** (P2 · M) `Form` wrapper (form-level `validationBehavior`, server errors via RAC `Form` `validationErrors`), `FieldSet`, form-level error summary. (`Field` parts are done.)
- [ ] **GAP-005** (P2 · M) `Toggle` / `ToggleGroup` (multi-select), `TagInput`, static `Table` primitives. (`NumberField` is done.)
- [ ] **GAP-006** (P3 · M) `Drawer` (generic), `Banner`, `Tour/Coachmark`, `Stepper/Wizard` (progress for multi-step flows like the 9-step "new agent" assistant), `Timeline`.
- [ ] **GAP-007** (P3 · M) Data visualization expansion: sparkline, donut/meter, stacked bars, legend component, shared chart a11y layer.
- [ ] **GAP-008** (P3 · S) Undo pattern as a hook (`useUndoable`) on top of Toast; the recipe already exists in `Toast.md`.

---

## Out of scope (for now)

- ERP screens and flows (`ERP.dc.html`, `support.js` DC runtime, all module logic, data model, prototype HTML) — will be revisited after the DS reaches v0.1; DS-worthy patterns extracted from it are tracked in GAP-004 and GAP-008.
- Backend, persistence, integrations (OpenRouter, Shopee, WhatsApp, printers).
- ERP-specific vocabulary rules (e.g. "always say Quantity, never pieces/meters") — belong in the ERP product docs, not in the DS core.

---

## Appendix A — Measured token contrast (WCAG 2.2, computed 2026-10-31)

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| `--text-3` on `--bg` | 4.62 | 4.5 (text) | pass (barely) |
| `--text-3` on `--surface` | 4.43 | 4.5 | **fail** |
| `--text-3` on `--surface-raised` | 4.16 | 4.5 | **fail** |
| `--text-3` on `--surface-hover` | 3.86 | 4.5 | **fail** |
| `--text-2` on `--surface-hover` | 6.55 | 4.5 | pass |
| `--line-strong` on `--bg` (input border) | 1.57 | 3.0 (UI, 1.4.11) | **fail** |
| `--line-strong` on `--surface` | 1.50 | 3.0 | **fail** |
| `--line` on `--surface` (card border) | 1.25 | decorative | n/a |
| `--primary-fg-muted` on `--primary-bg` | 5.84 | 4.5 | pass |
| `--text-inverse` on accent / success / warning / danger | 9.42 / 10.65 / 10.60 / 7.23 | 4.5 | pass |
| `--paper-muted` on `--paper` | 4.76 | 4.5 | pass |
| `--paper-accent` on `--paper` | 3.92 | 4.5 (small text) | **fail** for small text |
| `--paper-rule` on `--paper` | 2.64 | 3.0 if informative | review |

`--text-3` is used for placeholders, metadata, captions and tertiary labels (11.5–13 px), so the failures matter. Disabled controls (opacity .35) are exempt from WCAG contrast but should remain recognizable.

## Appendix B — Handoff findings to fix during migration

**Spec ↔ code drift**
- `Button.prompt.md` says sizes 28/32/40; code and tokens are 32/40/48. `Input.prompt.md` says 32 px; code is 40 px.
- `TopBar` is 56 px high; `--topbar-h` and the ERP spec say 64 px. `Sidebar` defaults to 248 px; `--sidebar-w` is 240 px.
- `CurrencyInput` emits float reais; the ERP data model stores integer cents.
- `InlineConfirm` focuses the confirm action; the principles require focus on Cancel.
- `tokens.json` uses `radius.md`; CSS uses `--radius`.

**Hard-coded Portuguese to move into the message catalog (and default to English)**
`Selecione…`, `Buscar…`, `Nada encontrado`, `Carregando`, `Fechar`, `Remover`, `Limpar`, `Hoje`, `Mês anterior`, `Próximo mês`, `Anterior`, `Próxima`, `Paginação`, `Ações`, `Diminuir`, `Aumentar`, `Excluir lançamento`, `Mudar para este status`, `Nenhum registro.`, `Sem dados no período.`, `Arraste arquivos ou escolha no computador`, `PNG, JPG ou PDF até 10 MB`, `Concluído`, `Pensando…`, `Enviar`, `Pergunte ou peça algo…`, `Conversar com o agente`, `Em teste / Ativo / Pausado / Em breve`, `Avaliação / Pergunta`, `Descartar`, `Enviar resposta`, `Resposta do agente`, `Pode editar antes de enviar`, `Pago`, `vencido há N dias`, `vence hoje`, `em N dias`, month/weekday names, `R$`, `pt-BR` date and number formats, `${v} de ${max} estrelas`, `N selecionado(s)`, `Ainda não configurado`, `para aprovar`, `saldo`.

**Files referenced by the handoff but not delivered**
`SKILL.md`, `Dark System.dc.html`, `ui_kits/orders/`, `ui_kits/erp/index.html`, `assets/fonts/`, `_ds_bundle.js` (loaded by every `*.card.html`).

**Cross-cutting implementation issues**
- Inline styles and JS hover state in all 58 components (no CSS pseudo-classes, no media queries, CSP-hostile).
- No `ref` forwarding; `style` is the only escape hatch; no `className`.
- Window/document-level `keydown` Escape listeners in Dialog, Sheet, Popover, Combobox, DatePicker, InlineConfirm (no layer stack).
- Custom `div role="…"` widgets (Checkbox, Switch, RadioGroup, NavItem, AgentCard, StatusSteps, ActionList rows) instead of native elements.
- Missing roving tabindex/arrow keys: RadioGroup, Tabs, SegmentedControl, ChoiceTiles, Menu, MatrixGrid.
- Runtime icon fetch from `unpkg.com`; Google Fonts `@import`.
- `React` hooks imported but unused in several files; `.d.ts` files rely on global `JSX`.
