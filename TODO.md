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

- [ ] **GAP-015** (P2 · S) Done state for task rows — nothing renders a completed task with strikethrough (the only `line-through` is a hidden `Legend` item). Add `isDone` to `ActionListItem` (and to the checkbox list of GAP-017): `text-3` plus `line-through`, with the state also in text/`aria` (done is never color or decoration alone). _Depends: GAP-017 for the checkbox row._ Second report: the "done" state of the handoff is a struck-through title, but consumers cannot style it, so they use a checkbox plus a "Done" badge and an Undo button.
- [ ] **GAP-016** (P2 · S) `DueIndicator` accepts only `YYYY-MM-DD` — `date` and `today` are `ISODate` strings. Accept `Date` and ISO date-time strings too (normalize to the local calendar day with `toISODate`, document the time-zone rule in `DueIndicator.md`), keep the `ISODate` fast path and the development-time throw for malformed values. Second report: task chips use free text with a tone ("Due today", "Pickup at 2 pm", "Waiting for you"), so also offer a `label` + `tone` form without a date, and let `paid` show the paid date ("Paid Oct 30") with wording that does not assume grammatical gender (the message receives the date; document how locales override it).
- [ ] **GAP-017** (P2 · M) List with checkbox and row action — `ActionList` omits all `GridList` selection props, so a row can have either a press action or a menu but no checkbox. Decide first (ADR or note in `ActionList.md`): add `selectionMode` + `onSelectionChange` + `isDone` to `ActionList`, or a new `CheckList`. Contract: checkbox toggles with `Space`, `Enter` runs the row action, each checkbox has an accessible name, undo toast for reversible toggles (§5.5). Second report: a task row needs a control on the left, a module label, a due chip and actions on the right; consumers build it with `Inline` + `Divider` by hand.
- [ ] **GAP-018** (P2 · M) Clickable card — `Card` is a non-interactive `section`. Needs a decision on API: `Card` with `href`/`onPress` (whole-card press target that renders a real `<a>` or `<button>` on the title with a stretched hit area, no nested interactive content conflicts) versus a separate `CardLink`. Hover = one surface step, focus ring on the card, target size ≥ 24 px, forced-colors safe. Record in an ADR if the nested-interactive rule needs an exception. Second report: a settings category grid wants the whole card to be the click and keyboard target; consumers put an "Open …" button inside instead. A dashed "create new" tile (`AddCard`) is also missing: `AgentCard status="soon"` is non-interactive.
- [ ] **GAP-019** (P2 · M) `Chart` annotations — add a note per point (`notes` by index, like `highlight` but long text shown in the tooltip, the data table and the announcement) and a reference line (`referenceLines: { value, label, kind: 'average' | 'target' }`, with a helper to compute the average), drawn dashed with its label in text so it never depends on color. Update `chartLayout`, the hidden data table and the keyboard announcement. Also let the consumer choose which axis labels show (`tickEvery`); today they are skipped automatically.
- [ ] **GAP-020** (P2 · S) `Legend` percentage — `LegendItem.value` is free `ReactNode`, so consumers hand-build percent strings. Add `showShare` (needs a numeric `amount` per item): prints the share formatted by `formatPercent` for the active locale, with a configurable denominator (sum of visible items by default). Reuse in `StackedBar` and the donut/proportion docs. Same need in `ProportionBar`: its built-in legend shows only share or value, so a payments bar needs columns (value · share · count) and an explicit link between the bar segment and the legend item instead of the implicit order; a one-segment "part of the whole" indicator is missing too (`ProportionBar` with one segment and `Meter` do not fit).

Found by a consumer app on loui-ds 0.2.2 (catalogue screens). Only design-system gaps are tracked here; product behaviour of the consuming app is out of scope. Items marked "verify" were taken from the report and not yet reproduced:

