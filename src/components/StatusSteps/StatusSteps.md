# StatusSteps

Status: experimental

A horizontal indicator of progress through a linear status flow (Draft, Packed, Shipped, Delivered). It is an ordered list; each step states its progress as text for assistive technology, and the steps can optionally be buttons to change the status.

- Handoff source: `components/erp/StatusSteps.jsx` (TODO `CMP-PAT-05`).

## When to use

- Show where a record is in a fixed, ordered flow, optionally letting people move it.
- A flow of 3 to 6 short steps.

## When not to use

- A multi-page form with validation and Back/Next: build it with `Tabs` or your router.
- Non-linear or parallel states: use `Badge`.
- A percentage of something: use `Progress`.

## Anatomy

```
ol aria-label="Order status"
  li[data-state=complete|current|upcoming]
    span | button            (button only with onSelect; aria-current="step" on the current one)
      marker                 (number or check, aria-hidden)
      label
      visually hidden state  ("Completed", "Current", "Not started")
  connector lines            (CSS pseudo-elements, decorative)
```

## Props

| Prop                             | Type                              | Default      | Notes                                                          |
| -------------------------------- | --------------------------------- | ------------ | -------------------------------------------------------------- |
| `steps`                          | `StatusStep[]`                    | required     | `{ id, label }` in order.                                      |
| `current`                        | `number`                          | required     | 0-based index of the current step. Earlier steps are complete. |
| `complete`                       | `boolean`                         | `false`      | The current step is complete too (whole flow done).            |
| `onSelect`                       | `(index, step) => void`           | none         | Turns every step into a button.                                |
| `aria-label` / `aria-labelledby` | `string`                          | one required | Names the list ("Order status"). Enforced by the types.        |
| `messages`                       | `{ complete, current, upcoming }` | none         | Overrides the state texts for this instance.                   |

## Accessibility

- `ol` / `li` semantics; the position is implied by the list ("2 of 4").
- Every step's state is real text read after its label (`Completed`, `Current`, `Not started`, from messages). The number or check is `aria-hidden`; color and the check are not the only signal.
- The current step has `aria-current="step"`.
- With `onSelect`, steps are native buttons: Tab / Shift+Tab move, Enter and Space select, focus has the accent ring. There is no roving focus because this is a list of buttons, not a composite widget.
- Contrast: upcoming labels use `--ds-text-2` and the upcoming marker border `--ds-line-control` (3:1).
- Forced colors: current and complete markers use `Highlight`; connectors use `ButtonText`.

## Content rules

- Labels are nouns or past participles in sentence case ("Packed", "In production").
- Moving a status is reversible: do not confirm; offer Undo in a toast.

## Examples

```tsx
<StatusSteps
  aria-label="Order status"
  steps={[
    { id: 'draft', label: 'Draft' },
    { id: 'packed', label: 'Packed' },
    { id: 'shipped', label: 'Shipped' },
  ]}
  current={1}
  onSelect={(index) => setStatus(index)}
/>
```

## Differences from the handoff

- `div`s become an ordered list; interactive steps are real `button`s instead of `div role="button"`.
- Step state is announced as text (it was color and a check only). The hard-coded Portuguese tooltip is gone; all text comes from messages (`en`, `pt-BR`).
- Steps need an `id`; strings are no longer accepted. The step number is formatted for the locale.
- Sizes, gaps and the connector thickness are tokens (`--ds-status-steps-*`); hover is CSS, not React state.
