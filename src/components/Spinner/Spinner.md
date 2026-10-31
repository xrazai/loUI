# Spinner

An indeterminate loading ring that inherits the text color. Small, quiet, and not a live region.

- Status: experimental
- Handoff source: `components/feedback/Spinner` (CMP-FBK-06).
- Built on: a plain element with `role="progressbar"`. A pending `Button` wires it as its busy label through React Aria.

## When to use

- Inside a pending `Button` (`isPending`), which renders it for you.
- Next to a short status text for a small, bounded wait ("Saving changes").
- A single small area that is loading and has no better placeholder.

## When not to use

- For large areas or page loads: use `Skeleton` so the layout does not jump.
- When you know the progress: use `Progress` with a value.
- As a decoration. It means "busy", so remove it when the work ends.

## Anatomy

One element: a ring with an open top edge. Size comes from `--ds-icon-sm|md|lg`, thickness from `--ds-spinner-stroke-width`, rotation time from `--ds-spinner-duration`.

## Props

| Prop         | Type                   | Default   | Notes                                                                                     |
| ------------ | ---------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`    | 14, 18, 20 px. Use `sm` inside `sm` and `md` buttons.                                     |
| `label`      | `string`               | "Loading" | Accessible name. Say what is loading when it helps ("Loading orders").                    |
| `decorative` | `boolean`              | `false`   | Hides the spinner from assistive technology. Only when other UI announces the busy state. |
| `messages`   | `{ loading?: string }` | none      | Per-instance message override (ADR-0005).                                                 |
| `className`  | `string`               | none      | Merged with the component class.                                                          |

Other attributes and `ref` pass through to the element.

## Accessibility

- `role="progressbar"` with no value (indeterminate) and an accessible name. It is **not** `role="status"` or `aria-live`: a screen reader does not announce every spinner when it mounts. One announcement strategy per screen: the button (`Button` announces pending and done) or a single status region you control.
- Decorative mode: `aria-hidden="true"`. Pair it with visible status text in a `role="status"` region, as in the `DecorativeWithText` story.
- Reduced motion: under `prefers-reduced-motion: reduce` the ring does not rotate. It stays as a static open ring; the accessible name and the busy control state carry the meaning.
- Forced colors: the ring is drawn with `currentColor` borders, which follow the system text color.
- Color: inherits the text color, so it needs no extra contrast treatment beyond its container's.

## Content rules

- The name is a short noun phrase in sentence case: "Loading", "Loading orders". No ellipsis, no exclamation mark.
- Default text comes from the `Spinner` message catalog (`en`: "Loading", `pt-BR`: "Carregando"). Override it per instance or through `DSProvider messages={{ Spinner: { loading: '...' } }}`.

## Examples

```tsx
<Spinner />
<Spinner label="Loading orders" size="lg" />

<p role="status">
  <Spinner decorative size="sm" /> Saving changes
</p>
```

## Differences from the handoff

- The pt-BR default label is gone; English is the default and pt-BR is in the catalog.
- `size` is `sm | md | lg` mapped to icon tokens instead of a pixel number; `color` and `style` props were removed (the ring follows `currentColor`).
- `role="status"` was replaced by `progressbar`, and a visible `label` is no longer part of the component: place your own text next to a decorative spinner.
- Reduced-motion alternative added.
