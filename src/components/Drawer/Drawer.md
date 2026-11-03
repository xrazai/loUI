# Drawer

Status: experimental

A non-modal side panel that sits next to the content, for filters, inspectors and secondary navigation. There is no scrim, the page stays interactive and focus is not trapped. Generic: it lives in the core entry point.

## Drawer or Sheet

|          | Drawer                                                                   | Sheet                                                      |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Modality | Non-modal: page stays usable                                             | Modal: page is `inert`, scroll locked                      |
| Layout   | In the page flow, beside the content                                     | Overlay above the page, with a scrim                       |
| Focus    | Not trapped; Tab leaves the drawer                                       | Trapped and restored                                       |
| Use for  | Filters, inspector for the current selection, secondary navigation, help | Viewing or editing one record, a task to finish or dismiss |

Rule of thumb: if the user should keep working in the page while the panel is open, use a `Drawer`. If the panel is a task that needs a decision before going back, use a `Sheet`.

## When not to use

- A short confirmation or form: `Dialog`.
- A few controls anchored to a button: `Popover`.
- Top-level navigation: `Sidebar`.

## Anatomy

```
aside (role complementary | region, aria-labelledby = title)
  header     --ds-topbar-h tall: heading + close IconButton
  body       scrolls; padded or not
  footer     optional, end-aligned actions
```

Place the drawer as a sibling of the main content in a flex or grid container. It renders nothing while closed and does not animate out.

## Props

| Prop                                      | Type                                    | Default         | Notes                                                                               |
| ----------------------------------------- | --------------------------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `title`                                   | `ReactNode` (required)                  | none            | Heading and accessible name.                                                        |
| `children` / `footer`                     | `ReactNode \| ({ close }) => ReactNode` |                 | Body and end-aligned actions.                                                       |
| `placement`                               | `'start' \| 'end'`                      | `end`           | Edge it sits against; follows the writing direction.                                |
| `size`                                    | `'sm' \| 'md' \| 'lg'`                  | `md`            | 280 / 320 / 400 px (`--ds-drawer-width-*`).                                         |
| `padded`                                  | `boolean`                               | `true`          | Off for a table or list.                                                            |
| `isOpen` / `defaultOpen` / `onOpenChange` |                                         | closed          | Controlled / uncontrolled. `onOpenChange` fires for user closes (button, `Escape`). |
| `autoFocus`                               | `boolean`                               | `true`          | Moves focus to the panel when it opens after first render.                          |
| `role`                                    | `'complementary' \| 'region'`           | `complementary` | Landmark role.                                                                      |
| `headingLevel`                            | `1`-`6`                                 | `2`             | Level of the title.                                                                 |
| `messages`                                | `{ close }`                             |                 | "Close panel" (pt-BR "Fechar painel").                                              |

## Accessibility

- A named landmark (`complementary` by default, `region` on request) labelled by its title.
- Not modal: nothing is hidden from assistive technology and Tab moves freely between the drawer and the page.
- When the drawer opens after first render, focus moves to the panel (it is programmatically focusable, `tabIndex=-1`), so the next Tab reaches its first control. A drawer that is open on first render never takes focus; set `autoFocus={false}` to keep focus where it is.
- `Escape` closes the drawer when focus is inside it (and when no inner overlay handled it) and focus returns to the element that had it before the drawer opened, normally the trigger. Closing from the close button does the same.
- If the consumer closes a controlled drawer from outside (for example a toolbar toggle), focus is left where the user put it.
- Slide-in is a short fade plus 16 px move (`--ds-drawer-shift`); it is removed under `prefers-reduced-motion` and mirrors in right-to-left layouts (`:dir(rtl)`). Borders and padding use logical properties.
- The width is capped by its container (`max-inline-size: 100%`), so on narrow containers it fills the width instead of overflowing.

## Content rules

- Title: the purpose in sentence case ("Filters", "Order details").
- Footer buttons are verb plus object ("Apply filters", "Clear filters"). Use one primary action.

## Examples

```tsx
const [open, setOpen] = useState(false);

<div style={{ display: 'flex' }}>
  <main>
    <Button onPress={() => setOpen(true)}>Open filters</Button>
  </main>
  <Drawer
    title="Filters"
    isOpen={open}
    onOpenChange={setOpen}
    footer={({ close }) => (
      <Button variant="primary" onPress={close}>
        Apply filters
      </Button>
    )}
  >
    <Input label="Customer" />
  </Drawer>
</div>;
```

## Differences from the handoff

New component (GAP-006): the handoff only has the modal `Sheet`.
