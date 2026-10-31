# Code

Status: experimental

Monospace code: inline in a sentence, or a block (`pre` + `code`).

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

## Props

| Prop         | Type                  | Default    | Notes                                                                     |
| ------------ | --------------------- | ---------- | ------------------------------------------------------------------------- |
| `variant`    | `'inline' \| 'block'` | `'inline'` | Block renders `pre` + `code`                                              |
| `aria-label` | `string`              | "Code"     | Block only: the name of the region while it scrolls. Say what the code is |
| `messages`   | `{ blockLabel }`      |            | Overrides the default label for this instance                             |

Other `code` attributes and `ref` go to the `code` element.

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

## Differences from the handoff

- The handoff used inline mono spans. Code is a real `code` / `pre`, with a keyboard-accessible scrolling block.