- [ ] **GAP-022** (P2 · S) Controlled `Sheet`/`Dialog` without `trigger` log "A PressResponder was rendered without a pressable child" on every open. Render `DialogTrigger` only when `trigger` is given (or use the controlled `ModalOverlay` path); add a console-clean test for controlled open.
- [ ] **GAP-024** (P2 · M) Colour field — there is no `ColorField`/`ColorPicker`; consumers fake it with a masked `Input` plus `Swatch`. Decide (ADR note) whether to wrap React Aria `ColorField` (hex input with `Swatch` preview, validation message, `#RRGGBB` normalisation) and, later, a picker. Hex stays in mono type; colour is never the only carrier of meaning.
- [ ] **GAP-025** (P2 · S) Standalone error text — `FieldError` renders only inside a React Aria field, and `Text` `tone` has no `danger`. Add tones `success | warning | danger` to `Text` (still paired with words, §2.3) and an `ErrorText` (or make `FieldError` usable with `aria-describedby` outside a field) for groups, so a group error does not need a heavy `Alert`.
- [ ] **GAP-026** (P2 · S) `ColorOptionGroup` pattern — `ColorOption` has no group: consumers hand-build `Inline role="group"` and control `isSelected`/`isDisabled` per item. Add a group with a name, multiple `value`, per-item `isDisabled`, roving keyboard behaviour like `ChoiceTiles`, and `errorMessage`/`isInvalid` linked with `aria-describedby`. _Depends: GAP-025._
- [ ] **GAP-027** (P2 · S) `DataTable` column sizing — `width` is a CSS string only, and narrow viewports squash columns (a "Colors" cell with six swatches overlapped at 800 px). Add per-column `minWidth` and `truncate`/wrap options through the existing `--ds-data-table-col-w` variable, plus a column header with a visually hidden label for icon-only columns (the `label` stays the accessible name). Also: mono uppercase headers never wrap and truncate to "SUPPL…" in narrow columns (allow a two-line header or a `minWidth` that fits it), and document that a `Button` inside a cell does not trigger `onRowAction`.
- [ ] **GAP-028** (P2 · S) Icon set is missing generic action glyphs — only 30 icons exist; there is no trash (delete) or pencil (edit). Add `trash` and `pencil` (Lucide, 1.5 px) to `icons.ts` with usage descriptions, and review the set against generic UI actions (print, users, bell, bot, sparkles, archive, link, filter, sort). Domain icons (truck, wallet, cart, WhatsApp) belong to the consuming product, not to the core set.
- [ ] **GAP-029** (P3 · M) `MatrixGrid` polish — no async toggle or per-cell pending state (`onToggle` returning a promise), the column header does not stay fixed when the grid scrolls horizontally, and nothing highlights the row and column of the focused cell. Keep the keyboard contract and `aria-*` unchanged.
- [ ] **GAP-030** (P2 · S) `CurrencyInput` — document `onKeyDown`, `onBlur` and `onFocus` in `CurrencyInput.md` (they work through inheritance but are not listed), add a recipe for inline price editing (Enter confirms, Esc cancels, blur confirms), and show the `placeholder` while the value is `null` (today the currency format hides it).
- [ ] **GAP-031** (P3 · S) `Sheet` initial focus — verify whether `autoFocus` on the first field is lost when the sheet is opened programmatically (`element.click()` leaves focus on `body`), and whether it is only a test artifact; if it is real, set initial focus explicitly on open and add a test for keyboard, pointer and programmatic opens.

Second report from the same consumer app (more screens). Same scope rule. Verified in the code unless marked "verify":

