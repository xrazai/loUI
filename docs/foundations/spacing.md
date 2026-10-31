# Spacing, sizing and radius

Everything sits on a 4px grid and has a fixed size, so the same element lives in the same place in every module. Use tokens, never raw pixels.

## Spacing scale

Nine steps. The unit is 4px; steps are named by their multiple (`--ds-space-3` is 3 x 4px = 12px).

| Variable        | Value | Use                                                      |
| --------------- | ----- | -------------------------------------------------------- |
| `--ds-space-1`  | 4px   | Icon-to-text gaps, tight padding.                        |
| `--ds-space-2`  | 8px   | Default gap between related elements inside a component. |
| `--ds-space-3`  | 12px  | Compact padding, gaps between form fields.               |
| `--ds-space-4`  | 16px  | Standard padding and gap between components.             |
| `--ds-space-5`  | 20px  | Card padding.                                            |
| `--ds-space-6`  | 24px  | Gap between sections of a page.                          |
| `--ds-space-8`  | 32px  | Large section separation.                                |
| `--ds-space-12` | 48px  | Page-level separation.                                   |
| `--ds-space-16` | 64px  | Hero and empty-state breathing room.                     |

Rules of thumb: card padding is 20px; gaps **inside** a component are 8 to 16px; gaps **between** sections are 24 to 32px. Do not mix steps in one group, and do not use values off the grid.

<!-- demo:space -->

## Control heights

Controls come in three heights. The default is 40px. Pick one size per group of controls and do not mix them in a row.

| Token               | Value | Use                                    |
| ------------------- | ----- | -------------------------------------- |
| `--ds-control-h-sm` | 32px  | Dense toolbars and table filters.      |
| `--ds-control-h-md` | 40px  | Default: buttons, inputs, selects.     |
| `--ds-control-h-lg` | 48px  | Primary actions and touch-first forms. |

<!-- demo:controls -->

## Fixed layout sizes

| Token              | Value | Use                                                                     |
| ------------------ | ----- | ----------------------------------------------------------------------- |
| `--ds-item-h`      | 36px  | Menu items, navigation items, listbox options.                          |
| `--ds-row-h`       | 52px  | Table and list rows.                                                    |
| `--ds-row-h-dense` | 60px  | Rows with two lines of content. It is taller on purpose: it holds more. |
| `--ds-topbar-h`    | 64px  | The top bar.                                                            |
| `--ds-sidebar-w`   | 240px | The app sidebar.                                                        |

<!-- demo:layout -->

## Target size

No interactive element may be smaller than 24 x 24 CSS px (`--ds-target-min`, WCAG 2.5.8). Small visuals, such as the 18px checkbox box, reach the minimum through their label row or padding. Never shrink the clickable area to match a small icon.

<!-- demo:target -->

## Radius

Radius follows the role of the element, so nested shapes look related.

| Token              | Value | Elements                                                       |
| ------------------ | ----- | -------------------------------------------------------------- |
| `--ds-radius-sm`   | 4px   | Chips, menu items, small marks.                                |
| `--ds-radius-md`   | 6px   | Buttons and inputs.                                            |
| `--ds-radius-lg`   | 10px  | Cards, menus, popovers, dialogs.                               |
| `--ds-radius-pill` | 999px | Badges and switches. Any very large value renders fully round. |

The checkbox box uses a component token (`--ds-checkbox-radius`, 5px). An inner element has a smaller radius than its container.

<!-- demo:radius -->

## Elevation

Hierarchy comes from surface plus border, not from shadow. There are **only two shadows, and only overlays use them**.

| Token                 | Use                                             |
| --------------------- | ----------------------------------------------- |
| `--ds-shadow-overlay` | Floating overlays: menus, popovers, toasts.     |
| `--ds-shadow-dialog`  | Dialogs and side sheets: the highest elevation. |

No inner shadows, no glow, no blur. Cards, panels and inline elements are flat. Dialogs use the `--ds-overlay` backdrop and sheets use the lighter `--ds-scrim`, both without blur.

<!-- demo:elevation -->
