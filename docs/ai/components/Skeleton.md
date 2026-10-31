# Skeleton

> A placeholder block in the shape of content that is still loading. It is always hidden
> from assistive technology: mark the region that is loading with `aria-busy="true"` and
> remove the attribute (and the skeletons) when the content arrives.

The `width` and `height` props are the only dynamic values in the library that reach the
DOM as custom properties on `style`, because arbitrary sizes cannot be tokens.

A placeholder in the shape of content that is still loading: a block, a circle, or a few text lines.

- Import: `import { Skeleton } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Skeleton/Skeleton.tsx`
- Stories (Storybook title `Components/Skeleton`): Default, Block, Circle, Lines, SingleLine, Pill, BusyRegion, RightToLeft

## Props

| Prop     | Type               | Required | Default | Description                                                                                                                  |
| -------- | ------------------ | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `width`  | `string \| number` |          |         | Width: a number in px or any CSS length. Default `100%`. Ignored when `circle` is set (the circle is as wide as it is tall). |
| `height` | `string \| number` |          |         | Height of the block, or of each line: a number in px or any CSS length. Default `12px` (`--ds-skeleton-height`).             |
| `circle` | `boolean`          |          | `false` | Renders a circle, for an avatar. The diameter is `height`.                                                                   |
| `lines`  | `number`           |          |         | Renders this many text lines; the last one is shorter. Takes precedence over `circle`.                                       |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-radius-pill`, `--ds-radius-sm`, `--ds-skeleton-height`, `--ds-skeleton-pulse-duration`, `--ds-skeleton-pulse-opacity`, `--ds-space-2`, `--ds-surface-hover`

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

## Related components

- Instead, see Spinner: For an action in progress (saving, sending): use `Spinner` or a loading `Button`.
- Instead, see Button: For an action in progress (saving, sending): use `Spinner` or a loading `Button`.
- Instead, see Progress: For a measurable task: use `Progress`.
- Instead, see EmptyState: When there is nothing to show after loading: use `EmptyState`.
