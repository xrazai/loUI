# Card

Status: experimental

A bordered surface that groups related content. With a `title` it is a labelled region.

## When to use

- Group a set of related fields, numbers or a list under one caption.
- Put page sections side by side in a grid.

## When not to use

- To wrap a whole page: use the page layout.
- For content that interrupts the user: use `Dialog` or `Alert`.
- Do not nest a Card inside a Card; use a divider instead.
- For a card that is itself one click target (a settings category tile): use `CardLink`. For a dashed "create new" tile: use `AddCard`. `Card` is never interactive (ADR-0011); a card with inner buttons stays a `Card`.

## Anatomy

```
section (surface + 1px line, radius lg, padding)
  header (optional)
    h{headingLevel}  mono caption, uppercase by CSS
    actions          optional controls
  children
```

## Props

| Prop           | Type                         | Default     | Notes                                                                    |
| -------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------ |
| `title`        | `ReactNode`                  |             | Rendered as a heading styled as a mono caption                           |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`         | Pick the level that fits the page outline                                |
| `actions`      | `ReactNode`                  |             | End of the header                                                        |
| `variant`      | `'default' \| 'raised'`      | `'default'` | `raised` only for a card that floats above the page                      |
| `padding`      | `'md' \| 'none'`             | `'md'`      | `none` for full-bleed content such as a table (the header keeps padding) |

Other `section` attributes (including `aria-label` and `aria-labelledby`) and `ref` go to the root.

## Elevation

Borders carry hierarchy, shadows are for overlays (AGENTS.md section 5). A `raised` card gets the raised surface, a stronger border **and** `--ds-shadow-overlay`, so use it only when the card really floats (a pinned side panel, the shell of a custom popover). A card in the normal flow stays `default`.

## Accessibility

- The root is a `section`. With a `title`, the heading id is wired to `aria-labelledby`, so screen readers expose a named `region` landmark. Without a title or a label it is a plain generic container (no landmark), which is correct for decorative grouping.
- Give a title-less card an `aria-label` when it should be a landmark.
- The heading level is yours to choose: keep levels sequential (a Card inside a page with an `h1` usually uses `2`; inside another section use `3`).
- The caption uses `--ds-text-2` (the handoff used `--ds-text-3`, which drops below 4.5:1 on the raised surface).

## Content rules

- Captions are sentence case in the source ("Storage"); uppercase is applied by CSS only.
- Keep captions to one to three words.

## Examples

```tsx
<Card title="Storage" actions={<Button size="sm">Manage</Button>}>
  <Progress value={62} label="Used" meta="6.2 / 10 GB" />
</Card>

<Card title="Details" headingLevel={3}>…</Card>
```

## Differences from the handoff

- The title is a real heading with `aria-labelledby`, not a `span`.
- `raised` is the `variant` prop; the shadow applies only to it, and it is documented as floating only.
- Padding and gap are component tokens (`--ds-card-padding`, `--ds-card-gap`); `padding` is `'md' | 'none'` instead of a number.
- No `style` prop.
