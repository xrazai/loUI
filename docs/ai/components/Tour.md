# Tour

> A step-by-step onboarding tour. Each step is a non-modal popover (React Aria `Popover` with
> `isNonModal`) anchored to an element, with a title, a short text, a "Step 2 of 5" counter and
> Skip, Back and Next or Done buttons. The page stays interactive; there is no scrim.

Focus moves into each step as it appears (the step is a named dialog, so a screen reader
announces its title). `Escape` skips the tour. When the tour ends, focus returns to the element
that had it before the tour opened, normally the button that started it.

Use a `Tooltip` for a hint on one control, and a `Popover` for interactive content. A tour is
for a few steps shown once; do not use it to hold documentation.

Step-by-step onboarding hints anchored to elements of the page. Each step is a non-modal popover (React Aria `Popover` with `isNonModal`) with a title, a short text, a "Step 2 of 5" counter and Skip, Back and Next or Done buttons. Generic: it lives in the core entry point.

- Import: `import { Tour } from '@loui/ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Tour/Tour.tsx`
- Stories (Storybook title `Components/Tour`): Default, FirstStep, MiddleStep, LastStep, AboveTarget, KeyboardOnly

## Props

| Prop           | Type                                                                                                                                                                                                                                                                                                                     | Required | Default          | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `steps`        | `readonly TourStep[]`                                                                                                                                                                                                                                                                                                    | yes      |                  | The steps, in order. Each points at one element through `target`.                                 |
| `step`         | `number`                                                                                                                                                                                                                                                                                                                 |          |                  | Zero-based index of the current step (controlled). Pair with `onStepChange`.                      |
| `defaultStep`  | `number`                                                                                                                                                                                                                                                                                                                 |          | `0`              | Initial step when uncontrolled. Default `0`.                                                      |
| `onStepChange` | `(step: number) => void`                                                                                                                                                                                                                                                                                                 |          |                  | Called when the user moves to another step.                                                       |
| `isOpen`       | `boolean`                                                                                                                                                                                                                                                                                                                |          |                  | Controlled open state. Pair with `onOpenChange`.                                                  |
| `defaultOpen`  | `boolean`                                                                                                                                                                                                                                                                                                                |          | `false`          | Initial open state when uncontrolled.                                                             |
| `onOpenChange` | `(isOpen: boolean) => void`                                                                                                                                                                                                                                                                                              |          |                  | Called with `false` when the tour is finished or skipped.                                         |
| `onComplete`   | `() => void`                                                                                                                                                                                                                                                                                                             |          |                  | Called when the user presses Done on the last step. `onOpenChange(false)` follows.                |
| `onSkip`       | `() => void`                                                                                                                                                                                                                                                                                                             |          |                  | Called when the user skips the tour, with `Skip tour` or `Escape`. `onOpenChange(false)` follows. |
| `placement`    | `'bottom' \| 'bottom left' \| 'bottom right' \| 'bottom start' \| 'bottom end' \| 'top' \| 'top left' \| 'top right' \| 'top start' \| 'top end' \| 'left' \| 'left top' \| 'left bottom' \| 'start' \| 'start top' \| 'start bottom' \| 'right' \| 'right top' \| 'right bottom' \| 'end' \| 'end top' \| 'end bottom'` |          | `'bottom start'` | Side and alignment relative to the target. Default `bottom start`. Flips on collision.            |
| `messages`     | `Partial<{ progress: (current: number, total: number) => string; back: string; next: string; done: string; skip: string; }>`                                                                                                                                                                                             |          |                  | Per-instance overrides of the built-in messages.                                                  |
| `className`    | `string`                                                                                                                                                                                                                                                                                                                 |          |                  | Class name for the step surface.                                                                  |
| `ref`          | `Ref<HTMLElement>`                                                                                                                                                                                                                                                                                                       |          |                  | Ref to the step surface.                                                                          |

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Tour: { ... } }}>`.

| Key                                        | English default | Notes                                           |
| ------------------------------------------ | --------------- | ----------------------------------------------- |
| `progress(current: number, total: number)` | `Step 2 of 2`   | Progress text of a step, such as "Step 2 of 5". |
| `back`                                     | `Back`          | Goes to the previous step.                      |
| `next`                                     | `Next`          | Goes to the next step.                          |
| `done`                                     | `Done`          | Finishes the tour on the last step.             |
| `skip`                                     | `Skip tour`     | Ends the tour before the last step.             |

## Design tokens used

`--ds-duration`, `--ds-ease`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-heading`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-heading`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-radius-lg`, `--ds-shadow-overlay`, `--ds-space-1`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-surface-raised`, `--ds-text`, `--ds-text-2`, `--ds-text-3`, `--ds-tour-arrow-size`, `--ds-tour-padding`, `--ds-tour-width`, `--ds-weight-semibold`

## When to use

- Guiding new users through the interface with a few onboarding hints (three to six steps) that introduce a screen.
- Pointing at controls that are not obvious from their label.

## When not to use

- A hint on one control: `Tooltip`.
- Interactive content anchored to a button (filters, a small form): `Popover`.
- Documentation or long explanations: link to help instead.
- A task the user must finish before going on: `Dialog` or `Sheet`.

## Anatomy

```
Popover (non-modal, anchored to step.target, z popover, overlay shadow)
  OverlayArrow
  Dialog (role=dialog, named by the title)
    Heading        step title
    content        step text (--ds-text-2)
    footer         "Step 2 of 5" (mono) ... Skip tour (ghost) · Back · Next | Done (primary)
