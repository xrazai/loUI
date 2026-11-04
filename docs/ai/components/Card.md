# Card

> A bordered surface that groups related content. With a `title` it is a labelled region
> (`section` named by its heading).

A bordered surface that groups related content. With a `title` it is a labelled region.

- Import: `import { Card } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Card/Card.tsx`
- Stories (Storybook title `Components/Card`): Default, WithActions, Raised, WithoutTitle, HeadingLevel3, NoPadding, LongText, RightToLeft, PaperReceipt, ReceiptPreview

## Props

| Prop           | Type                         | Required | Default     | Description                                                                                                                                                                                                                                                     |
| -------------- | ---------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `ReactNode`                  |          |             | Title shown as an uppercase mono caption. It is a real heading (see `headingLevel`) and names the card region through `aria-labelledby`.                                                                                                                        |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` |          | `2`         | Heading level of the title (`h1` to `h6`). Pick the level that fits the page outline. Default `2`.                                                                                                                                                              |
| `actions`      | `ReactNode`                  |          |             | Controls placed at the end of the header, next to the title (buttons, a menu).                                                                                                                                                                                  |
| `variant`      | `'default' \| 'raised'`      |          | `'default'` | `default` is a flat surface with a border. `raised` uses the raised surface, a stronger border and the overlay shadow: use it only for a card that floats above the page (a pinned panel, a detail popover shell), never for cards that sit in the normal flow. |
| `padding`      | `'md' \| 'none'`             |          | `'md'`      | `md` applies the card padding token; `none` removes it (for full-bleed content such as a table). Default `md`.                                                                                                                                                  |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `default`, `raised`

## Design tokens used

`--ds-card-gap`, `--ds-card-padding`, `--ds-font-mono`, `--ds-fs-caption`, `--ds-lh-caption`, `--ds-line`, `--ds-line-strong`, `--ds-radius-lg`, `--ds-shadow-overlay`, `--ds-space-2`, `--ds-space-3`, `--ds-surface`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-tracking-caption`, `--ds-weight-medium`

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

## Elevation

Borders carry hierarchy, shadows are for overlays (AGENTS.md section 5). A `raised` card gets the raised surface, a stronger border **and** `--ds-shadow-overlay`, so use it only when the card really floats (a pinned side panel, the shell of a custom popover). A card in the normal flow stays `default`.

## Paper scope

Put `data-theme="paper"` on the `Card` to render the only light surface in the system, for receipt and PDF previews (ADR-0007). The card reads semantic tokens (`--ds-surface`, `--ds-line`, `--ds-text`), which the `[data-theme='paper']` scope remaps on the element itself, so the background, border and text switch with no extra prop. Inside it, `Text`, `Heading` and `Divider` (solid and dashed) follow the same remap; use `<Divider variant="dashed" />` for the total line.

```tsx
<Card data-theme="paper" title="Receipt #1051">
  <Text mono>$1,240.00</Text>
  <Divider variant="dashed" />
  <Text mono>Total $1,240.00</Text>
</Card>
```

Paper-safe components (axe contrast tested in the paper scope): `Card`, `Text`, `Heading`, `Divider`, plus `Badge`, `Alert` and `Button` (see the `PaperReceipt` story). A receipt or PDF component is product domain and is not part of the design system; compose these instead.

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

## Related components

- Instead, see Dialog: For content that interrupts the user: use `Dialog` or `Alert`.
- Instead, see Alert: For content that interrupts the user: use `Dialog` or `Alert`.
- Instead, see CardLink: For a card that is itself one click target (a settings category tile): use `CardLink`. For a dashed "create new" tile: use `AddCard`. `Card` is never interactive (ADR-0011); a card with inner buttons stays a `Card`.
- Instead, see AddCard: For a card that is itself one click target (a settings category tile): use `CardLink`. For a dashed "create new" tile: use `AddCard`. `Card` is never interactive (ADR-0011); a card with inner buttons stays a `Card`.
