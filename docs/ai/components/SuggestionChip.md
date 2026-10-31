# SuggestionChip

> A dashed chip that proposes a piece of text. Pressing it **inserts** that text into a
> nearby field (for example a message composer); it never submits or navigates.

The dashed border and the leading plus tell sighted users that it adds something. The plus
is decorative: screen readers hear the label, so word the label as the text itself and put
the chips in a labelled group ("Suggested replies") so the purpose is announced once.

A dashed chip that proposes a piece of text. Pressing it **inserts** that text into a nearby field (a message composer, a note, a search box). Built on React Aria `Button`.

- Handoff source: `components/forms/SuggestionChip.jsx` (TODO `CMP-FRM-10`).

- Import: `import { SuggestionChip } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/SuggestionChip/SuggestionChip.tsx`
- Stories (Storybook title `Components/SuggestionChip`): Default, Disabled, LongText, InsertsText, RightToLeft, Focused

## Props

| Prop        | Type                     | Required | Default | Description                                                                                                                                                     |
| ----------- | ------------------------ | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`  | `ReactNode`              | yes      |         | The suggested text. The chip is named by it and, when pressed, the consumer inserts exactly this text (or the text it stands for) into the field it belongs to. |
| `className` | `string`                 |          |         |                                                                                                                                                                 |
| `ref`       | `Ref<HTMLButtonElement>` |          |         | Ref to the underlying `<button>` element.                                                                                                                       |

### Inherited props

- From `AriaBaseButtonProps` (react-aria): `aria-controls`, `aria-current`, `aria-disabled`, `aria-expanded`, `aria-haspopup`, `aria-pressed`, `form`, `formAction`, `formEncType`, `formMethod`, `formNoValidate`, `formTarget`, `name`, `preventFocusOnPress`, `type`, `value`
- From `AriaLabelingProps` (@react-types/shared): `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`
- From `ButtonProps` (react-aria): `isDisabled`
- From `DOMProps` (@react-types/shared): `id`
- From `DOMRenderProps` (react-aria-components): `render`
- From `FocusableDOMProps` (@react-types/shared): `excludeFromTabOrder`
- From `FocusableProps` (@react-types/shared): `autoFocus`
- From `FocusEvents` (@react-types/shared): `onBlur`, `onFocus`, `onFocusChange`
- From `HoverEvents` (@react-types/shared): `onHoverChange`, `onHoverEnd`, `onHoverStart`
- From `KeyboardEvents` (@react-types/shared): `onKeyDown`, `onKeyUp`
- From `PressEvents` (@react-types/shared): `onClick`, `onPress`, `onPressChange`, `onPressEnd`, `onPressStart`, `onPressUp`
- From `SlotProps` (react-aria-components): `slot`
- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Design tokens used

`--ds-accent`, `--ds-control-h-sm`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-sans`, `--ds-fs-label`, `--ds-lh-label`, `--ds-line-strong`, `--ds-opacity-disabled`, `--ds-radius-lg`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-weight-medium`

## When to use

- Suggested replies, snippets, prompts or tags that save typing.
- The result of pressing is always "this text appears in the field"; the user still reviews and sends it.

## When not to use

- To run an action (save, send, delete): use `Button`.
- To filter or toggle a state: use `Tag` in a `TagGroup` with selection, or `SegmentedControl`.
- To navigate: use `Link`.

## Behavior

`SuggestionChip` does not know about the field. `onPress` is where the consumer inserts the text (append at the caret, replace the selection, or set the value) and, usually, returns focus to the field. The chip never submits a form and never sends anything.

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

## Related components

- Instead, see Button: To run an action (save, send, delete): use `Button`.
- Instead, see Tag: To filter or toggle a state: use `Tag` in a `TagGroup` with selection, or `SegmentedControl`.
- Instead, see TagGroup: To filter or toggle a state: use `Tag` in a `TagGroup` with selection, or `SegmentedControl`.
- Instead, see SegmentedControl: To filter or toggle a state: use `Tag` in a `TagGroup` with selection, or `SegmentedControl`.
- Instead, see Link: To navigate: use `Link`.
- Renders: Icon
