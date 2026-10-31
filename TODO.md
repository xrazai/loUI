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

- [ ] **SETUP-005** (P1 · M) CI (GitHub Actions): install → lint → typecheck → unit → a11y → build → Storybook build → visual regression → size budget. Required checks on PRs. A draft `.github/workflows/ci.yml` running `pnpm check` exists but is untested (no remote yet); add the pinned Playwright Docker image for visual baselines.
- [ ] **SETUP-007** (P2 · S) `CONTRIBUTING.md`, issue templates (bug, component request, token change), `CODEOWNERS`. (PR template with the Definition of Done already exists.)
- [ ] **SETUP-009** (P2 · S) Extend `pnpm check` (or a `check:full` script) with `build-storybook`, `publint`, `attw` and `size`; replace the placeholder `size-limit` entry with per-entry budgets.

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

- [ ] **ARCH-001** (P0 · M) Component conventions (see AGENTS.md): `forwardRef`/ref as prop (React 19), `className`, `...rest` spread **before** internal handlers' merge point, `data-*` state attributes, `asChild`/`render` pattern if needed, `displayName`. _Depends: ADR-001, ADR-002_
- [ ] **ARCH-002** (P0 · M) **Event/prop API normalization.** The handoff mixes `onChange(event)` (Input, Textarea), `onChange(value, event)` (Select), `onChange(boolean)` (Checkbox, Switch) and `onChange(value)` (Tabs, Combobox). Standardize: native elements keep native `onChange`; custom controls use `value` / `defaultValue` / `onValueChange` (or `checked` / `onCheckedChange`). Standardize `variant` vs. `tone` vs. `kind` vs. `status` naming across Button, Badge, Alert, Toast, Progress, StatCard, DueIndicator, AgentCard, ApprovalCard.
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

- [ ] **TEST-002** (P0 · M) **Automated accessibility harness (unit level):** `vitest-axe` run against every story in every state (rest, hover/focus where applicable, disabled, invalid, loading, open overlays). A component cannot be marked done with an axe violation.
- [ ] **TEST-003** (P0 · M) **Real-browser accessibility harness:** Playwright + `@axe-core/playwright` against built Storybook (jsdom cannot compute color contrast). Tags: `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`, `best-practice`. Run in dark theme, `forced-colors: active`, `prefers-reduced-motion: reduce` and 200% zoom.
- [ ] **TEST-004** (P1 · L) **Keyboard-contract tests**, one per ARIA Authoring Practices pattern used (button, checkbox, radio group, switch, tabs, menu, combobox, listbox, dialog, popover/disclosure, accordion, slider, spinbutton, grid, breadcrumb, table, tooltip, toast/alert). The contract table in AGENTS.md is the spec; each row becomes tests (Tab order, arrows, Home/End, Enter/Space, Esc, focus restore).
- [ ] **TEST-007** (P1 · S) **Public API regression:** `api-extractor` (or `.d.ts` snapshot) report committed to the repo; PR fails on unreviewed export/prop changes. Add `publint` and `are-the-types-wrong` checks.
- [ ] **TEST-008** (P1 · S) **SSR/hydration smoke test:** render every exported component with `renderToString` and hydrate with no warnings; no `window`/`document` access at import time.
- [ ] **TEST-009** (P1 · S) **Bundle-size budgets** with `size-limit` per entry point; tree-shaking test (importing `Button` must not pull `Chart`).
- [ ] **TEST-010** (P1 · M) **i18n tests:** every built-in string is in the `messages` catalog (a test fails if a JSX string literal or `aria-label` literal appears in `src/` outside the catalog); `en` and `pt-BR` catalogs have identical keys; long-string (German-like +40%) and RTL pseudo-locale smoke renders.
- [ ] **TEST-012** (P2 · M) Interaction tests as Storybook `play` functions for complex flows (destructive confirm with Cancel focus, undo toast, combobox select, date selection, table sort/select/paginate) reused by both unit and visual runs.
- [ ] **TEST-013** (P2 · S) Manual screen-reader checklist per release (NVDA + Firefox, VoiceOver + Safari, TalkBack optional) stored in `docs/a11y/`; record results per component.
- [ ] **TEST-014** (P2 · S) WCAG 2.2 specifics as explicit tests: target size ≥ 24 px (2.5.8), focus not obscured by sticky bars/toasts (2.4.11), dragging alternatives (2.5.7), consistent help, reflow at 320 px (1.4.10), text spacing override (1.4.12).
- [ ] **TEST-015** (P2 · S) Flaky-test policy: retries only in visual CI, quarantine label, weekly review; coverage reported but not the quality gate (a11y + contract tests are).
- [ ] **TEST-016** (P3 · M) Mutation/fuzz testing for utilities (`formatCurrency`, `compareText`, `dueInfo`, color luminance) with property-based tests (`fast-check`).

