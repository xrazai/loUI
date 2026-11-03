# ToolCallStep

> One step of an agent run: the tool it called, whether it is running, succeeded or failed, how
> long it took and, on request, what went in and out.

With `input` or `output` the header is a button that opens the details (`aria-expanded`,
`aria-controls`), inside a heading so the steps appear in the outline. Without them it is
plain text. The status is text plus an icon, never color alone. When a running step finishes,
a polite live region says so once; a step that is already finished on first render is silent.

One step of an agent run: the tool it called, whether it is running, succeeded or failed, how long it took and, on request, what went in and out. `ToolCallList` shows a multi-step run. Import both from `loui-ds/patterns`.

- Import: `import { ToolCallStep } from 'loui-ds/patterns';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/patterns/ToolCallStep/ToolCallStep.tsx`
- Stories (Storybook title `Patterns/ToolCallStep`): Default, Running, Failed, Expanded, WithoutDetails, LongName, RightToLeft, MultiStepRun

## Props

| Prop               | Type                                                                                                                                                                                                                       | Required | Default | Description                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | `string`                                                                                                                                                                                                                   | yes      |         | Name of the tool or step ("search_orders"). Shown in mono; it is the name of the details button.                                                           |
| `status`           | `'running' \| 'succeeded' \| 'failed'`                                                                                                                                                                                     | yes      |         | `running` (spinner), `succeeded` or `failed`. The status is always shown as text next to its icon.                                                         |
| `durationMs`       | `number`                                                                                                                                                                                                                   |          |         | How long the step took, in milliseconds. Omit while it is running.                                                                                         |
| `input`            | `ReactNode`                                                                                                                                                                                                                |          |         | What the tool was called with. A string is shown in a code block; pass nodes for anything richer. With `input` or `output` the step gets a details button. |
| `output`           | `ReactNode`                                                                                                                                                                                                                |          |         | What the tool returned, or the error text when `status` is `failed`. Same rules as `input`.                                                                |
| `isExpanded`       | `boolean`                                                                                                                                                                                                                  |          |         | Controlled state of the details.                                                                                                                           |
| `defaultExpanded`  | `boolean`                                                                                                                                                                                                                  |          | `false` | Initial state of the details when uncontrolled. Default closed.                                                                                            |
| `onExpandedChange` | `(isExpanded: boolean) => void`                                                                                                                                                                                            |          |         | Called when the details open or close.                                                                                                                     |
| `headingLevel`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                                                                                                                                                                               |          | `4`     | Heading level of the step header (`h1` to `h6`). Default `4`.                                                                                              |
| `messages`         | `Partial<{ running: string; succeeded: string; failed: string; input: string; output: string; error: string; finishedSucceeded: (name: string) => string; finishedFailed: (name: string) => string; listLabel: string; }>` |          |         | Override the built-in messages for this instance.                                                                                                          |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ ToolCallStep: { ... } }}>`.

| Key                               | English default    | Notes                                                                       |
| --------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `running`                         | `Running`          | Visible status text of a step.                                              |
| `succeeded`                       | `Succeeded`        |                                                                             |
| `failed`                          | `Failed`           |                                                                             |
| `input`                           | `Input`            | Labels of the detail blocks, and the accessible names of their code blocks. |
| `output`                          | `Output`           |                                                                             |
| `error`                           | `Error`            | Label of the output block when the step failed.                             |
| `finishedSucceeded(name: string)` | `{name} succeeded` | Polite announcement when a running step finishes.                           |
| `finishedFailed(name: string)`    | `{name} failed`    |                                                                             |
| `listLabel`                       | `Steps`            | Accessible name of a ToolCallList.                                          |

## Design tokens used

`--ds-accent`, `--ds-danger`, `--ds-danger-line`, `--ds-duration`, `--ds-ease`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-caption`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-lh-caption`, `--ds-lh-label`, `--ds-line`, `--ds-radius-lg`, `--ds-space-1`, `--ds-success`, `--ds-surface`, `--ds-surface-row-hover`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tool-call-step-gap`, `--ds-tool-call-step-list-gap`, `--ds-tool-call-step-padding-block`, `--ds-tool-call-step-padding-inline`, `--ds-tracking-caption`

## When to use

- Under an assistant message, to show what the agent did before it answered ("search_orders", "draft_reply").
- A run log where the owner wants to check why the agent answered as it did.

## When not to use

- Progress of a long job with a known number of steps: use `StatusSteps` or `Progress`.
- Something the owner has to approve: use `ApprovalCard`.

## Anatomy

```
div (ToolCallStep)
  h{headingLevel} > button   chevron · status icon + text · name (mono) · duration (mono)
  details (when open)        "Input" label + code block · "Output" or "Error" label + code block
  status                     visually hidden live region
ol (ToolCallList)            one li per step
```

Without `input` and `output` the header is plain text and there is nothing to open.

## Accessibility

- The header is a button inside a heading (`aria-expanded`, `aria-controls`); `Enter` and `Space` toggle it.
- Color never carries the status: the text "Running", "Succeeded" or "Failed" is always visible, with an icon.
- When a running step finishes, a polite live region says "search_orders succeeded" or "search_orders failed" once. A step that is already finished on first render is silent.
- Code blocks that overflow become labelled, keyboard-scrollable regions ("Input", "Output", "Error").
- Reduced motion and forced colors are handled.

## Content rules

- Tool names are identifiers: show them as the agent calls them, in mono.
- Put the error text in `output` when a step fails, and say how to fix it when you can.
- Do not put secrets, tokens or customer data in `input` or `output`.

## Example

```tsx
<ToolCallList
  aria-label="Steps of the order check"
  steps={[
    {
      stepId: 's1',
      name: 'search_orders',
      status: 'succeeded',
      durationMs: 1240,
      input: '{ "customer": "C-204" }',
      output: '{ "count": 3 }',
    },
    { stepId: 's2', name: 'draft_reply', status: 'running' },
  ]}
/>
```

## Related components

- Instead, see StatusSteps: Progress of a long job with a known number of steps: use `StatusSteps` or `Progress`.
- Instead, see Progress: Progress of a long job with a known number of steps: use `StatusSteps` or `Progress`.
- Instead, see ApprovalCard: Something the owner has to approve: use `ApprovalCard`.
- Renders: Code, Icon, Spinner, VisuallyHidden
