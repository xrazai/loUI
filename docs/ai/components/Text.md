# Text

> Body text on the type scale. It sets size, line height, color tone and an optional mono
> face; the element (`as`) carries the meaning. Use `Heading` for headings and `Code` for code.

Body text on the type scale, with a tone, an optional mono face and truncation.

- Import: `import { Text } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Text/Text.tsx`
- Stories (Storybook title `Typography/Text`): Default, Small, Label, Meta_, Caption, Secondary, Tertiary, Success, Warning, Danger, Mono, AsParagraph, Truncated, LongText, RightToLeft

## Props

| Prop       | Type                                                                                                                   | Required | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`     | `'body' \| 'caption' \| 'label' \| 'meta' \| 'small'`                                                                  |          | `'body'`    | Type scale step: `body` 15px, `small` 14px, `label` 13px, `meta` 12px, or `caption` 11.5px. `caption` is always Geist Mono, uppercase by CSS, with extra tracking: write the source text in sentence case. Default `body`.                                                                                                                                                                                                             |
| `tone`     | `'default' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'`                                         |          | `'default'` | Text color: `default` (`--ds-text`), `secondary` (`--ds-text-2`, supporting text) or `tertiary` (`--ds-text-3`, hints). Tertiary passes 4.5:1 on every surface, but signals the lowest importance: use it for meta and hints, never for primary content. `success`, `warning` and `danger` are signal colours (4.5:1 on the base surfaces): always pair them with words that carry the meaning, never colour alone. Default `default`. |
| `mono`     | `boolean`                                                                                                              |          | `false`     | Geist Mono with tabular figures, for codes, identifiers, amounts and shortcuts.                                                                                                                                                                                                                                                                                                                                                        |
| `truncate` | `boolean`                                                                                                              |          | `false`     | Keeps the text on one line and cuts it with an ellipsis. Put the full text in `title` or nearby for sighted users.                                                                                                                                                                                                                                                                                                                     |
| `as`       | `'span' \| 'dd' \| 'div' \| 'dt' \| 'em' \| 'figcaption' \| 'label' \| 'legend' \| 'li' \| 'p' \| 'small' \| 'strong'` |          | `'span'`    | Element to render. Default `span`, which is safe inside any inline context; use `p` for a paragraph.                                                                                                                                                                                                                                                                                                                                   |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `body`, `caption`, `label`, `meta`, `small`
- `tone`: `default`, `secondary`, `tertiary`, `success`, `warning`, `danger`

## Design tokens used

`--ds-danger`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-body`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-body`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-lh-small`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tracking-caption`, `--ds-warning`, `--ds-weight-medium`, `--ds-weight-regular`

## When to use

- Paragraphs, supporting lines, labels, counts, metadata and small captions.
- Anywhere a size from the type scale or a secondary tone is needed on plain text.

## When not to use

- Headings: use `Heading`.
- Code: use `Code`.
- Links: use `Link`. Field labels: use the `Label` of the field.

## Anatomy

```
span (or the element in `as`)
```

## Accessibility

- `tertiary` passes 4.5:1 on every surface (TOK-004), but it carries the lowest importance: use it for hints and meta, never for primary content.
- `success`, `warning` and `danger` pass 4.5:1 on bg, surface and raised. The colour only reinforces: the words must carry the meaning ("Select at least one color."), never colour alone. For an error tied to a group of controls use `ErrorText`.
- Truncated text hides content visually: show the full value elsewhere (a `title`, a tooltip, a detail view) when it matters.
- The caption's uppercase is CSS only, so screen readers read the sentence-case source.
- Long unbroken values wrap (`overflow-wrap: break-word`).

## Content rules

- Sentence case. Numbers, codes and amounts go in `mono`, formatted with `Intl` (see `utils`).

## Examples

```tsx
<Text as="p">Your order has shipped.</Text>
<Text size="small" tone="secondary">Updated 2 minutes ago</Text>
<Text size="caption" tone="secondary">Shipping</Text>
<Text mono>ORD-1048</Text>
<Text truncate>{longFileName}</Text>
```

## Related components

- Instead, see Heading: Headings: use `Heading`.
- Instead, see Code: Code: use `Code`.
- Instead, see Link: Links: use `Link`. Field labels: use the `Label` of the field.
- Instead, see Label: Links: use `Link`. Field labels: use the `Label` of the field.
