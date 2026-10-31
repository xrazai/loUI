# SkipLink

Status: experimental

A link that stays invisible until a keyboard user focuses it, then jumps past the repeated navigation to the main content (WCAG 2.4.1 Bypass Blocks).

- Source: TODO `BASE-002` (there was no handoff component).

## When to use

- Once per page, as the first focusable element, before the sidebar and the top bar.

## When not to use

- As a general "go to section" link: use `Link`.

## Props

| Prop       | Type                 | Default                | Notes                                                                    |
| ---------- | -------------------- | ---------------------- | ------------------------------------------------------------------------ |
| `targetId` | `string`             | `'main'`               | Id of the element to jump to, without `#`. Becomes `href="#<targetId>"`. |
| `children` | `ReactNode`          | "Skip to main content" | Custom text. Default comes from the catalog (English and pt-BR).         |
| `messages` | `{ label?: string }` | catalog                | Per-instance override (ADR-0005).                                        |
| `onClick`  | click handler        | none                   | Runs first; `preventDefault()` cancels the jump.                         |

`ref` points to the `<a>`; `className` and other anchor attributes pass through.

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
