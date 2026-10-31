# Skeleton

Status: experimental

A placeholder in the shape of content that is still loading: a block, a circle, or a few text lines.

## When to use

- The layout of the content is known (a list of rows, a card, an avatar next to text) and the wait is short.
- Keep the page from jumping when the data arrives.

## When not to use

- For an action in progress (saving, sending): use `Spinner` or a loading `Button`.
- For a measurable task: use `Progress`.
- When there is nothing to show after loading: use `EmptyState`.

## Anatomy

```
span[aria-hidden="true"]  block | circle
span[aria-hidden="true"]  lines → n × span (last one is 60% wide)
```

## Props

| Prop     | Type               | Default | Notes                                                             |
| -------- | ------------------ | ------- | ----------------------------------------------------------------- |
| `width`  | `number \| string` | `100%`  | Number is px. Ignored with `circle`                               |
| `height` | `number \| string` | `12px`  | Height of the block or of each line (`--ds-skeleton-height`)      |
| `circle` | `boolean`          | `false` | Diameter is `height`                                              |
| `lines`  | `number`           |         | Text lines; the last is shorter (not when there is only one line) |

Other `span` attributes and `ref` go to the root. `width` and `height` reach the DOM as custom properties on `style` (the only dynamic styles in the component); everything else is CSS.

## Accessibility

- Every skeleton is `aria-hidden="true"`: it is decoration and has no text.
- **Mark the region that is loading with `aria-busy="true"`** and remove it, together with the skeletons, when the content arrives. This tells assistive technology the region is being updated. A skeleton on its own does not do this.
- If the wait is long, also expose a polite status ("Loading orders") near the region; skeletons never announce it.
- The pulse (opacity only) is switched off under `prefers-reduced-motion`. In forced-colors mode the placeholder gets a border because background colors are dropped.

## Content rules

- Match the final layout: the same number of rows and similar widths, so nothing moves when the data arrives.
- Show at most one screenful of placeholders.

## Examples

```tsx
<section aria-busy={isLoading} aria-label="Recent orders">
  {isLoading ? (
    <>
      <Skeleton circle height={28} />
      <Skeleton lines={3} />
    </>
  ) : (
    <OrderList orders={orders} />
  )}
</section>
```

## Differences from the handoff

- Always hidden from assistive technology (the handoff hid only the single block, not the `lines` variant).
- Reduced motion switches the pulse off; the keyframes are local to the component.
- Pulse duration and default height are component tokens.
- No `radius` or `style` props. A `SkeletonGroup` wrapper was not added: `aria-busy` on your own region is one attribute, and a wrapper would hide which element is busy.
- Presets (avatar, row, card) are compositions of `circle`, `lines` and `width`/`height`; see the busy-region story.
