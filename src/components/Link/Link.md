# Link

A link to another page, section or site. Built on React Aria's `Link`: a real `<a href>` that uses the router set on `DSProvider` for client-side navigation.

- Status: experimental
- Handoff source: none (the handoff only had underlined `<a>` styles); part of GAP-002.

## When to use

- To go somewhere: another route, a section (`#id`), a document or an external site.
- Inside running text (`inline`), or as a quiet navigation line such as "View all orders" (`standalone`).

## When not to use

- To run an action in place (save, delete, open a dialog): use `Button`.
- For a styled call to action that happens to navigate: still a link semantically, but use a `Button` with `href` when it is the primary action of the screen (planned with the button-as-link variant).

## Variants

| Variant      | At rest   | Hover and keyboard focus | Use                                                                      |
| ------------ | --------- | ------------------------ | ------------------------------------------------------------------------ |
| `inline`     | underline | thicker underline        | Links inside sentences. Default.                                         |
| `standalone` | none      | underline                | Navigation lists, "View all" lines. Only where context makes it obvious. |

Color alone never identifies a link (WCAG 1.4.1), so inline links are always underlined. The accent color (`--ds-accent`) is reserved for focus, selection and links.

## Props

| Prop         | Type                         | Default    | Notes                                                                       |
| ------------ | ---------------------------- | ---------- | --------------------------------------------------------------------------- |
| `href`       | `string`                     | none       | Destination. Without it the element is a non-navigating `role="link"` span. |
| `variant`    | `'inline' \| 'standalone'`   | `'inline'` | See above.                                                                  |
| `target`     | `string`                     | none       | `_blank` adds `rel`, the icon and the screen reader note.                   |
| `rel`        | `string`                     | none       | Merged with `noopener noreferrer` for `_blank`.                             |
| `isDisabled` | `boolean`                    | `false`    | `aria-disabled`, 35% opacity, presses ignored.                              |
| `onPress`    | `(e: PressEvent) => void`    | none       | React Aria press event, fired before navigation.                            |
| `messages`   | `{ opensInNewTab?: string }` | none       | Per-instance message override (ADR-0005).                                   |
| `className`  | `string`                     | none       | Merged with the component class.                                            |

Other React Aria `Link` props (`download`, `routerOptions`, `hrefLang`, `aria-*`, ...) and `ref` pass through.

## Routing

Wrap the app once: `<DSProvider navigate={router.push} useHref={router.resolve}>`. Links with a relative `href` then navigate without a page reload; modified clicks (Ctrl/Cmd, middle button) and `target="_blank"` keep the browser behavior.

## Accessibility

- Real `<a href>`: opens in a new tab with the context menu, can be copied, works without JavaScript.
- Keys: `Tab` focuses, `Enter` follows. (`Space` does not activate a link, by design.)
- Focus: 3px accent ring through `data-focus-visible`; forced-colors mode repaints the transparent outline and system link colors apply.
- Links that open a new tab: the name ends with "(opens in a new tab)" for screen readers (hidden text from the `Link` messages) and a decorative icon shows it visually. `rel="noopener noreferrer"` is added automatically.
- Contrast: accent `#8AB4FF` on the dark surfaces is well above 4.5:1.
- Target size: inline links in text are exempt from WCAG 2.5.8; standalone links should sit in a 24px-high row.
- Reduced motion: hover changes decoration thickness only, no animation.

## Content rules

- Link text describes the destination or action and makes sense out of context: "Pricing details", "Download invoice". Never "click here" or "read more".
- Sentence case, no trailing punctuation inside the link, no emoji.
- Do not repeat the word "link". The role is announced.

## Examples

```tsx
<p>
  Read the <Link href="/pricing">pricing details</Link> before you change a plan.
</p>

<Link variant="standalone" href="/orders">View all orders</Link>

<Link href="https://example.com/docs" target="_blank">Documentation</Link>
```

## Differences from the handoff

- New component (GAP-002 part); there was no handoff `Link`. Unstyled `<a>` underlines in the handoff foundation are now this component.
- Adds the external-link behavior (`rel`, icon, screen reader note) and a standalone variant.
