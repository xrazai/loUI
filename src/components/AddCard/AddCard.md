# AddCard

Status: experimental

A dashed "create new" tile that sits in a grid next to cards. Decision: [ADR-0011](../../../docs/adr/0011-interactive-cards.md).

## When to use

- The last tile of a grid of cards, to create another one ("Create agent", "Create report").

## When not to use

- A navigation or action tile with a title and description: use `CardLink`.
- A card that groups content: use `Card`.
- The primary action of a screen: use a primary `Button`.
- A tile that is not available yet and does nothing: render a non-interactive card (for example `AgentCard status="soon"`), not a disabled `AddCard`, unless you want to show that creation is currently blocked.

## Props

| Prop           | Type                         | Default | Notes                                                                   |
| -------------- | ---------------------------- | ------- | ----------------------------------------------------------------------- |
| `children`     | `ReactNode`                  |         | Required. Verb plus object in sentence case ("Create agent"). The name. |
| `href`         | `string`                     |         | Renders an `<a>`.                                                       |
| `target`/`rel` | `string`                     |         | With `href`. `_blank` adds `rel` and a hidden note.                     |
| `onPress`      | `(e: PressEvent) => void`    |         | Required without `href` (renders a `<button>`).                         |
| `isDisabled`   | `boolean`                    | `false` | Dimmed, skipped by `Tab`.                                               |
| `messages`     | `{ opensInNewTab?: string }` |         | Per-instance message override.                                          |
| `className`    | `string`                     |         |                                                                         |
| `ref`          | element ref                  |         | The `<a>` or `<button>`.                                                |

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
