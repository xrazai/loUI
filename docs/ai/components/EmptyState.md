# EmptyState

> Tells the user that there is nothing to show, why, and what to do next. The copy follows
> "what happened + what to do".

A typographic placeholder for a list, table or panel that has nothing to show. It says what happened and what the user can do about it.

- Import: `import { EmptyState } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/EmptyState/EmptyState.tsx`
- Stories (Storybook title `Components/EmptyState`): Default, WithActions, Compact, WithoutBorder, WithIcon, TitleOnly, LongText, RightToLeft

## Props

| Prop              | Type                                     | Required | Default | Description                                                                                                  |
| ----------------- | ---------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `title`           | `ReactNode`                              | yes      |         | What happened, in one short sentence: "No orders found". Rendered as a heading (see `headingLevel`).         |
| `headingLevel`    | `'1' \| '2' \| '3' \| '4' \| '5' \| '6'` |          | `'2'`   | Heading level of the title (`h1` to `h6`). Pick the level that fits the page outline. Default `2`.           |
| `description`     | `ReactNode`                              |          |         | What the user can do about it: "Try another filter or search term."                                          |
| `icon`            | `ReactNode`                              |          |         | Optional icon above the title. Decorative: it is hidden from assistive technology. No illustrations.         |
| `action`          | `ReactNode`                              |          |         | The primary action, usually a `Button`. Rendered after the secondary action.                                 |
| `secondaryAction` | `ReactNode`                              |          |         | A second, lower-emphasis action.                                                                             |
| `compact`         | `boolean`                                |          | `false` | Less padding and a smaller title, for use inside a card, a panel or a table.                                 |
| `bordered`        | `boolean`                                |          | `true`  | Dashed border. Set to `false` when the empty state already sits inside a bordered container. Default `true`. |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-empty-state-compact-padding-block`, `--ds-empty-state-compact-padding-inline`, `--ds-empty-state-description-max-w`, `--ds-empty-state-padding-block`, `--ds-empty-state-padding-inline`, `--ds-fs-heading`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-heading`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-radius-lg`, `--ds-space-2`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-semibold`

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

## Related components

- Instead, see Skeleton: While data is loading: use `Skeleton`.
- Instead, see Alert: When loading failed: use `Alert` with a retry action.
- Used by: ActionList, DataTable
