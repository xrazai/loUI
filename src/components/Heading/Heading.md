# Heading

Status: experimental

A heading whose semantic level (`h1` to `h6`) and visual size are separate choices.

## When to use

- Any heading in page content. The level builds the outline; the size is chosen for the design.

## When not to use

- For the page title inside the header: `TopBar` renders its own heading.
- For a card caption: `Card` renders its title as a mono caption heading.
- For bold text that is not a heading: use `Text`.

## Anatomy

```
h{level}  (semibold, size from the type scale)
```

## Props

| Prop    | Type                                | Default                                  | Notes                                                     |
| ------- | ----------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`        | `2`                                      | Semantic level only                                       |
| `size`  | `'display' \| 'title' \| 'heading'` | `title` for level 1, `heading` otherwise | 34/40 · 22/30 · 17/24 px; display and title have tracking |

Other heading attributes and `ref` go to the root.

## Accessibility

- Keep levels sequential and use one `h1` per page. Pick the level for the outline, then the size for the look: an `h1` can use `size="heading"`, an `h4` can use `size="display"`.
- Headings use `text-wrap: balance` and break long words, so they wrap at 320px.
- Color is `--ds-text` (≥ 4.5:1 on every base surface).

## Content rules

- Sentence case. Short and specific ("Recent orders"), no trailing punctuation.

## Examples

```tsx
<Heading level={1} size="display">Orders</Heading>
<Heading level={2}>Recent</Heading>
<Heading level={3} size="title">Details</Heading>
```

## Differences from the handoff

- The handoff styled headings with inline font sizes tied to the element. Level and size are independent and use the type tokens.
