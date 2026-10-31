# SkipLink

> A link that is invisible until a keyboard user focuses it, then jumps past the repeated
> navigation to the main content (WCAG 2.4.1 Bypass Blocks). Put it as the very first
> focusable element of the page, before the sidebar and the top bar.

It moves focus itself instead of relying on the hash navigation, so it also works with hash
based routers and with a target that is not focusable by default.

A link that stays invisible until a keyboard user focuses it, then jumps past the repeated navigation to the main content (WCAG 2.4.1 Bypass Blocks).

- Source: TODO `BASE-002` (there was no handoff component).

- Import: `import { SkipLink } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/SkipLink/SkipLink.tsx`
- Stories (Storybook title `Components/SkipLink`): Default, JumpsToMain, CustomTarget, Portuguese, RightToLeft, Focused

## Props

| Prop       | Type                          | Required | Default | Description                                                                                                                                                     |
| ---------- | ----------------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targetId` | `string`                      |          | `main`  | Id of the element to jump to, without the `#`. Default `main`. The element should be the page's `<main>` (or its first heading); it does not need a `tabindex`. |
| `children` | `ReactNode`                   |          |         | Link text. Defaults to "Skip to main content" from the message catalog.                                                                                         |
| `messages` | `Partial<{ label: string; }>` |          |         | Per-instance overrides of the built-in messages.                                                                                                                |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ SkipLink: { ... } }}>`.

| Key     | English default        | Notes                          |
| ------- | ---------------------- | ------------------------------ |
| `label` | `Skip to main content` | Default text of the skip link. |

## Design tokens used

`--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-small`, `--ds-lh-small`, `--ds-primary-bg`, `--ds-primary-fg`, `--ds-radius-md`, `--ds-skip-link-z-index`, `--ds-space-2`, `--ds-space-4`, `--ds-weight-medium`

## When to use

- Once per page, as the first focusable element, before the sidebar and the top bar.

## When not to use

- As a general "go to section" link: use `Link`.

## Behavior

- Hidden with the same technique as `VisuallyHidden` (1px, clipped), so it is still focusable. On focus it becomes a primary-colored button at the top start corner, above everything (`--ds-skip-link-z-index`).
- On activation it focuses the target element itself and cancels the hash navigation. This works with hash-based routers and with targets that are not focusable (a temporary `tabindex="-1"` is added and removed on blur; an existing `tabindex` is kept). If the target does not exist, the browser's default behavior runs.
- Give the target `id="main"`; put it on `<main>`.

## Accessibility

- It is a real link, so it appears in link lists and works with `Enter`.
- Visible focus with the accent ring; forced colors use `Highlight`.
- The text says where it goes. Do not shorten it to "Skip".

## Content rules

- "Skip to main content" (default). For a second link use the destination: "Skip to the results".

## Examples

```tsx
<>
  <SkipLink />
  <Sidebar … />
  <main id="main">…</main>
</>
```

## `.ds-sr-only` (BASE-002)

The TODO asks for a `.ds-sr-only` utility class too. It belongs in `src/styles/base.css` (`@layer utilities`), a shared file this component does not own. The rule to add is the same as `.root` of `VisuallyHidden` (absolute, 1px, `clip-path: inset(50%)`, no overflow).

## Related components

- Instead, see Link: As a general "go to section" link: use `Link`.
