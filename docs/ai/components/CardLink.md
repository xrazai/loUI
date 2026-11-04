# CardLink

> A card whose whole surface is one link or button. The title is the real interactive
> element (an `<a>` with `href`, a `<button>` with `onPress`) inside a heading, and a
> stretched `::after` makes the full card its hit area. The title is the accessible name; the
> description and meta are the accessible description.

Use it for navigation tiles (a settings category grid). A card that needs inner buttons is a
`Card` with a `Button` (ADR-0011).

A card whose whole surface is one link or button. Decision: [ADR-0011](../../../docs/adr/0011-interactive-cards.md).

- Import: `import { CardLink } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/CardLink/CardLink.tsx`
- Stories (Storybook title `Components/CardLink`): Default, WithLeadingAndMeta, AsButton, LongText, Disabled, Focused, ExternalLink, RightToLeft, InGrid

## Props

| Prop           | Type                                                             | Required | Default | Description                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`        | `string`                                                         | yes      |         | Title of the card. It is the accessible name of the link or button, and a real heading (see `headingLevel`). Keep it to a few words ("Billing").                                                             |
| `href`         | `string`                                                         |          |         | Destination. Renders a real `<a>`; uses the router set on `DSProvider` for client-side navigation.                                                                                                           |
| `target`       | `string`                                                         |          |         | Link target. `_blank` adds `rel="noopener noreferrer"` and a hidden "opens in a new tab" note.                                                                                                               |
| `rel`          | `string`                                                         |          |         | Link relationship, merged with `noopener noreferrer` for `_blank`.                                                                                                                                           |
| `onPress`      | `((event: PressEvent) => void) \| ((event: PressEvent) => void)` |          |         | Fired when the link is pressed, before navigation. Action run when the card is pressed. Renders a real `<button type="button">`.                                                                             |
| `description`  | `ReactNode`                                                      |          |         | Supporting text. It is the accessible description (`aria-describedby`), not part of the name. Plain text only: the whole card is one interactive element, so never put links, buttons or form controls here. |
| `meta`         | `ReactNode`                                                      |          |         | Small mono detail under the text ("3 members", "ORD-1048"). Same rule as `description`: no interactive content.                                                                                              |
| `leading`      | `ReactNode`                                                      |          |         | Icon or avatar before the text. Decorative: the title names the card.                                                                                                                                        |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                     |          |         | Heading level of the title (`h1` to `h6`). Pick the level that fits the page outline. Default `3`.                                                                                                           |
| `isDisabled`   | `boolean`                                                        |          |         | Disables the card: it is dimmed, skipped by `Tab` and ignores presses.                                                                                                                                       |
| `messages`     | `Partial<{ opensInNewTab: string; }>`                            |          |         | Override the built-in messages for this instance.                                                                                                                                                            |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ CardLink: { ... } }}>`.

| Key             | English default        | Notes |
| --------------- | ---------------------- | ----- |
| `opensInNewTab` | `(opens in a new tab)` |       |

## Design tokens used

`--ds-card-link-gap`, `--ds-card-link-text-gap`, `--ds-card-padding`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-fs-body`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-body`, `--ds-lh-meta`, `--ds-lh-small`, `--ds-line`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-surface`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-weight-medium`

## When to use

- A grid of destinations, such as a settings category grid: each tile opens a page.
- A tile that runs one action (`onPress`), such as "Import data".

## When not to use

- A card that contains its own buttons, a menu or form controls: use `Card` with a `Button` (a card can't be interactive and contain interactive content).
- A "create new" tile: use `AddCard`.
- A plain group of content: use `Card`.
- A list row: use `ActionList` or a table.

## Anatomy

```
div (surface + 1px line, radius lg, padding, hover = raised surface)
  leading            optional icon or avatar, decorative
  div
    h{headingLevel}
      a | button     the title; its ::after stretches over the whole card
    p                description (aria-describedby)
    p                meta, mono (aria-describedby)
```

## Accessibility

- One real `<a>` or `<button>`, in a heading, so the card shows up in the heading outline. The name is the title only; the description and meta are announced as the description.
- Keyboard: `Tab` reaches it once; `Enter` activates a link or a button, `Space` also activates a button (AGENTS.md section 8).
- Focus ring on the whole card outline, kept in `forced-colors`. Hover is one surface step lighter. Transitions are neutralized by the global reduced-motion rule.
- The target is the whole card (well above 24 px).
- Trade-off: the stretched overlay stops text selection by dragging inside the card.

## Examples

```tsx
<Grid minItemWidth="md">
  <CardLink
    leading={<Icon icon={UsersIcon} />}
    title="Team"
    description="Members, roles and invitations."
    href="/settings/team"
  />
  <CardLink title="Import data" description="Upload a CSV file." onPress={openImport} />
  <AddCard href="/settings/new">Create category</AddCard>
</Grid>
```

## Related components

- Instead, see Card: A card that contains its own buttons, a menu or form controls: use `Card` with a `Button` (a card can't be interactive and contain interactive content).
- Instead, see Button: A card that contains its own buttons, a menu or form controls: use `Card` with a `Button` (a card can't be interactive and contain interactive content).
- Instead, see AddCard: A "create new" tile: use `AddCard`.
- Instead, see ActionList: A list row: use `ActionList` or a table.
- Renders: VisuallyHidden
