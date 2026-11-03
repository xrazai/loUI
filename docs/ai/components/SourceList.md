# SourceList

> The numbered list of sources an answer is based on. Each source is a list item that
> `Citation` markers jump to; the title is a link when the source has a `url`.

Source numbers are the position in `sources`: keep the order stable while the answer streams,
and append new sources at the end.

The numbered list of sources an answer is based on (`SourceList`) and the inline markers that point to it (`Citation`). Import both from `loui-ds/patterns`.

- Import: `import { SourceList } from 'loui-ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/SourceList/SourceList.tsx`
- Stories (Storybook title `Patterns/SourceList`): Default, LongText, RightToLeft, WithCitations

## Props

| Prop           | Type                                                                               | Required | Default | Description                                                      |
| -------------- | ---------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------- |
| `id`           | `string`                                                                           | yes      |         | Id of the list. Required: citations use it to find their source. |
| `sources`      | `readonly Source[]`                                                                | yes      |         | The sources, in citation order. The first is source 1.           |
| `title`        | `string`                                                                           |          |         | Heading text. Defaults to "Sources".                             |
| `headingLevel` | `'1' \| '2' \| '3' \| '4' \| '5' \| '6'`                                           |          | `'3'`   | Heading level of the title (`h1` to `h6`). Default `3`.          |
| `messages`     | `Partial<{ title: string; citation: (number: number, title: string) => string; }>` |          |         | Override the built-in messages for this instance.                |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ SourceList: { ... } }}>`.

| Key                                       | English default     | Notes                                                    |
| ----------------------------------------- | ------------------- | -------------------------------------------------------- |
| `title`                                   | `Sources`           | Default heading of the source list.                      |
| `citation(number: number, title: string)` | `Source 2: {title}` | Accessible name of a citation marker: "Source 2: Title". |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-citation-size`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-line-control`, `--ds-radius-sm`, `--ds-source-list-gap`, `--ds-source-list-indent`, `--ds-source-list-padding`, `--ds-space-1`, `--ds-space-2`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`, `--ds-weight-semibold`

## When to use

- An assistant answer that rests on documents, pages or records, and the owner should be able to check them.

## When not to use

- Footnotes in long-form documents: use plain links.
- A list of results the user searched for: use a table or a list of cards.

## Anatomy

```
p            ... a claim [2] ...        Citation: <a href="#s-source-b" aria-label="Source 2: Title">2</a>
section      named by its heading ("Sources")
  ol
    li       tabIndex=-1 (focus target)    title (link when it has a url) · domain (mono) · snippet
```

## Accessibility

- A citation is a real link (`href="#..."`) named "Source 2: Title"; the visible text is the number, which the name contains.
- Activating it moves focus to the matching list item and scrolls it into view. It does not change the URL hash, so it does not fight your router. Without JavaScript the hash link still works.
- Source titles with a `url` are links that open in a new tab (with the external-link icon and a screen-reader note).
- The marker is 24 px square (WCAG 2.5.8).

## Content rules

- Keep source order stable while the answer streams; append new sources at the end, so numbers already shown never change.
- Titles say what the page is, not "Click here". Snippets are short, plain text.

## Example

```tsx
<p>
  Orders move through four statuses
  <Citation number={1} title="Order lifecycle" listId="answer-1" sourceId="lifecycle" />.
</p>
<SourceList
  id="answer-1"
  sources={[{ id: 'lifecycle', title: 'Order lifecycle', url: 'https://example.com/orders' }]}
/>
```

## Related components

- Renders: Link