```

The primary button is Next, or Done on the last step. Skip is hidden on the last step, Back on the first.

## Accessibility

- Each step is a `dialog` named by its title. It is non-modal: the page is not inert, there is no scrim, nothing is hidden from assistive technology.
- Focus moves into each step as it appears (the dialog itself, so a screen reader reads its title; the next `Tab` reaches Skip, Back and Next). Pressing Next or Back mounts the next step and moves focus to it, so focus never lands on a removed button.
- `Escape` skips the tour. Pressing or tabbing elsewhere on the page does not end it.
- When the tour ends, focus returns to the element that had focus when the tour opened (normally the button that started it); for a tour that is open on first render, to the target of the current step if it is focusable. If the consumer closes a controlled tour from outside, focus is left where the user put it.
- The target is scrolled into view (`block: nearest`) when its step appears. The step is positioned against the target and flips when it does not fit; the arrow points at the target.
- The fade-in is removed under `prefers-reduced-motion`. Visuals are calm: raised surface, strong line and the overlay shadow only; accent is used only for focus rings.
- Because the step is rendered in a portal, it comes last in the Tab order of the page: the user reaches it by the focus that moves into it, not by tabbing from the target.

## Content rules

- Title: the name of the thing, in sentence case ("Filters"). Text: one or two sentences saying what it does, with no exclamation marks or emoji.
- Button labels come from the message catalog: Back, Next, Done, Skip tour.

## Examples

```tsx
const search = useRef<HTMLButtonElement>(null);
const filters = useRef<HTMLButtonElement>(null);
const [open, setOpen] = useState(false);

<>
  <Button onPress={() => setOpen(true)}>Start tour</Button>
  <Button ref={search}>Search</Button>
  <Button ref={filters}>Filters</Button>
  <Tour
    isOpen={open}
    onOpenChange={setOpen}
    steps={[
      { target: search, title: 'Search', content: 'Find any item by name or code.' },
      { target: filters, title: 'Filters', content: 'Narrow the list by status or date.' },
    ]}
  />
</>;
```

## Related components

- Instead, see Tooltip: A hint on one control: `Tooltip`.
- Instead, see Popover: Interactive content anchored to a button (filters, a small form): `Popover`.
- Instead, see Dialog: A task the user must finish before going on: `Dialog` or `Sheet`.
- Instead, see Sheet: A task the user must finish before going on: `Dialog` or `Sheet`.
- Renders: Button
