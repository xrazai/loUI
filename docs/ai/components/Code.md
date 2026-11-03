# Code

> Monospace code: inline in a sentence, or as a block (`pre` + `code`). A block that overflows
> becomes a keyboard stop and a labelled region so it can be scrolled without a mouse.
> It does not highlight syntax.

Monospace code: inline in a sentence, or a block (`pre` + `code`).

- Import: `import { Code } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Code/Code.tsx`
- Stories (Storybook title `Typography/Code`): Default, Block, BlockScrolls, InlineLongToken, RightToLeft

## Props

| Prop         | Type                               | Required | Default    | Description                                                                                                                                                                               |
| ------------ | ---------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`    | `'inline' \| 'block'`              |          | `'inline'` | `inline` (default) is a `code` element inside running text. `block` renders a `pre` with a `code` inside it, keeps the whitespace, and scrolls sideways instead of wrapping.              |
| `aria-label` | `string`                           |          |            | Block only. Accessible name of the block when it scrolls and becomes a region. Defaults to "Code" from the message catalog; say what the code is when there are several ("Request body"). |
| `messages`   | `Partial<{ blockLabel: string; }>` |          |            | Per-instance overrides of the built-in messages.                                                                                                                                          |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Variants, sizes and tones

- `variant`: `inline`, `block`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Code: { ... } }}>`.

| Key          | English default | Notes                                                                                         |
| ------------ | --------------- | --------------------------------------------------------------------------------------------- |
| `blockLabel` | `Code`          | Accessible name of a scrollable code block (a labelled region), when the consumer gives none. |

## Design tokens used

`--ds-accent`, `--ds-code-inline-padding-block`, `--ds-font-mono`, `--ds-fs-label`, `--ds-lh-small`, `--ds-line`, `--ds-line-control`, `--ds-line-subtle`, `--ds-radius-md`, `--ds-radius-sm`, `--ds-space-1`, `--ds-space-3`, `--ds-space-4`, `--ds-surface`, `--ds-text`

## When to use

- Commands, identifiers, file names and short snippets in documentation or help text.
- A block for several lines, such as a request example.

## When not to use

- For data values in the UI (IDs, amounts, shortcuts): use `Text mono`, or `Kbd` for a key.
- For syntax highlighting or a copy button: not part of this component.

## Anatomy

```
code                 inline
pre > code           block (scrolls sideways, keeps whitespace)
```

## Accessibility

- A block that overflows horizontally gets `tabindex="0"` and `role="region"` with a name, so keyboard users can scroll it (WCAG 2.1.1). A block that fits is a plain `pre`.
- Inline code wraps anywhere (`overflow-wrap: anywhere`) so a long token does not overflow at 320px.
- Block text is `--ds-text` on `--ds-surface` (≥ 4.5:1).

## Internationalization

`blockLabel` has English and `pt-BR` ("Código") strings. Override per instance (`messages`), through `DSProvider`, or with `aria-label`.

## Examples

```tsx
<p>Run <Code>pnpm check</Code> before you push.</p>

<Code variant="block" aria-label="Request example">
  {`curl -X POST https://api.example.com/v1/orders`}
</Code>
```

## Related components

- Instead, see Kbd: For data values in the UI (IDs, amounts, shortcuts): use `Text mono`, or `Kbd` for a key.
- Used by: ToolCallStep
