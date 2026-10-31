# Container

Status: experimental

Centers page content and limits its line length: a maximum inline size and a side gutter.

## When to use

- Inside the `main` of a page to keep content readable on wide screens.
- Settings pages and forms (`size="sm"` or `"md"`), dashboards (`"lg"`).

## When not to use

- Inside `Card`, `Dialog` or `Sheet`: those set their own padding.
- For full-bleed content such as a table: use `size="full"` or skip the container.

## Anatomy

```
div (max-inline-size, margin-inline: auto, padding-inline: gutter)
  children
```

## Props

| Prop     | Type                                | Default              | Notes                                                               |
| -------- | ----------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `size`   | `'sm' \| 'md' \| 'lg' \| 'full'`    | content max (1200px) | 640 / 960 / 1200px (`--ds-container-*`); `full` removes the maximum |
| `gutter` | `boolean`                           | `true`               | Adds `--ds-content-gutter` (24px) inline padding                    |
| `as`     | `'div' \| 'section' \| 'article' …` | `'div'`              | Element to render                                                   |

Other `div` attributes and `ref` go to the root.

## Responsive behavior

The container is `inline-size: 100%` up to its maximum, so it narrows with the viewport and keeps its gutter down to 320px.

## Accessibility

- Carries no landmark role. The page's single `main` comes from `AppShell` (or your own `<main>`); put the container inside it.
- Logical properties (`margin-inline`, `padding-inline`) make it direction-neutral.

## Examples

```tsx
<main id="main">
  <Container size="md">
    <Heading level={1}>Settings</Heading>…
  </Container>
</main>
```

Inside `AppShell`, which already pads `main`, use `<Container gutter={false}>` or `<AppShell padded={false}>`.

## Differences from the handoff

- The handoff laid screens out at a fixed 1180px minimum. The container gives a maximum, never a minimum.
