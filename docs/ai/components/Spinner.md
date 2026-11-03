# Spinner

> An indeterminate loading ring that inherits the text color.

It is a `progressbar` without a value, not a live region, so many spinners on a screen do
not each interrupt a screen reader. For large areas prefer `Skeleton`. Under
`prefers-reduced-motion` the ring is static.

An indeterminate loading ring that inherits the text color. Small, quiet, and not a live region.

- Handoff source: `components/feedback/Spinner` (CMP-FBK-06).
- Built on: a plain element with `role="progressbar"`. A pending `Button` wires it as its busy label through React Aria.

- Import: `import { Spinner } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Spinner/Spinner.tsx`
- Stories (Storybook title `Components/Spinner`): Default, Sizes, WithLabel, DecorativeWithText, InheritsColor

## Props

| Prop         | Type                            | Required | Default | Description                                                                                                                                                                                                                                  |
| ------------ | ------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`       | `'sm' \| 'md' \| 'lg'`          |          | `'md'`  | Size token: `sm` 14px, `md` 18px (default), `lg` 20px.                                                                                                                                                                                       |
| `label`      | `string`                        |          |         | Accessible name. Defaults to the "Loading" message. Say what is loading when it helps ("Loading orders").                                                                                                                                    |
| `decorative` | `boolean`                       |          | `false` | Hide the spinner from assistive technology. Use it only when the surrounding UI already announces the busy state (visible status text, `aria-busy` region). Not needed inside a pending `Button`, which wires the spinner as its busy label. |
| `messages`   | `Partial<{ loading: string; }>` |          |         | Override the built-in messages for this instance.                                                                                                                                                                                            |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Spinner: { ... } }}>`.

| Key       | English default | Notes |
| --------- | --------------- | ----- |
| `loading` | `Loading`       |       |

## Design tokens used

`--ds-icon-lg`, `--ds-icon-md`, `--ds-icon-sm`, `--ds-radius-pill`, `--ds-spinner-duration`, `--ds-spinner-stroke-width`

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

## Related components

- Instead, see Skeleton: For large areas or page loads: use `Skeleton` so the layout does not jump.
- Instead, see Progress: When you know the progress: use `Progress` with a value.
- Used by: Button, ChatPanel, Combobox, ToolCallStep
