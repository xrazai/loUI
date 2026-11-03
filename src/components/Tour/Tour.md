# Tour

Status: experimental

Step-by-step onboarding hints anchored to elements of the page. Each step is a non-modal popover (React Aria `Popover` with `isNonModal`) with a title, a short text, a "Step 2 of 5" counter and Skip, Back and Next or Done buttons. Generic: it lives in the core entry point.

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

## Props

| Prop                                      | Type                                                                   | Default        | Notes                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `steps`                                   | `{ target: RefObject<Element \| null>, title, content, placement? }[]` | required       | A step whose target is not mounted renders nothing.                                          |
| `step` / `defaultStep` / `onStepChange`   | `number`                                                               | `0`            | Zero-based index; controlled / uncontrolled.                                                 |
| `isOpen` / `defaultOpen` / `onOpenChange` |                                                                        | closed         | Controlled / uncontrolled. `onOpenChange(false)` fires when the tour is finished or skipped. |
| `onComplete`                              | `() => void`                                                           |                | Done on the last step.                                                                       |
| `onSkip`                                  | `() => void`                                                           |                | Skip tour or `Escape`.                                                                       |
| `placement`                               | popover placement                                                      | `bottom start` | Flips on collision; each step may override it.                                               |
| `messages`                                | `{ progress, back, next, done, skip }`                                 |                | pt-BR included.                                                                              |

When the tour ends (finished or skipped) an uncontrolled step index returns to the first step.

## Accessibility

- Each step is a `dialog` named by its title. It is non-modal: the page is not inert, there is no scrim, nothing is hidden from assistive technology.
- Focus moves into each step as it appears (the dialog itself, so a screen reader reads its title; the next `Tab` reaches Skip, Back and Next). Pressing Next or Back mounts the next step and moves focus to it, so focus never lands on a removed button.
- While a step is open, `Tab` and `Shift+Tab` cycle through the step's buttons (React Aria contains focus in the dialog); `Escape` skips the tour and is the keyboard way out. A pointer press elsewhere on the page does not end it, and the page stays visible and readable (no scrim, not inert).
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

## Differences from the handoff

New component (GAP-006): the handoff has no onboarding component.
