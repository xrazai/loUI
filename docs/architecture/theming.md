# Theming architecture

How Loui DS is themed, and where each rendering mode lives. Decision record: ADR-0007 (`docs/adr/0007-theming.md`). Tokens: ADR-0003. Everything below is CSS; no component reads a theme from JavaScript.

## Layers

`src/styles/index.css` fixes the cascade order: `reset < tokens < base < components < utilities`.

| File                    | Layer        | What it holds                                                                                                                                                                             |
| ----------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.css` | `tokens`     | Every `--ds-*` custom property on `:root`. **Generated** by `pnpm tokens:build` from `src/tokens/*.json`. Never edit it.                                                                  |
| `src/styles/base.css`   | `base`       | Page defaults, focus, the `paper` scope, `prefers-contrast`, `prefers-reduced-motion`, `forced-colors`. Hand written, small, tokens only (plus CSS system colors inside `forced-colors`). |
| Component CSS Modules   | `components` | Style from `--ds-*` variables and `data-*` state attributes. They never test a theme, so a new theme needs no component edits.                                                            |

A later layer beats an earlier one regardless of specificity, which is why `base` can override `tokens` without `!important`.

## Dark is the default

`:root { color-scheme: dark }` and the semantic tokens in `tokens.css` are the dark theme: `bg-canvas` to `surface-hover` for layers, `line-*` for borders, `text`, `text-2`, `text-3`, and the signals `accent`, `success`, `warning`, `danger`. `color-scheme: dark` makes native controls, scrollbars and form widgets dark too. There is no light theme (ADR-0007).

## `[data-theme]` scopes

A theme is a **scope**: an element with `data-theme="<name>"` re-declares semantic tokens, and everything inside it follows. Scopes nest and can be placed on any element, not only `<html>`.

```html
<section data-theme="paper">...</section>
```

Rules for a scope (in `base.css`, after the `:root` tokens):

1. Re-declare the **semantic** tokens (`--ds-bg`, `--ds-text`, `--ds-line`, `--ds-accent`, the signals), never component tokens.
2. Re-declare every token that **mixes or aliases** a remapped one. A custom property that contains `var(--ds-success)` is resolved on `:root` and inherited as a finished value, so `--ds-success-soft` keeps the dark color inside a scope unless the scope declares it again. `src/styles/paperScope.test.ts` finds those tokens from `tokens.css` and fails when the scope misses one.
3. Set `color-scheme` and the scope's own `background` and `color`, because a scope is a new surface.
4. Verify contrast per scope: add the scope's pairs to `src/tokens/contrast-pairs.json` (checked by `contrast.test.ts`).

## `paper`

The only light scope, for receipt and PDF previews (`[data-theme="paper"]`). Source tokens are `--ds-paper*` in `src/tokens/semantic.color.json`:

- Neutrals and accent: `paper`, `paper-ink`, `paper-ink-2`, `paper-muted`, `paper-rule` (decorative, below 3:1), `paper-accent`.
- Signals (TOK-012): `paper-success`, `paper-warning`, `paper-danger` replace `success`, `warning`, `danger`, because the dark-theme signals are light colors that reach only 1.6 to 2.5:1 on the paper. Their tints (`paper-*-soft`, `paper-danger-soft-hover`, `paper-danger-line`, `paper-accent-soft`) replace `*-soft` and `danger-line`.
- The `PaperReceipt` story of `Components/Card` shows badges, alerts and tinted buttons in the scope. Contrast of every paper pair is tested; axe runs on the story.

## `prefers-contrast: more`

`base.css` strengthens what carries the least contrast: all `line-*` tokens become `gray-7` (5:1 on the surfaces) and `text-3` becomes the `text-2` level (about 8:1). In the `paper` scope the lines become `paper-muted` and `line-control` and `text-3` become `paper-ink-2`. Fills, signals and the focus ring are already above AA and stay. `src/test/preferContrast.test.tsx` emulates the media feature and checks the resolved colors in both scopes.

## `forced-colors: active`

Windows High Contrast and similar modes replace author colors with system colors and drop `box-shadow`, so state must not rest on color alone.

- **Focus** is an `outline`. `:focus-visible` has a transparent `outline` in normal rendering (forced colors repaints it). The forced-colors block of `base.css` also forces `outline: 2px solid Highlight` on `:focus-visible` and `[data-focus-visible]` with `!important` from the `base` layer, so a component that resets `outline` for its normal ring (`box-shadow`) still shows focus. Offsets stay with the component (grid cells use a negative one).
- **Selected, checked and current** need a non-color cue (border, outline, underline, a glyph, weight). `src/test/forcedColors.states.test.tsx` fails when a selected or disabled element paints the same as an unselected or enabled peer.
- **Icons** use `currentColor`, which becomes a system color; the same suite checks every Lucide icon against its background.
- Component CSS may use CSS system colors (`Highlight`, `CanvasText`, `ButtonText`, `GrayText`, ...) inside `@media (forced-colors: active)`; Stylelint allows them there and nowhere else.
- `forced-color-adjust: none` is not used.

The suites switch the mode on with `cdp().send('Emulation.setEmulatedMedia', ...)` (`src/test/forcedColors.ts`); the emulation is page scoped but outlives a test file, so every suite resets it in `afterAll`.

## `prefers-reduced-motion`

`base.css` collapses every animation and transition to 0.01 ms and sets `scroll-behavior: auto`. Components keep state changes instant and never rely on an animation finishing.

## Precedence

`forced-colors` wins over everything (the browser applies it after the cascade). Among the author rules, a scope beats `:root`, and `prefers-contrast: more` is declared after the `paper` block so its `[data-theme='paper']` override wins by source order at equal specificity.

## Adding a theme

1. Declare the scope in `base.css` following the rules above, with tokens added to `src/tokens/` (not hard-coded values).
2. Run `pnpm tokens:build`, add contrast pairs for the scope, and extend `paperScope.test.ts` (or copy it) so derived tokens cannot go stale.
3. Add a story that renders the scope; the axe run over every story then checks it.
4. Add the scope to the visual harness (`tests/visual/README.md` lists themes as a gap) when the baselines are regenerated.

## Known limits

- The visual regression run captures the dark theme only; paper is covered by contrast tests and the `PaperReceipt` story's axe run, not by a screenshot of every component.
- There is no `prefers-color-scheme` handling and no runtime theme switch: scopes are set by the host markup.
