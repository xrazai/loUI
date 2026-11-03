# Timeline

Status: experimental

A chronological list of events: when it happened, what happened, who did it, and an optional detail and tone marker. It is a semantic ordered list, newest event first by default.

## When to use

- The history of a record or a process: status changes, comments, deliveries, audit entries.
- Events that have a time and read as a story, a few lines each.

## When not to use

- Tabular data that people sort and compare: use `DataTable`.
- The steps of a flow someone is going through now: use `Stepper`.
- The state of a record in a fixed flow: use `StatusSteps`.
- Totals and amounts per line: use `LedgerList`.

## Anatomy

```
ol[aria-label]
  li[data-tone]
    marker (aria-hidden)         dot (neutral) | icon: accent info, success check, warning triangle, danger circle
    div
      title                      VisuallyHidden tone text ("Success") + title
      meta                       "By <actor>" · <time dateTime>
      description                optional
  connector line                 (CSS pseudo-element, decorative)
```

## Props

| Prop       | Type                                             | Default          | Notes                                                                                  |
| ---------- | ------------------------------------------------ | ---------------- | -------------------------------------------------------------------------------------- |
| `items`    | `TimelineItem[]`                                 |                  | `{ id, time, title, description?, tone?, actor? }`                                     |
| `order`    | `'newest-first' \| 'oldest-first' \| 'as-given'` | `'newest-first'` | Dated records are newest first (AGENTS.md section 5, rule 5b). Does not mutate `items` |
| `timeZone` | `string`                                         | viewer's zone    | IANA zone for date-times                                                               |
| `empty`    | `ReactNode`                                      |                  | Rendered instead of the list when `items` is empty                                     |
| `messages` | `{ accent, success, warning, danger, actor }`    |                  | Per-instance overrides                                                                 |

`time` is an ISO 8601 date-time, a `Date`, or a date-only `YYYY-MM-DD` (shown as a date without a time, in UTC so the day never shifts). Other `ol` attributes (`aria-label`, `id`) and `ref` go to the list; name it with `aria-label` or `aria-labelledby` when the heading does not.

## Accessibility

- A real ordered list; each time is a `<time dateTime>` with a machine-readable value, and its text comes from `Intl` for the active locale (never hand-built).
- The tone is not only color and icon: a visually hidden prefix ("Success", "Warning", "Error", "Highlighted", from messages) comes before the title. The marker and the line are `aria-hidden`.
- The list is not interactive, so it has no keyboard behavior of its own; put links or buttons in the `title` or `description` when an event needs an action.
- Text uses `text` and `text-2` (4.5:1 on the page surface). Forced colors: markers and line use system colors.
- Reflow: text wraps (long words break) and the layout is a single column, so it works at 320 px.

## Content rules

- Title: what happened, past tense, sentence case, no exclamation marks ("Order shipped", "Request approved").
- Description: one short sentence of detail, only when it adds something.
- Actor: a person or system name. The component adds "By".
- Do not repeat the time in the title.

## Examples

```tsx
<Timeline
  aria-label="Request history"
  items={[
    { id: 'a', time: '2026-10-28T09:15:00Z', title: 'Request created', actor: 'Ana Costa' },
    { id: 'b', time: '2026-10-31T16:05:00Z', title: 'Request approved', tone: 'success' },
  ]}
/>

<Timeline aria-label="Audit log" items={events} order="oldest-first" timeZone="UTC" />
```
