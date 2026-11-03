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


All ADRs 0001–0010 are accepted (see `docs/adr/` and CHANGELOG). New decisions get a new ADR.

---

## Phase 1 — Foundation (tokens, type, icons, themes)

### Tokens


### Typography and fonts


### Icons


### Base styles


### Foundation documentation (port from `guidelines/*.html`, translate to English)


---

## Phase 2 — Architecture and shared primitives


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


---

## Phase 5 — AI-ready foundation

Goal: LLMs and coding agents can discover, use and validate the design system correctly, and cannot silently violate its rules.


---

## Phase 6 — Documentation site (Storybook)


---

## Phase 7 — Packaging, release and governance


---

## Backlog — gaps not in the handoff (needs decision before work)

The handoff inventory is missing common building blocks. Confirm which belong in the DS:

Found by consumer agents building product screens (2026-11-03), each confirmed in the code:

- [ ] **GAP-018** (P2 · M) Clickable card — `Card` is a non-interactive `section`. Needs a decision on API: `Card` with `href`/`onPress` (whole-card press target that renders a real `<a>` or `<button>` on the title with a stretched hit area, no nested interactive content conflicts) versus a separate `CardLink`. Hover = one surface step, focus ring on the card, target size ≥ 24 px, forced-colors safe. Record in an ADR if the nested-interactive rule needs an exception. Second report: a settings category grid wants the whole card to be the click and keyboard target; consumers put an "Open …" button inside instead. A dashed "create new" tile (`AddCard`) is also missing: `AgentCard status="soon"` is non-interactive.
- [ ] **GAP-019** (P2 · M) `Chart` annotations — add a note per point (`notes` by index, like `highlight` but long text shown in the tooltip, the data table and the announcement) and a reference line (`referenceLines: { value, label, kind: 'average' | 'target' }`, with a helper to compute the average), drawn dashed with its label in text so it never depends on color. Update `chartLayout`, the hidden data table and the keyboard announcement. Also let the consumer choose which axis labels show (`tickEvery`); today they are skipped automatically.
- [ ] **GAP-020** (P2 · S) `Legend` percentage — `LegendItem.value` is free `ReactNode`, so consumers hand-build percent strings. Add `showShare` (needs a numeric `amount` per item): prints the share formatted by `formatPercent` for the active locale, with a configurable denominator (sum of visible items by default). Reuse in `StackedBar` and the donut/proportion docs. Same need in `ProportionBar`: its built-in legend shows only share or value, so a payments bar needs columns (value · share · count) and an explicit link between the bar segment and the legend item instead of the implicit order; a one-segment "part of the whole" indicator is missing too (`ProportionBar` with one segment and `Meter` do not fit).

Found by a consumer app on loui-ds 0.2.2 (catalogue screens). Only design-system gaps are tracked here; product behaviour of the consuming app is out of scope. Items marked "verify" were taken from the report and not yet reproduced:

- [ ] **GAP-029** (P3 · M) `MatrixGrid` polish — no async toggle or per-cell pending state (`onToggle` returning a promise), the column header does not stay fixed when the grid scrolls horizontally, and nothing highlights the row and column of the focused cell. Keep the keyboard contract and `aria-*` unchanged.
- [ ] **GAP-030** (P2 · S) `CurrencyInput` — document `onKeyDown`, `onBlur` and `onFocus` in `CurrencyInput.md` (they work through inheritance but are not listed), add a recipe for inline price editing (Enter confirms, Esc cancels, blur confirms), and show the `placeholder` while the value is `null` (today the currency format hides it).
- [ ] **GAP-031** (P3 · S) `Sheet` initial focus — verify whether `autoFocus` on the first field is lost when the sheet is opened programmatically (`element.click()` leaves focus on `body`), and whether it is only a test artifact; if it is real, set initial focus explicitly on open and add a test for keyboard, pointer and programmatic opens.

Second report from the same consumer app (more screens). Same scope rule. Verified in the code unless marked "verify":

