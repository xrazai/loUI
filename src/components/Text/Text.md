# Text

Status: experimental

Body text on the type scale, with a tone, an optional mono face and truncation.

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

## Props

| Prop       | Type                                                                           | Default     | Notes                                                                                    |
| ---------- | ------------------------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------- |
| `size`     | `'body' \| 'small' \| 'label' \| 'meta' \| 'caption'`                          | `'body'`    | 15/24 · 14/22 · 13/18 · 12/16 · 11.5/16 px. `caption` is mono, uppercase, tracked        |
| `tone`     | `'default' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-success`, `--ds-warning`, `--ds-danger` |
| `mono`     | `boolean`                                                                      | `false`     | Geist Mono with tabular figures, for codes, amounts and shortcuts                        |
| `truncate` | `boolean`                                                                      | `false`     | One line with an ellipsis. Becomes a block                                               |
| `as`       | `'span' \| 'p' \| 'div' \| 'label' \| 'strong' \| 'em' …`                      | `'span'`    | Pick the element for the meaning                                                         |

Other attributes and `ref` go to the root.

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

## Differences from the handoff

- The handoff repeated font sizes and colors per element in inline styles. Text maps them to the type and text tokens, with `caption` defined once (mono, uppercase, +8% tracking).
