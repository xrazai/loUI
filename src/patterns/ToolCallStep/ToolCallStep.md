# ToolCallStep

Status: experimental

One step of an agent run: the tool it called, whether it is running, succeeded or failed, how long it took and, on request, what went in and out. `ToolCallList` shows a multi-step run. Import both from `loui-ds/patterns`.

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

## Props

| Prop                                                  | Type                                   | Default | Notes                                                                        |
| ----------------------------------------------------- | -------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `name`                                                | `string`                               | -       | Required. Mono; part of the button name.                                     |
| `status`                                              | `'running' \| 'succeeded' \| 'failed'` | -       | Required. Always shown as text plus an icon (Spinner while running).         |
| `durationMs`                                          | `number`                               |         | Milliseconds. Shown as `85 ms` or `1.2 s`, formatted with the active locale. |
| `input` / `output`                                    | `ReactNode`                            |         | A string goes in a `Code` block; nodes are rendered as given.                |
| `isExpanded` / `defaultExpanded` / `onExpandedChange` | `boolean` / `boolean` / `(b) => void`  | closed  | Controlled or uncontrolled details.                                          |
| `headingLevel`                                        | `1`-`6`                                | `4`     |                                                                              |
| `messages`                                            | partial catalog                        |         | `running`, `succeeded`, `failed`, `input`, `output`, `error`, announcements. |

`ToolCallList` takes `steps` (each a `ToolCallStep` prop set plus a stable `stepId`), an `aria-label` (default "Steps") and `messages`, which it shares with every step.

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

## Differences from the handoff

No handoff source: new pattern (TODO `AI-013`).
