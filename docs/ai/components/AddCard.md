# AddCard

> A dashed "create new" tile that sits in a grid next to cards. The whole tile is one link
> (`href`) or button (`onPress`) with a centred plus icon and a verb-plus-object label. It
> stretches to the height of its row.

A dashed "create new" tile that sits in a grid next to cards. Decision: [ADR-0011](../../../docs/adr/0011-interactive-cards.md).

- Import: `import { AddCard } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/AddCard/AddCard.tsx`
- Stories (Storybook title `Components/AddCard`): Default, AsLink, Disabled, Focused, LongText, RightToLeft, InGrid

## Props

| Prop         | Type                                                                                                                                                                                                                                 | Required | Default | Description                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`   | `ReactNode`                                                                                                                                                                                                                          | yes      |         | Label: a short verb plus object in sentence case ("Create agent"). It is the accessible name.                                                             |
| `href`       | `string`                                                                                                                                                                                                                             |          |         | Destination of the create flow. Renders a real `<a>`.                                                                                                     |
| `target`     | `string`                                                                                                                                                                                                                             |          |         | Link target. `_blank` adds `rel="noopener noreferrer"` and a hidden "opens in a new tab" note.                                                            |
| `rel`        | `string`                                                                                                                                                                                                                             |          |         | Link relationship, merged with `noopener noreferrer` for `_blank`.                                                                                        |
| `onPress`    | `((event: PressEvent) => void) \| ((event: PressEvent) => void)`                                                                                                                                                                     |          |         | Fired when the link is pressed, before navigation. Action run when the tile is pressed (usually opens a dialog). Renders a real `<button type="button">`. |
| `ref`        | `((instance: HTMLAnchorElement \| null) => void \| (() => VoidOrUndefinedOnly)) \| RefObject<HTMLAnchorElement \| null> \| ((instance: HTMLButtonElement \| null) => void \| (() => VoidOrUndefinedOnly)) \| RefObject<...> \| null` |          |         | Ref to the underlying `<a>` element. Ref to the underlying `<button>` element.                                                                            |
| `isDisabled` | `boolean`                                                                                                                                                                                                                            |          |         | Disables the tile: it is dimmed, skipped by `Tab` and ignores presses.                                                                                    |
| `messages`   | `Partial<{ opensInNewTab: string; }>`                                                                                                                                                                                                |          |         | Override the built-in messages for this instance.                                                                                                         |
| `className`  | `string`                                                                                                                                                                                                                             |          |         |                                                                                                                                                           |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ AddCard: { ... } }}>`.

| Key             | English default        | Notes |
| --------------- | ---------------------- | ----- |
| `opensInNewTab` | `(opens in a new tab)` |       |

## Design tokens used

`--ds-accent`, `--ds-add-card-gap`, `--ds-add-card-min-block-size`, `--ds-card-padding`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-fs-body`, `--ds-lh-body`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`

## When to use

- The last tile of a grid of cards, to create another one ("Create agent", "Create report").

## When not to use

- A navigation or action tile with a title and description: use `CardLink`.
- A card that groups content: use `Card`.
- The primary action of a screen: use a primary `Button`.
- A tile that is not available yet and does nothing: render a non-interactive card (for example `AgentCard status="soon"`), not a disabled `AddCard`, unless you want to show that creation is currently blocked.

## Accessibility

- One real `<a>` or `<button>` named by the label; the plus icon is decorative.
- `Tab` reaches it once; `Enter` activates a link or a button, `Space` also activates a button.
- Focus: accent border and ring (kept in `forced-colors`). Hover: one surface step lighter. Dashed border marks an "add" slot (AGENTS.md section 7).
- It stretches to the height of its row in a `Grid`; minimum height 64 px.

## Example

```tsx
<Grid minItemWidth="md">
  <Card title="Support agent">…</Card>
  <AddCard onPress={openCreateAgent}>Create agent</AddCard>
</Grid>
```

## Related components

- Instead, see CardLink: A navigation or action tile with a title and description: use `CardLink`.
- Instead, see Card: A card that groups content: use `Card`.
- Instead, see Button: The primary action of a screen: use a primary `Button`.
- Renders: Icon, VisuallyHidden
