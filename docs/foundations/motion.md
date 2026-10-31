# Motion, layering and iconography

Motion is minimal, layers are strictly ordered, and icons come from one small curated set.

## Motion

Motion explains a change; it never decorates. Only `color`, `background-color`, `border-color`, `opacity` and position change, never size or layout.

| Token                    | Value                        | Use                                                                              |
| ------------------------ | ---------------------------- | -------------------------------------------------------------------------------- |
| `--ds-duration`          | 150ms                        | Standard transition: hover, focus and state changes.                             |
| `--ds-duration-done`     | 320ms                        | Completion feedback: a subtle check or fill when something is done. No confetti. |
| `--ds-duration-progress` | 300ms                        | Progress bar fill changes.                                                       |
| `--ds-ease`              | `cubic-bezier(0.2, 0, 0, 1)` | Easing for every transition: fast start, soft landing.                           |

Rules:

- Use the tokens; never write a raw duration or easing.
- No press animation, bounce, spring, parallax or looping decoration. The only continuous animation is a loading spinner.
- Feedback for a finished task is subtle and positive: a green check, a filled progress bar, a calm toast.

<!-- demo:motion -->

### Reduced motion

When the user asks for less motion (`prefers-reduced-motion: reduce`), the base stylesheet cuts every transition and animation to an instant change, globally. Components must not depend on a transition to communicate state: the end state alone has to be clear. Do not add per-component motion that bypasses this rule.

## Layering

Overlays use a fixed stack of z-index tokens. Raw `z-index` values are not allowed.

| Layer    | Token             | Value | Why it sits here                                                                                |
| -------- | ----------------- | ----- | ----------------------------------------------------------------------------------------------- |
| Sheet    | `--ds-z-sheet`    | 40    | Side panels with their scrim. The panel is the sheet value plus one. The lowest overlay.        |
| Dialog   | `--ds-z-dialog`   | 45    | Modals and their backdrop. Above sheets, so a dialog opened from a sheet stacks on top of it.   |
| Dropdown | `--ds-z-dropdown` | 50    | Selects, comboboxes, date pickers. Above dialogs and sheets because they open from inside them. |
| Popover  | `--ds-z-popover`  | 55    | Popovers and action menus. Above dropdowns, dialogs and sheets.                                 |
| Toast    | `--ds-z-toast`    | 58    | Confirmations and Undo. Above every overlay so they stay visible.                               |
| Tooltip  | `--ds-z-tooltip`  | 60    | The highest layer. It must never be hidden. Do not add layers above it.                         |

Order: **sheet < dialog < dropdown < popover < toast < tooltip**. `Esc` closes only the top layer. Overlays render through a shared portal, so they never depend on the stacking context of their trigger.

<!-- demo:layers -->

## Iconography

Icons are Lucide, bundled in the package (never fetched from a CDN at runtime), drawn with a 1.5px stroke in `currentColor`.

- **Curated set only.** Import from the design system (`SearchIcon`, `XIcon`), not from `lucide-react`. To add an icon, add it to the set with a documented use first.
- **Decorative unless labelled.** `Icon` hides itself from assistive technology by default; the text next to it names the control. Pass `label` only when the icon carries meaning on its own. An icon-only control is an `IconButton`, and its `label` is required.
- **Sizes** are tokens: `xs` 12px, `sm` 14px, `md` 18px (default), `lg` 20px.
- **Directional icons** (chevrons, arrows) take the `directional` prop so they mirror in right-to-left languages.
- **No emoji.** No filled or colored icons, with one exception: the filled star of `Rating`. Unicode glyphs appear only inside a labelled `IconButton`.
- Color comes from the surrounding text color. A status icon is paired with text; do not rely on its color.

<!-- demo:icons -->

### Decorative and labelled

<!-- demo:icon-usage -->