- [ ] **GAP-034** (P2 · S) `Combobox` option `leading` slot (a `Swatch`, an `Icon`, an `Avatar`) and a documented "create new" pattern (`allowsCustomValue` with a "Create “x”" option that does not replace `inputValue`). Add a generic recipe for it.
- [ ] **GAP-036** (P2 · S) `Sheet`/`Dialog` exit animation — when the state that feeds the content is cleared on close, the panel animates out empty (blank fields, error text flashing); the `DetailSheet` recipe has the same flaw. Also verify that the overlay leaves the DOM when the tab is hidden or `prefers-reduced-motion` applies (it stayed as `role="dialog"` in an automated run). Keep children until the exit finishes, or document the pattern, and add a test with reduced motion.
- [ ] **GAP-037** (P2 · S) `Tabs` list shows a vertical scrollbar with three tabs that fit — verify: `scrollHeight` 40 against `clientHeight` 39 (1 px overflow inside `overflow: auto`). Fix the height maths or the overflow rule and add a browser test that asserts no scrollbar.
- [ ] **GAP-038** (P2 · M) Layout primitives — `Grid` has only equal columns, so a content column plus a fixed 360 px side panel is not possible, and nothing keeps a child sticky while the page scrolls. Add `Grid` fixed-column support or a `SplitLayout`/`SidePanel` (fixed width token, sticky option, collapses under a breakpoint). `Input`/`Textarea`/`Select` have no `fullWidth`/`grow` prop (only `Button` has), so a field in an `Inline` row cannot take the free space. Verify that an `AppShell` `detail` that renders `null` hides the panel.
- [ ] **GAP-039** (P2 · S) Field message with tone — "Matches", "Over by $5", "Short by $5" under a field need a success/warning/danger message; `description` has no tone and `errorMessage` is for errors only, so consumers put a `Badge` inside the description. Add a description tone (text stays the carrier). _Related: GAP-025._
- [ ] **GAP-040** (P2 · S) `LedgerList` — `onDelete` applies to every row and `date` is required. Support per-entry `isDeletable` and an optional date so a drawer can mix deletable and fixed rows.
- [ ] **GAP-041** (P2 · S) `SegmentedControl` and `FieldSet` labelling — `SegmentedControl` takes only `aria-label` (no visible `label` or `description`), `count` cannot show a shortcut hint, it stretches to full width inside a `Stack`, and long labels truncate ("Transfer…" at 440 px with four options). The `FieldSet` legend renders as a mono uppercase caption unlike the `Label` of sibling fields. Add a visible `label`, a width/overflow rule (wrap or scroll) and align legend and label styles or document when each applies.
- [ ] **GAP-042** (P3 · S) Paper surface — the paper theme (`data-theme="paper"`) has no documented entry point on `Card` and `Divider` has no dashed rule (check `DividerVariant` first). Document `data-theme` on `Card`/`Section`-level components and add a dashed `Divider` variant. A receipt or PDF component is product domain and stays out of the DS.
- [ ] **GAP-043** (P2 · S) `Swatch` with no colour — it throws in development for anything but `#rgb`/`#rrggbb`, but model data can be `transparent` or empty. Accept `undefined`/`null` as an empty circle (still decorative) and export the `isHexColor` guard.
- [ ] **GAP-044** (P2 · S) Undo outside components — `toast(…, { action })` has no default label and `useUndoable` is a hook, so actions in plain modules repeat "Undo" by hand and skip the locale catalogue. Export a non-hook helper that takes the label from the message catalogue and the active locale.
- [ ] **GAP-045** (P3 · S) `Kbd` inside a `Button` doubles the accessible name ("Settings Esc Escape"). Hide the glyph from the accessible name and expose the shortcut once through `aria-keyshortcuts`; add a test of the computed name.
- [ ] **GAP-046** (P3 · S) `useHotkeys` Escape after a closed `ConfirmDialog` — verify: once focus returns to the trigger button (`aria-haspopup`/`aria-expanded`), `Escape` stops firing until focus leaves it. Probably the trigger is treated as inside an overlay; reproduce, add a keyboard test, fix. (The duplicate `F2` "Hotkey conflict" warning in the report comes from the app registering the shortcut twice, not from the design system.)
- [ ] **GAP-047** (P3 · S) `Stepper` with nine steps breaks labels mid-word at about 700 px ("Autonomi/a"). Truncate with a title, wrap at word boundaries only, or switch to the compact "Step 6 of 9" form below a wider breakpoint.
- [ ] **GAP-048** (P3 · M) Small gaps in patterns — `ChatPanel` cannot take `{ role, content }` messages without stable ids and has no configurable busy `Spinner`; `ChoiceTiles` `meta` is one string line (add a second line); `ScrollArea` has no max-height prop for a visible searchable list; a password field with a show/hide toggle is built by hand (document the recipe: `autoComplete="off"`, `aria-pressed`).



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
