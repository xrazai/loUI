# VisuallyHidden

Status: stable

Hides content visually while keeping it in the accessibility tree. It renders a `span` (or the element given by `as`) with the standard "screen reader only" clipping, so the text is read aloud and found by assistive technology but takes no space on screen.

## When to use

- A text alternative for an icon-only control when a `label` prop is not available (for example the name of a custom control).
- A heading or landmark label that sighted users do not need because the layout already implies it.
- Extra context for a repeated link or button ("Edit" followed by a hidden "order ORD-1048").

## When not to use

- To hide content from everyone: use the `hidden` attribute or conditional rendering.
- To hide content from assistive technology only: use `aria-hidden="true"`.
- For a skip link that appears on focus: use `SkipLink`.
- For text that sighted keyboard users need to see: render it visibly.

## Anatomy

```
span.root   (or as="h2", "div", ...)
  clip: rect(0 0 0 0); position: absolute; 1px box; overflow: hidden
```

## Props

| Prop        | Type          | Default  | Notes                                                      |
| ----------- | ------------- | -------- | ---------------------------------------------------------- |
| `as`        | `ElementType` | `'span'` | Element to render (`h2`, `div`, `label`, ...).             |
| `className` | `string`      | -        | Merged with the internal class.                            |
| `children`  | `ReactNode`   | -        | The text read by assistive technology.                     |
| `...rest`   | `span` props  | -        | Spread onto the element (`id`, `data-*`, `aria-*`, `ref`). |

## Accessibility

- The content stays in the accessibility tree and in the reading order; place it where it should be read.
- Do not put interactive elements inside: a focusable element that cannot be seen is a focus-visibility failure (WCAG 2.4.7).
- Write the text as you would write visible copy: sentence case, no emoji, no decorative punctuation.

## Content rules

- Keep it short and specific ("Close dialog", not "Click here to close the dialog window").
- Do not repeat what the visible label already says.

## Examples

```tsx
<button type="button">
  <span aria-hidden="true">x</span>
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

<VisuallyHidden as="h2">Order summary</VisuallyHidden>
```

## Differences from the handoff

- New in Loui DS: the handoff had no equivalent; screen-reader-only text was ad hoc.
