# Color

Color in Loui DS is dark, flat and quiet. Hierarchy comes from five surface layers and three line weights; color itself is reserved for meaning. Use semantic tokens only (`--ds-surface`, `--ds-text-2`, `--ds-danger`); the primitive palette exists to define them. Every value, description and contrast ratio is listed on the Tokens page.

## Layers

Five surfaces build depth, from the darkest to the lightest. **Move one step at a time** and never skip a layer: a card sits on `bg`, something that floats sits on the card.

| Token                    | Use                                                                         |
| ------------------------ | --------------------------------------------------------------------------- |
| `--ds-bg-canvas`         | The page behind the app shell (the `html` element). Darkest layer.          |
| `--ds-bg`                | App background: body, top bar, main area.                                   |
| `--ds-surface`           | Cards, panels, table bodies and inputs at rest.                             |
| `--ds-surface-raised`    | Menus, popovers, selected rows, anything floating above a surface.          |
| `--ds-surface-hover`     | Hover state of controls and list items: one step above the resting surface. |
| `--ds-surface-row-hover` | Hover for table and list rows only. Subtler, so dense data stays calm.      |

<!-- demo:layers -->

<!-- demo:do-dont-layers -->

## Lines

Borders do the work that shadows do elsewhere. Lines are always 1px. A dashed line means disabled or a total row.

| Token               | Use it for                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `--ds-line-subtle`  | Dividers inside a card or table (row separators). Decorative.                              |
| `--ds-line`         | The border of cards and containers.                                                        |
| `--ds-line-strong`  | The border of overlays: menus, popovers, dialogs.                                          |
| `--ds-line-control` | The boundary of form controls: input, select, textarea, checkbox, radio, combobox trigger. |

Form control boundaries must reach 3:1 against the surface (WCAG 1.4.11). `line` and `line-strong` do not, which is why controls have their own token.

<!-- demo:lines -->

<!-- demo:line-ratios -->

## Text

| Token               | Use                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `--ds-text`         | Primary text and icons. A warm off-white, never pure white. Anything the user must read.       |
| `--ds-text-2`       | Supporting text: descriptions, helper copy, inactive labels.                                   |
| `--ds-text-3`       | Tertiary text: metadata, placeholders, hints. Never the only carrier of essential information. |
| `--ds-text-inverse` | Text and icons on solid light or signal fills (primary button, selected calendar day).         |

All three text tokens pass 4.5:1 on every surface up to `surface-hover` (see the table below). The rule for `text-3` is about hierarchy, not contrast: the most important thing is `text`, supporting detail is `text-2`, and only metadata steps down to `text-3`. Do not use `text-3` on tinted or filled backgrounds; there is no contrast guarantee there.

<!-- demo:text-ratios -->

`--ds-text-inverse` is measured on the fills it sits on, not on surfaces:

<!-- demo:inverse-ratios -->

<!-- demo:do-dont-text3 -->

## Signals

One accent and three status colors. Each signal has a solid value for text and icons, and a soft tint for backgrounds.

- **Accent** (`--ds-accent`): focus, selection, links and "open" states. This is the only accent. **Never a button fill or a large area.** The primary button is light ink on dark (`--ds-primary-bg`), and there is one primary action per screen.
- **Success** (`--ds-success`): done, saved, healthy.
- **Warning** (`--ds-warning`): attention needed, nothing broken.
- **Danger** (`--ds-danger`): errors, invalid fields and destructive actions.

Success, warning and danger **always come with text** (a label, a message, an icon with a name). Color is never the only carrier of meaning.

<!-- demo:signal-samples -->

<!-- demo:signal-ratios -->

<!-- demo:do-dont-accent -->

<!-- demo:do-dont-signal -->

## Soft tints

Soft tokens are the signal color at low opacity (14%, danger 10%), composited over the surface beneath. Use them as the background of badges, banners, selected items and invalid fields, with the solid signal as the text color. The ratio of a signal on its own tint is checked in the test suite.

<!-- demo:soft-tints -->

## Paper

Receipt and PDF previews are the only light surface in the system. Scope them with `[data-theme="paper"]` and use `--ds-paper-*` tokens. `--ds-paper-rule` is decorative (below 3:1) and must never be a control boundary.

Inside the scope, `--ds-success`, `--ds-warning`, `--ds-danger` and `--ds-accent` are remapped to darker twins (`--ds-paper-success`, `--ds-paper-warning`, `--ds-paper-danger`, `--ds-paper-accent`), and their tints (`--ds-success-soft` and the others) are remapped with them, so badges, alerts and tinted buttons keep 4.5:1 on the paper. The `Components/Card` story `PaperReceipt` shows the scope.

<!-- demo:paper -->

## Contrast changes from the handoff

Three tokens were changed from the original design handoff so that every text and control pairing meets WCAG 2.2 AA (task TOK-004). The full record is in `docs/tokens/changes.md`.

| Token                             | Old           | New       | Why                                                                                                                                          |
| --------------------------------- | ------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ds-text-3` (and `--ds-gray-7`) | `#7A7A82`     | `#86868E` | Was 3.86:1 on `surface-hover` and below 4.5:1 on `surface-raised`. Now 4.55:1 on `surface-hover`, so it passes on every surface up to there. |
| `--ds-line-control`               | did not exist | `#64646B` | Control boundaries need 3:1. `line-strong` is about 1.5:1. Now 3.35:1 on `bg`, 3.21:1 on `surface`, 3.02:1 on `surface-raised`.              |
| `--ds-paper-accent`               | `#B8603E`     | `#944A2D` | 5.7:1 on `paper`, 4.7:1 on its 14% tint (TOK-012); the original was below 4.5:1 for text.                                                    |

## Rules of thumb

- Use `text` for what must be read, `text-2` for support, `text-3` for metadata.
- Never use a raw hex value. If a color is missing, add a token.
- Backgrounds are flat: no gradients, textures or illustrations.
- A selected state combines a surface step with a non-color cue (an ink bar, a check), never color alone.
