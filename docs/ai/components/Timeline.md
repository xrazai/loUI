# Timeline

> A chronological list of events. It is an ordered list; each event has a `<time>`, a title, an
> optional description, an optional actor and an optional tone marker. The marker and the line
> are decorative: a tone is also stated as hidden text before the title.
> Newest events come first by default, the order for dated records.

A chronological list of events: when it happened, what happened, who did it, and an optional detail and tone marker. It is a semantic ordered list, newest event first by default.

- Import: `import { Timeline } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Timeline/Timeline.tsx`
- Stories (Storybook title `Components/Timeline`): Default, OldestFirst, Tones, DateOnly, LongText, SingleEvent, Empty, RightToLeft

## Props

| Prop       | Type                                                                                                               | Required | Default          | Description                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `items`    | `readonly TimelineItem[]`                                                                                          | yes      |                  | The events.                                                                                                                 |
| `order`    | `'newest-first' \| 'oldest-first' \| 'as-given'`                                                                   |          | `'newest-first'` | Order of the list: `newest-first` (default, for dated records), `oldest-first`, or `as-given` to keep the order of `items`. |
| `timeZone` | `string`                                                                                                           |          |                  | IANA time zone used to show date-times ("America/Sao_Paulo"). Defaults to the viewer's zone.                                |
| `empty`    | `ReactNode`                                                                                                        |          |                  | Rendered instead of the list when `items` is empty (for example an `EmptyState`).                                           |
| `messages` | `Partial<{ accent: string; success: string; warning: string; danger: string; actor: (actor: string) => string; }>` |          |                  | Message overrides for this instance.                                                                                        |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Timeline: { ... } }}>`.

| Key                    | English default | Notes                                                                                                       |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `accent`               | `Highlighted`   | Visually hidden prefix read before the title of an event with a tone; color and icon alone cannot carry it. |
| `success`              | `Success`       |                                                                                                             |
| `warning`              | `Warning`       |                                                                                                             |
| `danger`               | `Error`         |                                                                                                             |
| `actor(actor: string)` | `By {actor}`    | Visible label before the person or system that caused the event.                                            |

## Design tokens used

`--ds-accent`, `--ds-bg`, `--ds-danger`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-label`, `--ds-fs-meta`, `--ds-fs-small`, `--ds-lh-label`, `--ds-lh-meta`, `--ds-lh-small`, `--ds-line-control`, `--ds-line-strong`, `--ds-radius-pill`, `--ds-space-1`, `--ds-space-3`, `--ds-success`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-timeline-connector-thickness`, `--ds-timeline-dot-size`, `--ds-timeline-item-gap`, `--ds-timeline-marker-gap`, `--ds-timeline-marker-size`, `--ds-warning`, `--ds-weight-medium`

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

## Related components

- Instead, see DataTable: Tabular data that people sort and compare: use `DataTable`.
- Instead, see Stepper: The steps of a flow someone is going through now: use `Stepper`.
- Instead, see StatusSteps: The state of a record in a fixed flow: use `StatusSteps`.
- Instead, see LedgerList: Totals and amounts per line: use `LedgerList`.
- Renders: Icon, VisuallyHidden
