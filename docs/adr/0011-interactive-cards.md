# ADR-0011: Interactive cards as separate components

- Status: Accepted 2026-11-03 (by the owner)
- Date: 2026-11-03

## Context

Consumers want the whole card to be the click and keyboard target: a settings category grid (each tile opens a page) and a dashed "create new" tile next to agent or report cards (GAP-018). Today `Card` is a non-interactive `section`, so consumers put an "Open ..." button inside it, which makes the hit area small and repeats the same label in every tile.

Making a whole region clickable collides with the nested-interactive rule: a card that contains buttons, links or menus cannot also be a link or button, because interactive content inside an `<a>` or `<button>` is invalid HTML and breaks assistive technology.

Options considered:

- (a) Add `href` / `onPress` to `Card`.
- (b) Add separate components for the interactive cases.

## Decision

Option (b). `Card` stays non-interactive and unchanged. We add two components:

- `CardLink`: a navigation or action tile with `title`, `description`, `meta` and `leading`.
- `AddCard`: a dashed "create new" tile with a plus icon and a verb-plus-object label.

Rules for both:

1. **One real interactive element per card.** A native `<a>` through React Aria `Link` when `href` is set, or a native `<button>` through React Aria `Button` when `onPress` is set. `href` and `onPress` form a discriminated union.
2. **The hit area covers the whole card.** `CardLink` uses the stretched-link pattern: the title is the link or button, inside a real heading, and its `::after` covers the card. `AddCard` is the element itself.
3. **No nested interactive content.** These components have no `actions` slot and no `children`; `description`, `meta` and `leading` are documented as non-interactive content. A card that needs inner buttons is a `Card` with a `Button`.
4. **Name and description.** The title is the accessible name; the description and meta are the accessible description (`aria-describedby`), never concatenated into the name.
5. Hover is one surface step lighter, focus draws the AGENTS.md section 7 ring on the card outline (with a transparent outline that survives forced colors), and disabled tiles are dimmed and skipped by `Tab`.

## Consequences

- `Card` keeps a simple, predictable API and its `region` landmark semantics; no mode that changes its role.
- Each interactive card is a single Tab stop with a large target; the semantic and keyboard contract is the one of `Button` and `Link`.
- Because of the stretched overlay, text inside a `CardLink` cannot be selected by dragging. This is accepted for navigation tiles.
- Consumers choose by intent: `Card` to group content with its own controls, `CardLink` to navigate or act, `AddCard` to create. Their docs point to each other.
- We maintain two more components and their tests; `AgentCard status="soon"` may adopt `AddCard` later.

## Alternatives considered

- `href` / `onPress` on `Card`: one component, but its root would change role (region, link, button) and the type system could not forbid nested interactive children without a heavy union; `actions` would have to be disabled conditionally.
- Wrapping a `Card` in a link: puts a heading and paragraphs inside the anchor, so the accessible name becomes the whole text of the card.
- A button "Open ..." inside every card: the current workaround; small target and repeated labels.
