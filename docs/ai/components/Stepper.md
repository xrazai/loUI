# Stepper

> Progress through a multi-step flow such as a setup assistant. It is an ordered list; every
> step states its progress as text for assistive technology ("Completed", "Current", "Not
> started") and the current step has `aria-current="step"`. Markers and connectors are
> decorative. Completed steps can be buttons with `onStepPress`.

In narrow containers the horizontal orientation shows only the markers and a visible summary
("Step 3 of 9"), so nine steps fit in 320 px.

Progress through a multi-step flow, such as a 9-step setup assistant. It is an ordered list; each step states its progress as text for assistive technology, and completed steps can optionally be buttons to go back.

- Import: `import { Stepper } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Stepper/Stepper.tsx`
- Stories (Storybook title `Components/Stepper`): Default, FirstStep, AllComplete, Vertical, NineStepsNarrow, NineStepsWide, LongLabels, GoBackToCompletedSteps, RightToLeft

## Props

| Prop              | Type                                                                                                                     | Required | Default        | Description                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `steps`           | `readonly StepperStep[]`                                                                                                 | yes      |                | The steps, in order.                                                                                                                                                                            |
| `current`         | `number`                                                                                                                 | yes      |                | Index of the current step (0-based). Steps before it are completed.                                                                                                                             |
| `aria-label`      | `string`                                                                                                                 |          |                | Accessible name of the list ("New agent steps"). Required: name this or use `aria-labelledby`.                                                                                                  |
| `aria-labelledby` | `string`                                                                                                                 |          |                | Id of the element that names the list.                                                                                                                                                          |
| `complete`        | `boolean`                                                                                                                |          | `false`        | When `true`, the current step is completed too (the whole flow is done).                                                                                                                        |
| `orientation`     | `'horizontal' \| 'vertical'`                                                                                             |          | `'horizontal'` | `horizontal` (default) or `vertical`. Horizontal collapses to markers and "Step 3 of 9" in narrow containers.                                                                                   |
| `onStepPress`     | `(index: number, step: StepperStep) => void`                                                                             |          |                | Makes every completed step a button that calls this with its index and the step, so people can go back. The current and upcoming steps are never buttons: the flow itself (Next) moves forward. |
| `messages`        | `Partial<{ complete: string; current: string; upcoming: string; summary: (current: string, total: string) => string; }>` |          |                | Message overrides for this instance.                                                                                                                                                            |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Stepper: { ... } }}>`.

| Key                                       | English default             | Notes                                                                                                    |
| ----------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `complete`                                | `Completed`                 | Read after the label of a step that is done.                                                             |
| `current`                                 | `Current`                   | Read after the label of the step in progress.                                                            |
| `upcoming`                                | `Not started`               | Read after the label of a step that has not started.                                                     |
| `summary(current: string, total: string)` | `Step {current} of {total}` | Visible summary of the progress when the labels do not fit; `current` and `total` are formatted numbers. |

## Design tokens used

`--ds-accent`, `--ds-duration`, `--ds-ease`, `--ds-focus-ring`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-line-control`, `--ds-line-strong`, `--ds-primary-bg`, `--ds-radius-md`, `--ds-radius-pill`, `--ds-space-2`, `--ds-stepper-connector-thickness`, `--ds-stepper-content-z-index`, `--ds-stepper-gap`, `--ds-stepper-marker-border-width`, `--ds-stepper-marker-size`, `--ds-stepper-padding-block`, `--ds-stepper-step-gap`, `--ds-success`, `--ds-surface`, `--ds-surface-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-inverse`, `--ds-weight-medium`, `--ds-weight-semibold`

## When to use

- A guided flow with several steps shown one at a time (assistant, onboarding, checkout), where people need to know where they are and how much is left.
- Flows of 3 to 10 steps. In narrow containers it collapses to markers plus "Step 3 of 9".

## When not to use

- The status of a record in a fixed flow (Draft, Packed, Shipped): use `StatusSteps`.
- A percentage of something: use `Progress`.
- Switching between views of the same content: use `Tabs`.

### Stepper and StatusSteps

|                    | Stepper                                        | StatusSteps                              |
| ------------------ | ---------------------------------------------- | ---------------------------------------- |
| Describes          | Your progress through a flow you are doing now | The state a record is in                 |
| Typical length     | 3 to 10 steps                                  | 3 to 6 steps                             |
| Interaction        | Only completed steps can be pressed (go back)  | Every step can be pressed (change state) |
| Orientation        | Horizontal or vertical                         | Horizontal                               |
| Narrow containers  | Markers plus "Step 3 of 9"                     | Same layout                              |
| Per-step help text | `description` (vertical)                       | None                                     |

## Anatomy

```
div[data-orientation]
  p (aria-hidden)           "Step 3 of 9: Label", visible only in narrow containers
  ol aria-label="Setup progress"
    li[data-state=complete|current|upcoming]
      span | button         (button only for completed steps with onStepPress; aria-current="step" on the current one)
        marker              (number or check, aria-hidden)
        label + visually hidden state ("Completed", "Current", "Not started")
        description         (vertical only)
  connector lines           (CSS pseudo-elements, decorative)
```

## Accessibility

- A real ordered list named by `aria-label` or `aria-labelledby`. The current step has `aria-current="step"` (on the button when it is one).
- Progress is text, not only color or a check: every step ends with a visually hidden "Completed", "Current" or "Not started" (messages).
- Markers, connectors and the "Step 3 of 9" summary are decorative duplicates (`aria-hidden`); the list conveys the same information.
- Keyboard: completed step buttons are in the Tab order and activate with `Enter` or `Space`. Upcoming steps are not focusable, so people cannot skip ahead; move forward with the flow's own Next button.
- Target size: the marker is 24 px, so step buttons meet WCAG 2.5.8 even at 320 px with 9 steps.
- Reflow: in containers up to 480 px wide the horizontal labels are visually hidden (still read by screen readers) and a visible "Step N of M: label" line appears. The vertical orientation needs no collapse.
- Forced colors: markers and connectors use system colors; the state text still names every step.

## Content rules

- Labels: a few words, sentence case, nouns ("Source", "Review"), not sentences.
- The description says what the step is for, in one line ("Name and purpose").
- Name the list for what it is: "New agent steps", not "Steps".

## Examples

```tsx
<Stepper aria-label="Setup progress" steps={steps} current={step} />

<Stepper
  aria-label="Setup progress"
  orientation="vertical"
  steps={steps}
  current={step}
  onStepPress={(index) => setStep(index)}
/>
```

## Related components

- Instead, see StatusSteps: The status of a record in a fixed flow (Draft, Packed, Shipped): use `StatusSteps`.
- Instead, see Progress: A percentage of something: use `Progress`.
- Instead, see Tabs: Switching between views of the same content: use `Tabs`.
- Renders: Icon, VisuallyHidden
