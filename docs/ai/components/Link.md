# Link

> A link built on React Aria's `Link`. With `href` it renders a real `<a>` and uses the router
> set on `DSProvider` for client-side navigation. Links that open a new tab (`target="_blank"`)
> get `rel="noopener noreferrer"`, an external-link icon and a hidden note for screen readers.

A link to another page, section or site. Built on React Aria's `Link`: a real `<a href>` that uses the router set on `DSProvider` for client-side navigation.

- Handoff source: none (the handoff only had underlined `<a>` styles); part of GAP-002.

- Import: `import { Link } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Link/Link.tsx`
- Stories (Storybook title `Components/Link`): Default, InText, Standalone, External, Disabled, KeyboardActivation, Focused

## Props

| Prop        | Type                                  | Required | Default    | Description                                                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`   | `'inline' \| 'standalone'`            |          | `'inline'` | - `inline` (default): underlined, for links inside running text. Color alone does not identify a link (WCAG 1.4.1), so the underline is part of the design. - `standalone`: no underline at rest (underlined on hover and focus). Only where the context makes it obvious that it is a link: a navigation list, a "View all" line under a heading. |
| `children`  | `ReactNode`                           |          |            | Link text. Describe the destination or action ("Pricing details"), never "click here".                                                                                                                                                                                                                                                             |
| `messages`  | `Partial<{ opensInNewTab: string; }>` |          |            | Override the built-in messages for this instance.                                                                                                                                                                                                                                                                                                  |
| `className` | `string`                              |          |            |                                                                                                                                                                                                                                                                                                                                                    |
| `ref`       | `Ref<HTMLAnchorElement>`              |          |            | Ref to the underlying `<a>` element.                                                                                                                                                                                                                                                                                                               |

### Inherited props

- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `AriaLinkOptions` (react-aria): `isDisabled`
- From `AriaLinkProps` (react-aria): `aria-current`
- From `DOMProps` (@react-types/shared): `id`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `HoverEvents` (@react-types/shared): `onHoverChange`, `onHoverEnd`, `onHoverStart`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `LinkDOMProps` (@react-types/shared): `download`, `href`, `hrefLang`, `ping`, `referrerPolicy`, `rel`, `routerOptions`, `target`
- From `PossibleLinkDOMRenderProps` (react-aria-components): `render`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `inline`, `standalone`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Link: { ... } }}>`.

| Key             | English default        | Notes |
| --------------- | ---------------------- | ----- |
| `opensInNewTab` | `(opens in a new tab)` |       |

## Design tokens used

`--ds-accent`, `--ds-focus-ring`, `--ds-opacity-disabled`, `--ds-radius-sm`, `--ds-space-1`

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

## Related components

- Instead, see Button: To run an action in place (save, delete, open a dialog): use `Button`.
- Renders: Icon, VisuallyHidden
- Used by: Citation, SourceList
