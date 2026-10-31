# EmptyState

Status: experimental

A typographic placeholder for a list, table or panel that has nothing to show. It says what happened and what the user can do about it.

## When to use

- A list, table or search has no results.
- A feature has no data yet and the user can create some.

## When not to use

- While data is loading: use `Skeleton`.
- When loading failed: use `Alert` with a retry action.
- For a short inline note inside a field: use the field's description.

## Anatomy

```
div.root (dashed border, centered)
  span[aria-hidden]  icon (optional)
  h{headingLevel}    title
  p                  description (optional)
  div                secondaryAction, action
```

## Props

| Prop              | Type                         | Default | Notes                                                              |
| ----------------- | ---------------------------- | ------- | ------------------------------------------------------------------ |
| `title`           | `ReactNode`                  | -       | What happened. Rendered as a heading                               |
| `headingLevel`    | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`     | Match the page outline (inside a `Card` titled with `h2`, use `3`) |
| `description`     | `ReactNode`                  |         | What to do next. Max width 360 px                                  |
| `icon`            | `ReactNode`                  |         | Optional, decorative. No illustrations                             |
| `action`          | `ReactNode`                  |         | Primary action (usually `Button`)                                  |
| `secondaryAction` | `ReactNode`                  |         | Lower emphasis; shown before the primary action                    |
| `compact`         | `boolean`                    | `false` | Less padding, smaller title. For cards, panels, table bodies       |
| `bordered`        | `boolean`                    | `true`  | Dashed border. Turn off inside an already bordered container       |

Other `div` attributes and `ref` go to the root.

## Copy: what happened + what to do

Title: say what is missing, in sentence case, without apologies or exclamation marks. Description: tell the user the next step, in one sentence.

| Situation        | Title             | Description                                              | Action        |
| ---------------- | ----------------- | -------------------------------------------------------- | ------------- |
| Filtered to zero | No orders found   | Try another filter or search term.                       | Clear filters |
| First use        | No orders yet     | Orders created here or in the store appear in this list. | Create order  |
| Cleared inbox    | Nothing to review | New approvals appear here as they arrive.                | (none)        |

Avoid "Oops", "Sorry", blame ("You have no orders") and filler ("There is nothing to show here at the moment").

## Accessibility

- The title is a real heading: choose `headingLevel` so the outline stays sequential. The heading lets screen reader users find the empty region by navigating headings.
- The icon is decorative and hidden from assistive technology; the text carries the meaning.
- The component does not announce itself. If the empty state replaces content after a user action (for example a search), announce the result count in your own live region.
- Actions are ordinary buttons or links with their own names; order in the DOM is secondary then primary, matching the visual order.

## Examples

```tsx
<EmptyState
  title="No orders found"
  description="Try another filter or search term."
  action={<Button>Clear filters</Button>}
/>

<EmptyState compact bordered={false} headingLevel={3} title="No comments" />
```

## Differences from the handoff

- The title is a heading (`<h2>` by default) instead of a `span`; the level is configurable.
- Optional decorative `icon` slot (no illustrations, per the visual foundations).
- The handoff Portuguese sample copy is gone; the guidance above replaces it.
- Padding, description width and the compact padding are component tokens (`--ds-empty-state-*`). No `style` prop.