- [ ] **GAP-034** (P2 · S) `Combobox` option `leading` slot (a `Swatch`, an `Icon`, an `Avatar`) and a documented "create new" pattern (`allowsCustomValue` with a "Create “x”" option that does not replace `inputValue`). Add a generic recipe for it.
- [ ] **GAP-037** (P2 · S) `Tabs` list shows a vertical scrollbar with three tabs that fit — verify: `scrollHeight` 40 against `clientHeight` 39 (1 px overflow inside `overflow: auto`). Fix the height maths or the overflow rule and add a browser test that asserts no scrollbar.
- [ ] **GAP-042** (P3 · S) Paper surface — the paper theme (`data-theme="paper"`) has no documented entry point on `Card` and `Divider` has no dashed rule (check `DividerVariant` first). Document `data-theme` on `Card`/`Section`-level components and add a dashed `Divider` variant. A receipt or PDF component is product domain and stays out of the DS.
- [ ] **GAP-045** (P3 · S) `Kbd` inside a `Button` doubles the accessible name ("Settings Esc Escape"). Hide the glyph from the accessible name and expose the shortcut once through `aria-keyshortcuts`; add a test of the computed name.
- [ ] **GAP-046** (P3 · S) `useHotkeys` Escape after a closed `ConfirmDialog` — verify: once focus returns to the trigger button (`aria-haspopup`/`aria-expanded`), `Escape` stops firing until focus leaves it. Probably the trigger is treated as inside an overlay; reproduce, add a keyboard test, fix. (The duplicate `F2` "Hotkey conflict" warning in the report comes from the app registering the shortcut twice, not from the design system.)
- [ ] **GAP-047** (P3 · S) `Stepper` with nine steps breaks labels mid-word at about 700 px ("Autonomi/a"). Truncate with a title, wrap at word boundaries only, or switch to the compact "Step 6 of 9" form below a wider breakpoint.
- [ ] **GAP-048** (P3 · M) Small gaps in patterns — `ChatPanel` cannot take `{ role, content }` messages without stable ids and has no configurable busy `Spinner`; `ChoiceTiles` `meta` is one string line (add a second line); `ScrollArea` has no max-height prop for a visible searchable list; a password field with a show/hide toggle is built by hand (document the recipe: `autoComplete="off"`, `aria-pressed`).
- [ ] **GAP-050** (P2 · S) `Sidebar` status has no neutral tone — `status.tone` defaults to `success`, so a closed or idle state ("Register closed") shows a green dot that reads as "all good". Add `neutral` (grey dot, `--ds-text-3`) and make it the default when `tone` is omitted (a status with no tone carries no judgement); the text still carries the meaning. Check the other dot-and-text status renderers for the same default.
- [ ] **GAP-051** (P2 · S) `DataTable` with `minWidth`: the empty state sits inside the horizontally scrollable area, so an empty table scrolls sideways; render the empty state outside the scroll container (or drop the table min width while empty). Flexible columns also all inherit the largest `minWidth` (fixed layout shares free space equally, `tableMinWidth` counts flexible columns × the largest minimum), which is hard to predict: give each flexible column its own minimum (proportional widths or a computed `colgroup`), or document the rule with an example. Consumers now put `minWidth` only on text columns and fixed widths elsewhere.
- [ ] **GAP-052** (P2 · S) Toasts cover the footer of an open `Sheet` (its buttons, "Create another") once two or more toasts stack. Keep toasts clear of an open sheet's footer: offset the region to the free side while a sheet is open at the same edge, or cap visible toasts and stack them; the toast must stay reachable by keyboard and its timer pausable (AGENTS §8). Add a browser test with an open sheet and three toasts.
- [ ] **GAP-053** (P2 · S) `useUndoable` stacks one toast per action (four quick toggles in a grid = four Undo toasts). Add an option to replace the previous toast of the same kind (`groupKey` or `replace: true`): the previous action is committed and its toast closes, the new toast offers Undo for the latest one (or "Undo 4 changes" when the actions can be reverted together; decide and document). Same option on `toastWithUndo`.
- [ ] **GAP-054** (P2 · S) `CurrencyInput` entry mode — typing "200" gives $2.00 (digits are minor units, the documented "digits-only typing" decision). For many users "200" means two hundred. Needs an owner decision: keep digits-only and document it better, or add an opt-in amount mode (whole units first, the locale decimal mark starts the fraction, still exact integers, no float). Fold into GAP-030 when done.
- [ ] **GAP-055** (P3 · S) `LedgerList` in a narrow container — at 384 px with date, amount, balance and the edit + delete buttons, titles shrink to a few characters ("Openi…"). Apply the `ActionList` approach (GAP-017): a container query that moves the balance or the date under the title below a width threshold. Review the `LedgerList` baselines after the change.



---

## Out of scope (for now)

- Cross-platform support beyond Windows: Linux/macOS visual baselines and the CI `visual` job (paused 2026-11-03 by the owner; Windows is the focus). Resume as its own plan.
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
