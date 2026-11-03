# Screen-reader checklist

Automated tests (axe, WCAG suites, keyboard contracts) prove structure and keyboard behavior. They cannot prove what a person hears. Before every release, someone runs this checklist with real assistive technology and records the outcome in [screen-reader-results.md](./screen-reader-results.md) (TEST-013).

## Matrix

| Screen reader | Browser          | OS      | Required                                |
| ------------- | ---------------- | ------- | --------------------------------------- |
| NVDA (latest) | Firefox (latest) | Windows | Yes                                     |
| VoiceOver     | Safari (latest)  | macOS   | Yes                                     |
| TalkBack      | Chrome           | Android | Optional (touch layouts, 320 px reflow) |
| JAWS          | Chrome           | Windows | Optional                                |

Use the published Storybook (<https://xrazai.github.io/loUI/>), open a story in its own tab (the "Open canvas in new tab" button) so the Storybook chrome does not interfere, and use the default settings of each screen reader.

## How to run it

1. Start at the top of the story and move with the virtual cursor (NVDA: arrows; VoiceOver: VO + arrows), then with `Tab`.
2. Operate the component with the keys in the [keyboard contract](../../AGENTS.md#8-accessibility-requirements).
3. Check every item of the generic list and of the pattern list below.
4. Record each component as **Pass**, **Issue** (with a link to a TODO task) or **Not run**. A release may ship with **Not run** rows only for experimental components; never with an open **Issue** on a stable one.

## Generic checks (every component)

- [ ] The role is announced correctly (button, link, checkbox, tab, dialog, …) and matches what the component does.
- [ ] The accessible name is announced and is the visible label (WCAG 2.5.3); icon-only controls announce their `label`.
- [ ] State is announced: pressed, checked, selected, expanded, current, disabled, invalid, required.
- [ ] Descriptions and errors linked with `aria-describedby` are read after the name, once.
- [ ] Nothing decorative is announced (icons, separators, swatches without meaning).
- [ ] Numbers, currency and dates are read naturally in both English and `pt-BR` (switch the story's locale).
- [ ] No text is announced twice (visible text plus a duplicate visually hidden copy).

## Pattern checks

**Forms (Input, Textarea, Select, Combobox, NumberField, CurrencyInput, DatePicker, Checkbox, RadioGroup, Switch, Slider, FileUpload, TagInput, Form, FormErrorSummary)**

- [ ] Label, required state and hint are read on focus.
- [ ] After a failed submit, focus moves to the first error (or the summary) and the error text is read.
- [ ] Combobox and Select announce the number of options and the active option while moving.
- [ ] DatePicker announces the month when the calendar opens and each day with its full date.

**Overlays (Dialog, ConfirmDialog, Sheet, Drawer, Popover, Menu, Tooltip, CommandPalette, Tour)**

- [ ] Opening announces the title (dialog, sheet, tour step) and moves focus inside when the overlay is interactive.
- [ ] Destructive confirmation focuses Cancel first and reads the consequence sentence.
- [ ] `Esc` closes only the top layer and focus returns to the trigger, which is announced.
- [ ] Tooltips are read on focus as descriptions, not as names.

**Live feedback (Toast, Alert, Banner, ChatPanel streaming, ResponseFeedback, Spinner, Progress)**

- [ ] A new toast is announced once, without stealing focus; its Undo action is reachable (`F6` or the documented shortcut) before it dismisses, and the timer pauses while focused.
- [ ] ChatPanel announces a streaming reply once when it completes (not every token), and "Stop"/"Retry" are reachable.
- [ ] Busy states announce "Loading" (or the given label) once.

**Navigation and structure (AppShell, Sidebar, NavItem, TopBar, Breadcrumb, Tabs, Pagination, SkipLink, Stepper)**

- [ ] Landmarks are listed with distinct names (NVDA `D`, VoiceOver rotor).
- [ ] Headings form a sensible outline (one `h1`).
- [ ] The current page, tab, step or breadcrumb item is announced as current.
- [ ] The skip link is the first stop and moves to the main content.

**Data (DataTable, LedgerList, MatrixGrid, RankList, Timeline, charts: Chart, Sparkline, DonutMeter, ProportionBar, StackedBar, Legend)**

- [ ] Table navigation (NVDA `Ctrl+Alt+arrows`, VoiceOver `VO+arrows`) reads column headers with each cell.
- [ ] Sort state is announced on the header ("ascending").
- [ ] Row selection checkboxes name the row they select.
- [ ] Every chart has a text alternative (summary or data table) that conveys the same information.

## Known gaps that need this checklist

**TEST-018** (live-region announcements). Verified automatically in Chromium by `src/test/live-regions/` (`chatPanel.test.tsx`, `toast.test.tsx`, `patterns.test.tsx`), which record live-region mutations (what a browser hands to a screen reader) and read Chromium's accessibility tree over CDP (roles, names, `live`, `atomic`, `busy`):

- ChatPanel: the log is not live, one polite atomic status region speaks "Thinking�", "The assistant is responding" and the full reply once on completion (never a token), a failure once, history never; `busy` is set only while streaming; Stop and Retry are named and keyboard reachable.
- Toast: one assertive atomic alert per new toast ("Success: �"), nothing when a toast closes or the region re-renders, focus not moved, region and alert dialog named, Undo reachable (F6, then Tab). Timer pause on hover and focus: `src/components/Toast/Toast.test.tsx`.
- ToolCallStep and ResponseFeedback: one polite announcement per change, none on first render.

Still needs a human, because speech output and AT-specific heuristics cannot be automated here:

- [ ] NVDA + Firefox (Windows) and VoiceOver + Safari (macOS): run the "Live feedback" rows above on the ChatPanel streaming, Toast (with Undo) and ResponseFeedback stories. Confirm each message is spoken once, in full, and that the Toast alert is not cut off by the focused control.
- [ ] Same screen readers: confirm the ChatPanel log is still readable with the virtual cursor while a reply streams (`aria-busy` handling differs between AT).
- [ ] VoiceOver in particular: `role="alert"` inside the Toast `alertdialog` (React Aria's structure) is announced once, not twice.
