# CardLink

Status: experimental

A card whose whole surface is one link or button. Decision: [ADR-0011](../../../docs/adr/0011-interactive-cards.md).

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

## Props

| Prop           | Type                         | Default | Notes                                                                     |
| -------------- | ---------------------------- | ------- | ------------------------------------------------------------------------- |
| `title`        | `string`                     |         | Required. The accessible name.                                            |
| `description`  | `ReactNode`                  |         | Accessible description. Plain text, no interactive content.               |
| `meta`         | `ReactNode`                  |         | Small mono detail. Accessible description. No interactive content.        |
| `leading`      | `ReactNode`                  |         | Decorative icon or avatar.                                                |
| `href`         | `string`                     |         | Renders an `<a>`. Router support through `DSProvider`.                    |
| `target`/`rel` | `string`                     |         | With `href`. `_blank` adds `rel="noopener noreferrer"` and a hidden note. |
| `onPress`      | `(e: PressEvent) => void`    |         | Required without `href` (renders a `<button>`); optional with `href`.     |
| `isDisabled`   | `boolean`                    | `false` | Dimmed, dashed, skipped by `Tab`.                                         |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | Keeps the page outline.                                                   |
| `messages`     | `{ opensInNewTab?: string }` |         | Per-instance message override (ADR-0005).                                 |
| `className`    | `string`                     |         | On the root.                                                              |

Other `div` attributes and `ref` go to the root. There is no `children` and no `actions`.

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
