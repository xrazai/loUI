# SourceList and Citation

Status: experimental

The numbered list of sources an answer is based on (`SourceList`) and the inline markers that point to it (`Citation`). Import both from `@loui/ds/patterns`.

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

## Props

`SourceList`

| Prop           | Type            | Default   | Notes                                                                        |
| -------------- | --------------- | --------- | ---------------------------------------------------------------------------- |
| `id`           | `string`        | -         | Required. Citations find their source through it.                            |
| `sources`      | `Source[]`      | -         | `{ id, title, url?, domain?, snippet? }`. The position is the source number. |
| `title`        | `string`        | "Sources" | Heading text.                                                                |
| `headingLevel` | `1`-`6`         | `3`       |                                                                              |
| `messages`     | partial catalog |           | `title`, `citation(number, title)`.                                          |

`Citation`: `number` (1-based, the visible text), `title`, `listId`, `sourceId`, plus anchor props. `getSourceElementId(listId, sourceId)` returns the DOM id when you need it.

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

## Differences from the handoff

No handoff source: new pattern (TODO `AI-013`).
