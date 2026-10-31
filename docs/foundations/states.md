# States and interaction

Every interactive element has the same small set of states, and they look the same everywhere. Feedback is subtle: no press animation, no bounce, no confetti.

## The states

| State    | What changes                                                                                                               | Notes                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Rest     | The base surface, a 1px line.                                                                                              |                                                              |
| Hover    | One surface step lighter (`surface` becomes `surface-hover`). The primary button dims to 88% brightness instead.           | Table rows use the subtler `surface-row-hover`.              |
| Focus    | Accent border plus a 3px ring (`--ds-focus-ring`).                                                                         | Shown for keyboard focus (`:focus-visible`). Always visible. |
| Pressed  | No visual change.                                                                                                          | There is no press animation by design.                       |
| Selected | Raised background plus a 2px ink bar on the left of a row; a 2px ink underline for the active tab; a check for checkboxes. | Never color alone.                                           |
| Disabled | Opacity 35% (`--ds-opacity-disabled`), no hover; inputs also get a dashed border.                                          | One value for every component.                               |
| Invalid  | Danger border and the danger ring (`--ds-focus-ring-danger`), with an error message in text.                               | The message says how to fix it.                              |
| Pending  | The label is replaced by a spinner at the same width. The control stays focusable.                                         | Not disabled: focus is never lost.                           |

States are CSS, not React state: components expose them as data attributes (`data-hovered`, `data-focus-visible`, `data-selected`, `data-disabled`, `data-invalid`), and styles never use inline overrides.

<!-- demo:state-matrix -->

## Fields

Inputs, selects and other fields move through rest, focus, invalid and disabled. Tab into a field to see the focus ring; the other states are set by props.

<!-- demo:fields -->

## Selection controls

<!-- demo:selection -->

## Tabs and rows

An active tab has a 2px ink underline. A selected table row has a raised background and a 2px ink bar on its inline-start edge. Both also work in forced-colors mode.

<!-- demo:tabs-rows -->

## Focus

Focus is always visible. Buttons, fields, tabs and panels show an accent border or a 3px ring; table rows, headers and cells show a 2px accent outline inset in the cell. A transparent outline is kept so the focus indicator also appears in forced-colors (high contrast) mode. Focus is never hidden behind sticky UI, and it is restored to the trigger when an overlay closes.

<!-- demo:focus-tokens -->

## Keyboard model

Keyboard first: everything is reachable and operable without a pointer, `Tab` and `Shift+Tab` walk the page in reading order, and `Ctrl K` (Command K on Apple) opens the command palette. Each row below is also a contract test.

| Pattern                                | Keys                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button / link                          | `Enter`; button also `Space`                                                                                                                            |
| Checkbox / switch                      | `Space` toggles (switch also `Enter` optional)                                                                                                          |
| Radio group / segmented / choice tiles | One tab stop (roving); `Left/Up` previous, `Right/Down` next (radio groups wrap; segmented controls stop at the ends); `Space` selects                  |
| Tabs                                   | Roving; `Left/Right` move; `Home/End`; automatic or manual activation as documented; `Tab` moves into the panel                                         |
| Menu                                   | Trigger `Enter/Space/Down` opens and focuses the first item; `Up/Down`, `Home/End`, typeahead; `Enter/Space` activates; `Esc` closes and restores focus |
| Combobox                               | `Down/Up` open and move (`aria-activedescendant`), `Enter` selects, `Esc` closes then clears, `Home/End` in the list                                    |
| Dialog / sheet                         | Focus trapped; initial focus configurable (Cancel for destructive); `Esc` closes **only the top layer**; focus returns to the trigger                   |
| Popover                                | `Esc` closes and restores focus; focus moves in only if interactive                                                                                     |
| Tooltip                                | Shows on focus and hover; `Esc` dismisses; content is hoverable                                                                                         |
| Accordion / disclosure                 | `Enter/Space` toggles; optional `Up/Down/Home/End` between headers                                                                                      |
| Slider                                 | Arrow keys step; `PageUp/PageDown` large step; `Home/End` min/max                                                                                       |
| Number field (stepper)                 | Textbox with `aria-roledescription="Number field"`; `Up/Down` step; `PageUp/PageDown` step; `Home/End` min/max; typing allowed                          |
| Calendar grid                          | Arrows move by day/week; `PageUp/PageDown` month; `Shift+PageUp/PageDown` year; `Home/End` first/last day of the month; `Enter/Space` selects           |
| Data table                             | Header buttons sort (`aria-sort`); row action via a real button or link; selection checkboxes are labelled                                              |
| Toast / alert                          | Announced through a live region; actions focusable; auto-dismiss pauses on hover and focus                                                              |

Sources: the WAI-ARIA Authoring Practices and React Aria. The same table is in the [accessibility guide](../guides/accessibility.md).

## Undo, or confirm

Two kinds of action, two behaviors. Do not mix them.

- **Undo for almost everything.** Change a status, pay, send, remove a row, link a color: do it at once and show a toast with "Undo" (short-lived, and paused while hovered or focused). It is faster and calmer than asking.
- **Confirm only when deleting a record.** Delete a product, customer, sale, order or entry: open a dialog. The title is "Delete X?", one sentence states the consequence, the red button names the action (`danger-solid`, "Delete order"), and **initial focus is on Cancel**. A toast with "Undo" follows when the data can be restored.

<!-- demo:confirm -->

Anything that goes to a customer or touches money goes through an approval queue instead; see the [principles guide](../guides/principles.md).

## Wordmark

There is no logo. Until a brand exists, the product name is set in Geist 600 as plain text. Do not draw, trace or approximate a mark, and do not use an icon as a logo.

<!-- demo:wordmark -->
