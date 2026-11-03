# Stepper

Status: experimental

Progress through a multi-step flow, such as a 9-step setup assistant. It is an ordered list; each step states its progress as text for assistive technology, and completed steps can optionally be buttons to go back.

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

## Props

| Prop          | Type                                       | Default        | Notes                                                               |
| ------------- | ------------------------------------------ | -------------- | ------------------------------------------------------------------- |
| `aria-label`  | `string`                                   |                | Required unless `aria-labelledby` is given: names the list          |
| `steps`       | `{ id, label, description? }[]`            |                | In order                                                            |
| `current`     | `number`                                   |                | 0-based index of the current step; earlier steps are completed      |
| `complete`    | `boolean`                                  | `false`        | The current step is completed too (flow finished)                   |
| `orientation` | `'horizontal' \| 'vertical'`               | `'horizontal'` |                                                                     |
| `onStepPress` | `(index, step) => void`                    |                | Makes completed steps buttons. Current and upcoming steps never are |
| `messages`    | `{ complete, current, upcoming, summary }` |                | Per-instance overrides                                              |

Other `div` attributes and `ref` go to the root.

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
