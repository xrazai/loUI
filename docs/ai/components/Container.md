# Container

> Centers page content and limits its line length: a maximum inline size plus a side gutter.
> It carries no landmark role; put it inside `main`.

Centers page content and limits its line length: a maximum inline size and a side gutter.

- Import: `import { Container } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Container/Container.tsx`
- Stories (Storybook title `Layout/Container`): Default, Small, Medium, Large, Full, NoGutter, Narrow, RightToLeft

## Props

| Prop     | Type                                                                                                                      | Required | Default | Description                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`   | `'sm' \| 'md' \| 'lg' \| 'full'`                                                                                          |          |         | Maximum inline size: `sm` 640px, `md` 960px, `lg` 1200px (`--ds-container-*`), or `full` for no maximum. Default is the page content maximum (`--ds-content-max`, 1200px). |
| `gutter` | `boolean`                                                                                                                 |          | `true`  | Adds the content gutter (`--ds-content-gutter`, 24px) as inline padding. Default `true`.                                                                                   |
| `as`     | `'div' \| 'article' \| 'aside' \| 'footer' \| 'form' \| 'header' \| 'li' \| 'main' \| 'nav' \| 'ol' \| 'section' \| 'ul'` |          | `'div'` | Element to render, `div` by default.                                                                                                                                       |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`, `full`

## Design tokens used

`--ds-container-lg`, `--ds-container-md`, `--ds-container-sm`, `--ds-content-gutter`, `--ds-content-max`

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

## Related components

- Instead, see Card: Inside `Card`, `Dialog` or `Sheet`: those set their own padding.
- Instead, see Dialog: Inside `Card`, `Dialog` or `Sheet`: those set their own padding.
- Instead, see Sheet: Inside `Card`, `Dialog` or `Sheet`: those set their own padding.
