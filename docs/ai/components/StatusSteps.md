# StatusSteps

> A horizontal indicator of progress through a linear status flow (Draft, Packed, Shipped).
> It is an ordered list; every step states its progress as text read by assistive technology
> ("Completed", "Current", "Not started", from messages), and the current step has
> `aria-current="step"`. The marker (number or check) and the connector lines are decorative.

With `onSelect` each step becomes a real button, so the status can be changed from here.

A horizontal indicator of progress through a linear status flow (Draft, Packed, Shipped, Delivered). It is an ordered list; each step states its progress as text for assistive technology, and the steps can optionally be buttons to change the status.

- Handoff source: `components/erp/StatusSteps.jsx` (TODO `CMP-PAT-05`).

- Import: `import { StatusSteps } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/StatusSteps/StatusSteps.tsx`
- Stories (Storybook title `Components/StatusSteps`): Default, FirstStep, Complete, ManySteps, LongLabels, Interactive, Controlled, Portuguese, RightToLeft, Focused

## Props

| Prop              | Type                                                                | Required | Default | Description                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `steps`           | `readonly StatusStep[]`                                             | yes      |         | The steps, in order.                                                                                                                                                                       |
| `current`         | `number`                                                            | yes      |         | Index of the current step (0-based). Steps before it are complete.                                                                                                                         |
| `aria-label`      | `string`                                                            |          |         | Accessible name of the list ("Order status"). Required: name this or use `aria-labelledby`.                                                                                                |
| `aria-labelledby` | `string`                                                            |          |         | Id of the element that names the list.                                                                                                                                                     |
| `complete`        | `boolean`                                                           |          | `false` | When `true`, the current step is complete too (the whole flow is done).                                                                                                                    |
| `onSelect`        | `(index: number, step: StatusStep) => void`                         |          |         | Makes every step a button. Called with the index and the step; the consumer decides whether going back or skipping ahead is allowed. Reversible changes need no confirmation (offer Undo). |
| `messages`        | `Partial<{ complete: string; current: string; upcoming: string; }>` |          |         | Message overrides for this instance.                                                                                                                                                       |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ StatusSteps: { ... } }}>`.

| Key        | English default | Notes                                                |
| ---------- | --------------- | ---------------------------------------------------- |
| `complete` | `Completed`     | Read after the label of a step that is done.         |
| `current`  | `Current`       | Read after the label of the step in progress.        |
| `upcoming` | `Not started`   | Read after the label of a step that has not started. |

## Design tokens used

`--ds-accent`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-meta`, `--ds-lh-meta`, `--ds-line-control`, `--ds-line-strong`, `--ds-primary-bg`, `--ds-radius-md`, `--ds-radius-pill`, `--ds-space-2`, `--ds-status-steps-connector-thickness`, `--ds-status-steps-content-z-index`, `--ds-status-steps-gap`, `--ds-status-steps-marker-border-width`, `--ds-status-steps-marker-hover-border`, `--ds-status-steps-marker-size`, `--ds-status-steps-padding-block`, `--ds-success`, `--ds-surface`, `--ds-surface-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-inverse`, `--ds-weight-medium`, `--ds-weight-semibold`

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

## Related components

- Instead, see Tabs: A multi-page form with validation and Back/Next: build it with `Tabs` or your router.
- Instead, see Badge: Non-linear or parallel states: use `Badge`.
- Instead, see Progress: A percentage of something: use `Progress`.
- Renders: Icon, VisuallyHidden
