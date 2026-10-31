# eslint-plugin-loui

ESLint rules that turn the Loui DS design rules ([AGENTS.md](../../AGENTS.md) sections 2, 6, 8, 9 and 13) into executable checks for **app code** that uses `@loui/ds`. Flat config, ESLint 9 or 10, plain ESM with no build step. TSX needs a TypeScript parser (`typescript-eslint`). Task: AI-007.

The rules are heuristics on purpose: they only read what is statically visible (string literals, object literals, JSX attributes) and stay silent on anything dynamic. A rule that cannot be sure does not report.

## Enable it

```js
// eslint.config.js
import tseslint from 'typescript-eslint';
import loui from 'eslint-plugin-loui';

export default [
  { files: ['**/*.{ts,tsx}'], languageOptions: { parser: tseslint.parser } },
  loui.configs.recommended, // errors: 1, 2, 4, 8. warnings: 3, 5, 6, 7.
];
```

Or pick rules one by one:

```js
{ plugins: { loui }, rules: { 'loui/no-raw-colors': 'error', 'loui/content-rules': ['warn', { properNouns: ['Northwind Web'] }] } }
```

| Rule                                                     | Recommended |
| -------------------------------------------------------- | ----------- |
| [`loui/no-raw-colors`](#no-raw-colors)                   | error       |
| [`loui/no-raw-spacing`](#no-raw-spacing)                 | error       |
| [`loui/one-primary-action`](#one-primary-action)         | warn        |
| [`loui/icon-button-label`](#icon-button-label)           | error       |
| [`loui/no-deprecated`](#no-deprecated)                   | warn        |
| [`loui/allowed-icons`](#allowed-icons)                   | warn        |
| [`loui/content-rules`](#content-rules)                   | warn        |
| [`loui/no-inline-style-visual`](#no-inline-style-visual) | error       |

### Where the plugin gets its data

Rules read two files from the design system package at lint time. Both are optional; when a file is missing the rules that need it have nothing to check and never crash.

| Data                                                  | Used by                                        | Looked up in this order                                                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest.json` (components, props, status, icon set) | `no-deprecated`, `allowed-icons`, DS detection | `settings.loui.manifest` (object), `settings.loui.manifestPath`, `@loui/ds/package.json` then `dist/manifest.json`, then `docs/manifest.json` up from cwd       |
| `content-rules.json` (microcopy rules)                | `content-rules`                                | `settings.loui.contentRules` (object), `settings.loui.contentRulesPath`, `@loui/ds` `dist/ai/content-rules.json`, then `docs/ai/content-rules.json` up from cwd |

`settings.loui.packages` (default `["@loui/ds"]`) lists the module names whose exports count as design system components. An element is a design system component when its name is imported from one of those packages (also as `import * as DS`, `<DS.Button>`), or from a relative path under a name that exists in the manifest (how the DS repo's own stories import).

---

## no-raw-colors

Disallows hex, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()` and (in color properties) named colors in: `style` objects, SVG color attributes (`fill`, `stroke`, `stopColor`, `floodColor`, `lightingColor`, `color`) on non-design-system elements, Tailwind-style arbitrary values in `className` (`bg-[#fff]`, also inside `clsx`/`cn`/`classNames`), and `styled`/`css`/`keyframes`/`createGlobalStyle` template strings.

Why: AGENTS.md section 2, rule 4 ("Tokens only") and section 9 (only `var(--token)` values for color). Raw colors break theming and contrast guarantees.

```tsx
// invalid
<div style={{ color: '#fff', background: 'rgb(0 0 0 / 50%)' }} />
<svg fill="red" />
<div className="bg-[#1a1a1a]" />
const Box = styled.div`color: #fff;`;

// valid
<div style={{ color: 'var(--ds-color-text)', background: 'transparent' }} />
<svg fill="currentColor" />
<Swatch color="#1f3a93" /> // data prop of a design system component
```

Options: `allow: string[]` (exact values accepted, case-insensitive), `named: boolean` (default `true`).

## no-raw-spacing

Disallows `px`, `rem` and `em` literals, and unitless numbers (React renders them as `px`), in `style` for `margin*`, `padding*`, `gap`, `rowGap`, `columnGap` and the sizing properties (`width`, `height`, `min*`, `max*`, `inlineSize`, `blockSize`). Zero, percentages, viewport units and `var()` / `calc(var())` are fine.

Why: AGENTS.md section 2, rule 4 (no raw `px` for spacing). Use `var(--ds-space-*)` or the spacing props of a layout component (`Stack gap`).

```tsx
// invalid
<div style={{ gap: 12, margin: '8px 0', maxWidth: 520 }} />

// valid
<div style={{ gap: 'var(--ds-space-3)', margin: 0, width: '100%' }} />
```

Options: `units: string[]` (default `["px", "rem", "em"]`), `ignoreProperties: string[]`, `extraProperties: string[]` (for example `["top", "left"]`).

## one-primary-action

Heuristic. Warns on the second and later `<Button variant="primary">` in the same scope. A scope is the enclosing function, or the enclosing `Dialog`, `ConfirmDialog`, `Sheet`, `Popover` or `InlineConfirm` (those are their own layer). Buttons in different branches of a `?:`, an `if`/`else`, an early-returning `if` or a `switch` are mutually exclusive and not counted. A dynamic `variant` is ignored.

Why: AGENTS.md section 13 ("one primary action per screen") and the `Button` docs: primary is the single main action.

```tsx
// invalid
<div><Button variant="primary">Save</Button><Button variant="primary">Publish</Button></div>

// valid
<div><Button variant="primary">Save</Button><Button>Cancel</Button></div>
{busy ? <Button variant="primary">Stop</Button> : <Button variant="primary">Run</Button>}
```

Options: `components: string[]` (default `["Button"]`), `scopes: string[]`, `max: number` (default `1`).

## icon-button-label

1. `IconButton` without a non-empty `label`. TypeScript already requires it; this catches JavaScript users and `as any` escapes. A `{...props}` spread is trusted.
2. `button` / `Button` whose only child is an icon (`Icon` or any `*Icon` component) without `aria-label`, `aria-labelledby`, or a `label` on the `Icon`.

Why: AGENTS.md section 8 (accessible names; icon-only controls must be named). Prefer `IconButton`, which also gives a tooltip.

```tsx
// invalid
<IconButton icon={PlusIcon} />
<button><Icon icon={XIcon} /></button>

// valid
<IconButton label="Add order" icon={PlusIcon} />
<button aria-label="Close"><Icon icon={XIcon} /></button>
```

Option: `buttons: string[]` (default `["button", "Button"]`).

## no-deprecated

Warns on design system components whose manifest `status` is `deprecated`, and on props that the manifest marks `deprecated` (a `deprecated` field, `status: "deprecated"`, or `@deprecated` in the prop description; a message after the tag is shown as the migration hint).

Why: AGENTS.md section 13 ("Never use `deprecated` components").

```tsx
// invalid, when OldBanner is deprecated in the manifest
<OldBanner />
```

Options: `deprecatedComponents: { [name]: hint }`, `deprecatedProps: { "Component.prop": hint }` (merged with the manifest, useful before the manifest carries the information).

## allowed-icons

Warns on any import from `lucide-react`. Icons come from the curated set exported by `@loui/ds` (`PlusIcon`, `XIcon`, ...). When the imported name has a curated equivalent the message names it (`Plus` and `PlusIcon` both map to `PlusIcon`; `LoaderCircle`, `Loader2`, `AlertCircle`, `MoreHorizontal` and a few other legacy names are aliased). Type-only imports are ignored.

Why: ICON-003 and AGENTS.md section 13: the icon set is curated, listed in the manifest, and tree-shaken from one place.

```tsx
// invalid
import { Plus, Truck } from 'lucide-react';

// valid
import { PlusIcon } from '@loui/ds';
```

Options: `sources: string[]` (default `["lucide-react"]`), `from: string` (default `"@loui/ds"`, used in messages), `allow: string[]`. Turn the rule off for the files that define the curated set itself.

## content-rules

Checks string literals given to design system components against the **static** rules of [`docs/ai/content-rules.json`](../../docs/ai/content-rules.json): the JSON is the single source of truth, so adding a rule with `"check": "static"`, a `pattern`, a `match` and `appliesTo` makes the plugin enforce it with no code change. Rules with `"check": "review"` are for humans and models and are ignored here.

What is checked:

- text children of `Button` (context `button`), `MenuItem` (`menu-item`) and `Tab` (`tab`);
- the props `title` (`title`), `label` and `placeholder` (`label`), `description` (`description`), and `SubMenu` `label` (`menu-item`);
- from the JSON: `sentence-case`, `no-exclamation`, `no-emoji`, `no-decorative-ellipsis`, the `forbidden.phrases` list ("Click here", ...) and `forbidden.bareButtonLabels` ("OK", "Send", "Submit", ... as the whole button text, case-insensitive).

Heuristics: `sentence-case` only runs when the string is the whole text; keyboard glyphs (`⌘`, `⇧`, arrows) are not emoji; 2 to 4 letter acronyms after the first word ("Export CSV") are accepted unless the whole text is shouting ("NEW ORDER"); proper nouns come from the `properNouns` option.

Why: AGENTS.md section 6 (content rules).

```tsx
// invalid
<Button>New Order</Button>
<Button>Saved!</Button>
<Button>OK</Button>
<Dialog title="Done 🎉" />
<Input placeholder="Search..." />

// valid
<Button>Create order</Button>
<SubMenu label="Move to…" />
<Button>Open Northwind Web</Button> // with properNouns: ['Northwind Web']
```

Options: `properNouns: string[]`, `acronyms: boolean` (default `true`), `ignoreRules: string[]` (JSON rule ids, plus `forbidden-phrases` and `button-verb-object`), `props: { [prop or "Component.prop"]: context }`, `children: { [Component]: context }`.

## no-inline-style-visual

On design system components, `style` may only set custom properties. Any other key (`color`, `width`, `padding`, ...) is reported. Dynamic values go in as `--ds-<component>-<name>` custom properties, never as direct visual properties. Plain DOM elements are not covered (see `no-raw-colors` and `no-raw-spacing`).

Why: AGENTS.md section 9 and the ADR-0002 amendment.

```tsx
// invalid
<Card style={{ background: 'var(--ds-color-surface)', padding: 8 }} />

// valid
<Card style={{ '--ds-card-pad': 'var(--ds-space-4)' }} />
```

Options: `allowProperties: string[]`, `customPropertyPrefix: string` (default `"--"`; set `"--ds-"` to require the design system prefix).

---

## Development

```sh
pnpm --filter eslint-plugin-loui test
```

The tests use ESLint's `RuleTester` with the TypeScript parser, a small in-memory manifest and the real `docs/ai/content-rules.json`. The root `eslint.config.js` dogfoods the plugin at `warn` level on `src/**/*.stories.tsx` and `examples/**`.
