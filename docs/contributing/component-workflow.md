# Component migration workflow

Binding procedure for every agent (or human) porting a handoff component. Read `AGENTS.md` first; this file adds the step-by-step.

## Inputs

For component `<Name>` in handoff group `<group>`:

- `raw_files/design_handoff_erp_tecidos/components/<group>/<Name>.jsx` — visual spec (values, states, layout). **Not** code to copy.
- `…/<Name>.d.ts` — the original prop API (translate docs; fix what the TODO task says).
- `…/<Name>.prompt.md` — usage intent (translate; verify claims against the code — they drift).
- `TODO.md` task `CMP-…` for `<Name>` — the defect list you must fix.
- `docs/adr/` (esp. 0001 RAC, 0002 styling, 0005 i18n, 0006 money), `docs/architecture/i18n.md`, `docs/architecture/utilities.md`.
- Token reference: `src/tokens/generated/` and `src/styles/tokens.css` (`--ds-*` variables only).

## Steps

1. **Choose the behavior base.** If React Aria Components has the pattern (Button, ToggleButton, TextField, Select, ComboBox, Checkbox, RadioGroup, Switch, Tabs, Menu, Popover, Dialog/Modal, Tooltip, Slider, NumberField, DatePicker, Calendar, Table, GridList, ProgressBar, Meter, Breadcrumbs, Disclosure, TagGroup, DropZone, ToggleButtonGroup, Toolbar, Link, Separator), build on it. Use its render-prop `className` / `data-*` attributes for state. Do not re-implement keyboard, focus or ARIA that RAC already handles.
2. **Folder** `src/components/<Name>/` (core) or `src/patterns/<Name>/` (ADR-0008 patterns): `<Name>.tsx`, `<Name>.module.css`, `<Name>.messages.ts` (if any built-in string), `<Name>.stories.tsx`, `<Name>.test.tsx`, `<Name>.md`, `index.ts`.
3. **API** (AGENTS.md §9): ref as a prop; `className`; consumer props spread onto the root and composed with internal handlers (`mergeProps`); vocabulary `variant` / `size` (`sm|md|lg`) / `tone` (`neutral|accent|success|warning|danger`); controlled + uncontrolled (`value`/`defaultValue`/`onChange` following RAC naming when wrapping RAC); TSDoc on every prop (agents read it).
4. **Styles**: CSS Module in `@layer components`; only `var(--ds-*)`; states through `[data-hovered]`, `[data-focus-visible]`, `[data-pressed]`, `[data-disabled]`, `[data-selected]`, `[data-invalid]`, `[data-variant="…"]`, `[data-size="…"]`; `forced-colors` and reduced-motion handled.
   - **Form-control boundaries** (input, select trigger, checkbox, radio, combobox, switch track when off) use `--ds-line-control` and must stay ≥ 3:1 in **every** state. Do not change a field's background to `--ds-surface-hover` on hover (`line-control` drops to 2.8:1 there); signal hover by brightening the border (e.g. `--ds-text-3`) instead.
   - Missing value? Never hard-code. Component-scoped tokens go in **`src/tokens/component/<name>.json`** (DTCG, with `$description`, referencing semantic tokens where possible, CSS name `--ds-<name>-…`); run `pnpm tokens:build` and commit the source plus regenerated outputs. New _semantic/primitive_ tokens: report to the PM instead.
5. **Strings**: none inline. English default + `pt-BR` in `<Name>.messages.ts`; `useMessages`.
6. **Stories** (CSF3, `title: 'Components/<Name>'` or `'Patterns/<Name>'`, `tags: ['autodocs']`): `Default`, every variant/size/tone, disabled, invalid, loading, long text, and interactive `play` functions for keyboard behavior. Stories run as tests with the a11y addon (violations fail).
7. **Tests** (`<Name>.test.tsx`, browser project): rendering, props, events, controlled/uncontrolled, message override via `renderWithProvider(ui, { locale: 'pt-BR' })`, keyboard contract from AGENTS.md §8, and an `it('has no axe violations', …)` per meaningful state using `expectNoA11yViolations`.
8. **Doc** `<Name>.md` (English): summary · when to use / when not · anatomy · props (key ones) · accessibility (keyboard + screen reader notes) · content rules · examples · differences from the handoff.
9. **Do not edit** shared files (`src/index.ts`, `src/patterns/index.ts`, TODO/CHANGELOG/AGENTS) unless your brief says you own them. Report the exports to add.
10. **Verify**: `pnpm lint`, `pnpm typecheck`, `pnpm vitest run --project browser --project storybook <your paths>`, then `pnpm check` if no parallel agent is mid-change.
11. **Commit** only your paths: `feat(<name>): …`, ending with the co-author line given in your brief.

## Lessons from earlier batches

- RAC 1.22 deprecates some classic exports (e.g. `Checkbox`, `Switch`, `Radio` → `CheckboxField`/`CheckboxButton`, `SwitchField`/`SwitchButton`, `RadioField`/`RadioButton`). Check the `.d.ts` for `@deprecated` before choosing an API.
- RAC overlays write an inline `z-index`; pass `--ds-z-*` through the overlay's `style` prop (documented exception).
- Controlled props follow RAC names (`isSelected`, `onChange(value)`, `isDisabled`, `isInvalid`).
- Do not generate visual baselines (`pnpm test:visual:update`) — the harness snapshots every story in the repo; the PM regenerates baselines after each batch.
- Parallel agents share the machine: run tests filtered by project and path; a full `pnpm test` run concurrently with other agents can be flaky.
- Reuse existing components (`Button`, `IconButton`, `Icon`, `Spinner`, `Field` parts, `Badge`, `Kbd`) instead of re-styling equivalents.

## Never

- Kill processes by image name (`taskkill /IM node.exe`, `python.exe`…): other agents and tools run on this machine. Stop only processes you started, by PID.
- `git add -A`, `git commit -a`, `--no-verify`, `git push`, history rewrites.

## Report to the PM

Per component: done / partial, defects fixed from the TODO list, anything deferred (with reason), missing tokens, exports to add, test counts. Keep it short and honest.
