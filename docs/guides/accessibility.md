# Accessibility

Accessibility is part of the definition of done for every component. The target is **WCAG 2.2 Level AA**, using the WAI-ARIA Authoring Practices patterns.

## Conformance target

- Real semantics first: native `<button>`, `<a>`, `<input>`, `<table>` where possible; ARIA only to fill gaps.
- Every interactive element has an accessible name. Icon-only controls require a `label` (enforced by the types).
- Errors, hints and descriptions are programmatically linked (`aria-describedby`, `aria-invalid`).
- Visible focus on every focusable element, including in `forced-colors` mode. Focus is never hidden behind sticky UI and is restored when overlays close.
- Contrast: 4.5:1 for text, 3:1 for UI boundaries and graphics. Every foreground and surface pairing is listed in `tokens.json` with its measured ratio and checked by a unit test.
- Color is never the only carrier of meaning.
- Targets are at least 24 by 24 CSS px (WCAG 2.5.8); default controls are 40 px.
- `prefers-reduced-motion`, `forced-colors` and `prefers-contrast` are respected; 200% text zoom and 320 px reflow are supported.
- Time-limited actions (such as an Undo toast) can be paused by hover or focus and reached by keyboard.

## Keyboard model

React Aria Components provides the behavior; each row becomes contract tests.

| Pattern          | Keys                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Button, link     | `Enter`; button also `Space`                                                                                                                |
| Checkbox, switch | `Space` toggles                                                                                                                             |
| Radio group      | One tab stop (roving); arrow keys move and select, wrapping                                                                                 |
| Tabs             | Roving; `←` `→` move; `Home` `End`; `Tab` moves into the panel                                                                              |
| Menu             | Trigger opens with `Enter`, `Space` or `↓`; `↑` `↓`, `Home` `End`, typeahead; `Enter` or `Space` activates; `Esc` closes and restores focus |
| Combobox         | `↓` `↑` open and move; `Enter` selects; `Esc` closes, then clears                                                                           |
| Dialog, sheet    | Focus trapped; initial focus configurable (Cancel for destructive); `Esc` closes only the top layer; focus returns to trigger               |
| Popover, tooltip | `Esc` closes; tooltips show on focus and hover                                                                                              |
| Tag group        | One tab stop; arrow keys move; `Backspace` or `Delete` removes                                                                              |
| Toast, alert     | Announced through a live region; actions are focusable; auto-dismiss pauses on hover and focus                                              |

Application-level shortcuts use `useHotkey` (for example `Mod+K`); they ignore editable fields and IME composition so they never fight typing.

## How we test

Stories are the single source of states; the tests iterate over them.

| Layer             | Tool                                 | Guards                                                                |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------- |
| Static            | `eslint-plugin-jsx-a11y` (strict)    | Role misuse, missing labels                                           |
| Component         | Vitest browser mode (Chromium)       | Props, states, events, controlled and uncontrolled, message overrides |
| Automated a11y    | axe-core through the Storybook addon | Structural WCAG violations on every story; a violation fails the test |
| Keyboard contract | Vitest and story `play` functions    | The keyboard table above                                              |
| Contrast          | Token unit test and browser checks   | Every token pair against its minimum ratio                            |
| Visual            | Screenshot baselines                 | Unintended appearance changes                                         |
| SSR               | Server render tests                  | No `window` access; hydration-safe                                    |
| Manual            | Screen reader checklist per release  | What automation cannot judge                                          |

Rules: a bug fix starts with a failing test; axe rules are never disabled globally; a scoped exception needs a comment with the reason and a task ID.

## Assistive technology

Automated checks cover structure and contrast. Manual screen reader testing (NVDA with Firefox and Chrome, VoiceOver with Safari, TalkBack) is planned per release against a checklist. No manual screen reader pass has been recorded yet, so treat that coverage as not yet performed.

## Known limitations

- Automated tests cannot judge reading order, announcement quality or whether labels make sense; those are reviewed by hand.
- jsdom cannot compute contrast or layout, so contrast and layout checks run in a real browser.
- Dark is the only theme. Contrast has been verified for it and for the `paper` scope; a new theme needs its own verification.

## Reporting an issue

Open an issue with the component, the browser and assistive technology, the steps, and what you expected. Accessibility bugs are treated as defects, not enhancements.
