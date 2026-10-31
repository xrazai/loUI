# SuggestionChip

Status: experimental

A dashed chip that proposes a piece of text. Pressing it **inserts** that text into a nearby field (a message composer, a note, a search box). Built on React Aria `Button`.

- Handoff source: `components/forms/SuggestionChip.jsx` (TODO `CMP-FRM-10`).

## When to use

- Suggested replies, snippets, prompts or tags that save typing.
- The result of pressing is always "this text appears in the field"; the user still reviews and sends it.

## When not to use

- To run an action (save, send, delete): use `Button`.
- To filter or toggle a state: use `Tag` in a `TagGroup` with selection, or `SegmentedControl`.
- To navigate: use `Link`.

## Behavior

`SuggestionChip` does not know about the field. `onPress` is where the consumer inserts the text (append at the caret, replace the selection, or set the value) and, usually, returns focus to the field. The chip never submits a form and never sends anything.

## Props

| Prop         | Type                      | Notes                                                             |
| ------------ | ------------------------- | ----------------------------------------------------------------- |
| `children`   | `ReactNode`               | The suggested text; also the accessible name.                     |
| `onPress`    | `(e: PressEvent) => void` | Insert the text here.                                             |
| `isDisabled` | `boolean`                 | Uses the shared disabled opacity (`--ds-opacity-disabled`, 0.35). |
| `className`  | `string`                  | Merged with the component class.                                  |

Other React Aria `Button` props (`aria-*`, `autoFocus`, `ref`, ...) pass through.

## Accessibility

- A real `<button type="button">`: `Enter` and `Space` press it.
- The leading plus is decorative (`aria-hidden`) and the dashed border is visual. Neither is the only cue: the chip sits in a group whose label says what the chips are, so give the container a name (`role="group"` with `aria-label="Suggested replies"`).
- Word the label as the text itself ("Your order has shipped."), not as an instruction. Screen reader users then hear exactly what will be inserted.
- Long text wraps inside the available width; the chip keeps a 32px minimum height.
- Disabled: reduced opacity and no hover. The handoff's .45 and .35 values are unified into one token.
- Focus: accent border and ring.

## Content rules

- The label is the text to insert, in sentence case, in the voice of the product (see AGENTS.md section 6).
- Keep it to one sentence; very long snippets belong in a template picker.

## Examples

```tsx
<div role="group" aria-label="Suggested replies">
  {replies.map((reply) => (
    <SuggestionChip key={reply} onPress={() => insert(reply)}>
      {reply}
    </SuggestionChip>
  ))}
</div>
```

## Differences from the handoff

- Built on React Aria `Button`; hover is CSS (`data-hovered`), not React state.
- The plus is the `Icon` plus (`PlusIcon`), decorative. Behavior (insert, never send) is documented.
- One disabled opacity token instead of a local .45.
