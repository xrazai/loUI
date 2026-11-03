# Principles

These rules apply to every screen built with Loui DS. They are short on purpose. When a case is not covered, choose the option that keeps the user's attention on one thing.

## Three rules

1. **One accent.** The blue accent (`--ds-accent`) is only for focus, selection, links and "open" states. Never use it for buttons or large fills.
2. **Ink for action.** The primary button is light on dark (`--ds-primary-bg`). Use **one primary action per screen**.
3. **Borders first.** Hierarchy comes from surface plus border. Shadows only on overlays: menus, toasts, dialogs and sheets.

## Clarity and focus

The system is designed for use that needs no effort of attention (the first product's owner has ADHD). Every new screen follows these rules.

1. **One main action per screen,** always at the top right, with a keyboard shortcut.
2. **The most important thing comes first and is largest.** Everything else is secondary text (`--ds-text-2`, `--ds-text-3`).
3. **Color only carries meaning, and is always accompanied by text.** Never signal status by color alone.
4. **Fixed positions.** The same element lives in the same place in every module, with no misalignments: a 4 px grid and fixed heights.
5. **Deleting always asks for confirmation** in a dialog: the title "Delete X?", the consequence in one sentence, a red button that names the action, and **initial focus on Cancel**. A toast with "Undo" follows. Reversible actions (mark, link, change status) never ask; they only offer "Undo".
6. **Lists are alphabetical by default** (locale-aware, accent-insensitive), including groups, columns and select options. Exceptions: tasks (by urgency) and dated records such as orders (newest first). Use `sortByText`.
7. **Visible progress.** Counters that go down, a day progress bar, a green check for done. Feedback is **subtle**: a 320 ms transition, no confetti.
8. **Save automatically** and show "Saved".
9. **Keyboard first.** `⌘K` for everything, and shortcuts on primary actions.

## Agents (AI features)

For products that put an AI agent in front of customers or money.

1. **Approve before sending.** Anything that goes to a customer or touches money goes through an approval queue. The default is to ask for approval.
2. **Autonomy per task,** never per whole agent. Low-star reviews (1 to 3 stars) always require approval.
3. **Undo, don't confirm.** Sending and discarding show a toast with Undo.
4. **The chat is for the owner,** not for the customer: to test, ask why and adjust. It reads the guidelines and the current data.
5. **Customer-facing replies** are short, factual, make no delivery-time or discount promises, and use no emoji.

## Visual foundations

The authoritative values are the design tokens (see the Tokens page). The summary:

- **Color.** A slightly warm neutral ramp from `#050506` to `#EDEDEA` (text is never pure white). Signals are pastel-bright so they keep contrast on dark: accent `#8AB4FF`, success `#5FD49A`, warning `#E9B65C`, danger `#F07A6E`. Soft backgrounds use `color-mix`.
- **Layers.** canvas, bg, surface, raised, hover. Move one layer at a time; do not skip layers.
- **Type.** Geist (400, 500, 600) for the interface, Geist Mono (400, 500) for data. Display and title use negative tracking.
- **Spacing.** A 4 px grid: 4, 8, 12, 16, 20, 24, 32, 48, 64. Card padding is 20; gaps of 8 to 16 inside components and 24 to 32 between sections.
- **Controls.** Heights 32, 40 (default) and 48. Buttons and inputs share the same height.
- **Radius.** 4 for chips, menu items and checkboxes; 6 for buttons and inputs; 10 for cards, menus and dialogs; pill for badges and switches.
- **Lines.** 1 px always. Subtle for internal dividers, regular for cards, strong for controls and overlays. Dashed means disabled or a total row.
- **Elevation.** Only `--ds-shadow-overlay` and `--ds-shadow-dialog`. No inner shadows, no glow, no blur.
- **States.** Hover is one surface step lighter. There is no press animation. Focus is an accent border plus a 3 px ring. A selected row has a raised background and a 2 px inset ink bar; the active tab has a 2 px ink underline. Disabled controls use reduced opacity and, for inputs, a dashed border.
- **Motion.** Minimal: 150 ms, `cubic-bezier(.2, 0, 0, 1)`, only color, opacity and position. Honor `prefers-reduced-motion`.
- **Backgrounds.** Flat. No gradients, textures or illustrations. Photos appear only in avatars and thumbnails.

## Iconography

- The icon set is **Lucide**, 1.5 px stroke, `currentColor`, **bundled** (never fetched from a CDN at runtime). Import icons from `loui-ds` (`PlusIcon`, `SearchIcon`, ...), not from `lucide-react`.
- Icons are decorative unless given a label. Icon-only controls use `IconButton`, which requires a `label`.
- No emoji. No filled or colored icons. Unicode glyphs (`+`, `×`, `⌘`) only inside labelled icon buttons.
- Outside the sidebar the system is text-first: actions use a label.
