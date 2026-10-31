# Token changes from the handoff

Every deliberate difference between the design handoff (`raw_files/design_handoff_erp_tecidos/tokens/`) and the token source in `src/tokens/`. The handoff stays untouched; this file is the record.

## Contrast fixes (TOK-004)

Decided by the project manager. Ratios are WCAG 2.2 relative-luminance contrast, verified by `src/tokens/contrast.test.ts`.

| Token                           | Old             | New       | Why                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-gray-7` and `--ds-text-3` | `#7A7A82`       | `#86868E` | `text-3` was 3.86:1 on `surface-hover` and below 4.5:1 on `surface-raised`. Now 4.55:1 on `surface-hover`, so it passes 4.5:1 on every surface up to `surface-hover`.                                                                                    |
| `--ds-line-control`             | (did not exist) | `#64646B` | Form control boundaries (input, select, checkbox, radio, combobox trigger) need 3:1 (WCAG 1.4.11); `line-strong` is about 1.5:1. Now 3.35:1 on `bg`, 3.21:1 on `surface`, 3.02:1 on `surface-raised`. `line-strong` stays for overlays, menus and cards. |
| `--ds-paper-accent`             | `#B8603E`       | `#A95839` | 4.53:1 on `paper` (was below 4.5:1 for text).                                                                                                                                                                                                            |

## Paper signals (TOK-012)

Inside `[data-theme="paper"]` the dark-theme signal colors are light and fail on the paper (1.6 to 2.5:1), so the scope remaps them. Verified by the `paper-*` pairs in `src/tokens/contrast-pairs.json`.

| Token                                                                               | New                             | Why                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--ds-paper-success`, `--ds-paper-warning`, `--ds-paper-danger` (new)               | `#17683D`, `#7F5200`, `#A8231B` | Remap `--ds-success`, `--ds-warning`, `--ds-danger` on paper: 6.1, 6.0 and 6.4:1 on paper, 4.8:1 or more on their tints. |
| `--ds-paper-*-soft`, `--ds-paper-danger-soft-hover`, `--ds-paper-danger-line` (new) | color-mix of the paper twin     | Tints and borders that follow the remapped signal.                                                                       |
| `--ds-paper-accent`                                                                 | `#A95839` to `#944A2D`          | 5.7:1 on paper and 4.7:1 on `--ds-paper-accent-soft` (new); `#A95839` was 3.8:1 on its own tint.                         |

## Renamed

| Handoff                           | Now                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `--bg`, `--text`, `--accent`, ... | `--ds-bg`, `--ds-text`, `--ds-accent`, ... (every variable has the `--ds-` prefix, ADR-0003) |
| `--radius`                        | `--ds-radius-md`                                                                             |
| `--control-h`                     | `--ds-control-h-md`                                                                          |

## Changed values

| Token                                            | Handoff                                                                   | Now                                                                          | Why                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--ds-tracking-display`                          | `-0.02em`                                                                 | `-0.68px`                                                                    | DTCG 2025.10 dimensions only allow `px` and `rem`. The role has a fixed 34px size, so the px value is identical. |
| `--ds-tracking-title`                            | `-0.01em`                                                                 | `-0.22px`                                                                    | Same, 22px.                                                                                                      |
| `--ds-tracking-caption`                          | `0.08em`                                                                  | `0.92px`                                                                     | Same, 11.5px.                                                                                                    |
| `--ds-opacity-disabled`                          | `.35`, `.4` and `.45` (varied per component)                              | `.35`                                                                        | One value for every disabled state.                                                                              |
| `--ds-font-sans`, `--ds-font-mono`               | `"Geist", system-ui, sans-serif`                                          | `"Geist", "Geist Fallback", system-ui, sans-serif` (and the mono equivalent) | The metric-matched fallback faces from `fonts.css` sit between the web font and the system font.                 |
| `--ds-shadow-overlay`, `--ds-shadow-dialog`      | `rgba(0, 0, 0, 0.6)` and `0.7`                                            | `#0009` and `#000000b3`                                                      | Same colors in hex8 (`0.7` rounds to `0.702`).                                                                   |
| `--ds-overlay`, `--ds-scrim`, `--ds-swatch-ring` | `rgba(5, 5, 6, 0.72)`, `rgba(5, 5, 6, 0.55)`, `rgba(255, 255, 255, 0.12)` | hex8 equivalents                                                             | Same colors; `swatch-ring` is new as a token (it was a literal in the handoff).                                  |

## New tokens

| Token                                                                    | Value                                   | Why                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-line-control`                                                      | `#64646B`                               | See contrast fixes.                                                                                                                                                                                                                                                        |
| `--ds-row-h-dense`                                                       | `60px`                                  | Used by the handoff for dense rows; was a literal.                                                                                                                                                                                                                         |
| `--ds-icon-xs` / `sm` / `md` / `lg`                                      | `12` / `14` / `18` / `20px`             | Icon sizes the handoff hard-codes.                                                                                                                                                                                                                                         |
| `--ds-target-min`                                                        | `24px`                                  | WCAG 2.5.8 minimum target.                                                                                                                                                                                                                                                 |
| `--ds-duration-progress`                                                 | `300ms`                                 | Progress bar fill.                                                                                                                                                                                                                                                         |
| `--ds-z-dropdown` / `popover` / `sheet` / `dialog` / `toast` / `tooltip` | `40` / `45` / `50` / `55` / `58` / `60` | Derived from the handoff literals 40, 45, 50, 51 and 60, but strictly increasing. The handoff put dialog and sheet at 50 (panel 51). Now the sheet scrim is `z-sheet`, the sheet panel is `calc(var(--ds-z-sheet) + 1)`, and a dialog opened from a sheet stacks above it. |
| `--ds-opacity-disabled`                                                  | `.35`                                   | Unified.                                                                                                                                                                                                                                                                   |
| `--ds-swatch-ring`                                                       | `#FFFFFF1F`                             | Inset ring on swatches.                                                                                                                                                                                                                                                    |

## Type scale floor (TOK-005)

`--ds-fs-caption` (11.5px) is the smallest font size in the system. It is stated in the description of every `fs` token and enforced by `src/tokens/tokens.test.ts`.

## Not carried over

- `tokens.json` (Tokens Studio export) is partial and uses unitless dimensions; the CSS files were treated as the source of truth.
- `fonts.css` imported Geist from Google Fonts; replaced with self-hosted files (no runtime fetch).
- The handoff `:focus-visible` rule removed the outline. The base layer now keeps a transparent outline (visible in forced-colors mode).
- Handoff links had no underline until hover. Links are now underlined at rest (WCAG 1.4.1).