---

## Phase 5 — AI-ready foundation

Goal: LLMs and coding agents can discover, use and validate the design system correctly, and cannot silently violate its rules.

- [ ] **AI-001** (P0 · S, ongoing) Keep `AGENTS.md` accurate (it is the entry point for agents; `CLAUDE.md` imports it). Review it whenever conventions change.
- [ ] **AI-003** (P1 · M) Convert the 58 `*.prompt.md` files into English `docs/components/<Name>.md` usage notes with a fixed template (when to use, when not, anatomy, props table, accessibility, content rules, examples). Correct the spec drift found in the originals (Appendix B).
- [ ] **AI-006** (P1 · M) **Golden examples / recipes:** small, fully tested compositions (destructive confirm, form with validation, filterable table, empty state, settings page, undo toast, approval queue). Each passes axe, keyboard-contract and visual tests, and is referenced from the manifest so agents imitate verified patterns instead of inventing markup.
- [ ] **AI-007** (P1 · M) **Design rules as executable checks.** ESLint plugin `eslint-plugin-<name>`: no raw colors/px in app code, no inline `style` colors, no deprecated props, one `variant="primary"` Button per JSX scope (heuristic warning), icon-only buttons require `label`, microcopy lint (sentence case, no exclamation marks, no emoji, verb+object button text) where statically checkable.
- [ ] **AI-008** (P2 · L) **MCP server** exposing the DS to agents: `list_components`, `get_component` (props + examples + a11y), `search_tokens`, `get_recipe`, `validate_snippet` (type/lint/axe on a snippet). Backed by the manifest.
- [ ] **AI-009** (P2 · M) Claude Code skill (`.claude/skills/<name>/SKILL.md`) — the handoff references a `SKILL.md` that was not delivered; create it from AGENTS.md essentials + manifest pointers.
- [ ] **AI-011** (P2 · M) Codemod infrastructure (`jscodeshift`) shipped with every breaking change; deprecations carry migration hints agents can apply automatically.
- [ ] **AI-013** (P3 · L) **AI-native components** (streaming message, thinking/progress state, tool-call/step display, citations/sources, feedback controls, approval gate, stop/retry). Seed from `ChatPanel`, `ApprovalCard`, `AgentCard`; follow the "approve before sending, autonomy per task, undo not confirm" agent principles.
- [ ] **AI-014** (P3 · M) Snapshot evaluation set: a list of natural-language UI prompts + expected component usage, run against the MCP/manifest in CI to catch regressions in AI-facing docs.

---

## Phase 6 — Documentation site (Storybook)

- [ ] **DOCS-001** (P1 · M) Storybook with Vite builder, MDX docs, addons: a11y, interactions, viewport, themes (dark/forced-colors), controls, docs. Theme Storybook itself with the DS tokens.
- [ ] **DOCS-002** (P1 · M) Story conventions: CSF3, one `Default` + one story per variant/size/state, `play` functions for interactions, `argTypes` generated from types. Replace the 9 handoff `*.card.html` showcase files (Babel-in-browser, unpinned `_ds_bundle.js`, missing from the delivery).
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
- [ ] **GAP-002** (P2 · M) Typography components: `Text`, `Heading` (semantic level separate from visual size), `Link`, `Code`.
- [ ] **GAP-003** (P2 · M) `Field` / `FormGroup` / `FieldSet`, form-level error summary, inline validation timing guidance ("only after first submit attempt").
- [ ] **GAP-004** (P2 · L) Command palette (⌘K "search or run"), plus a `useHotkeys` hook with a shortcut registry and conflict detection (the keyboard model F2/F9/N/Enter/Esc/1–4 comes from the ERP spec — extract only the generic mechanism).
- [ ] **GAP-005** (P2 · M) `Toggle` / `ToggleGroup`, `NumberField` (successor of Stepper), `TagInput`, `Table` primitives for static tables.
- [ ] **GAP-006** (P3 · M) `Drawer` (generic), `Banner`, `Tour/Coachmark`, `Stepper/Wizard` (progress for multi-step flows like the 9-step "new agent" assistant), `Timeline`.
- [ ] **GAP-007** (P3 · M) Data visualization expansion: sparkline, donut/meter, stacked bars, legend component, shared chart a11y layer.
- [ ] **GAP-008** (P3 · S) Undo pattern as a documented recipe/hook (`useUndoable`) built on Toast — "undo instead of confirm" is a core product principle.

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
