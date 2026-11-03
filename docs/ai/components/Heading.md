# Heading

> A heading whose semantic level and visual size are separate choices, so the document outline
> stays correct while the design picks the size.

A heading whose semantic level (`h1` to `h6`) and visual size are separate choices.

- Import: `import { Heading } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Heading/Heading.tsx`
- Stories (Storybook title `Typography/Heading`): Default, Display, Title, HeadingSize, LevelIndependentOfSize, LongText, RightToLeft

## Props

| Prop    | Type                                | Required | Default | Description                                                                                                                                                                                       |
| ------- | ----------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`        |          | `2`     | Semantic level, `h1` to `h6`. It sets the page outline for assistive technology and has nothing to do with how big the text looks: keep levels sequential and use one `h1` per page. Default `2`. |
| `size`  | `'title' \| 'display' \| 'heading'` |          |         | Visual size, independent of `level`: `display` (34px, page hero), `title` (22px) or `heading` (17px). Default: `title` for level 1, `heading` for the others.                                     |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `title`, `display`, `heading`

## Design tokens used

`--ds-font-sans`, `--ds-fs-display`, `--ds-fs-heading`, `--ds-fs-title`, `--ds-lh-display`, `--ds-lh-heading`, `--ds-lh-title`, `--ds-text`, `--ds-tracking-display`, `--ds-tracking-title`, `--ds-weight-semibold`

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

## Related components

- Instead, see TopBar: For the page title inside the header: `TopBar` renders its own heading.
- Instead, see Card: For a card caption: `Card` renders its title as a mono caption heading.
- Instead, see Text: For bold text that is not a heading: use `Text`.
