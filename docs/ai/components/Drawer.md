# Drawer

> A non-modal side panel for filters, inspectors and secondary navigation. It sits next to the
> content in the page flow: there is no scrim, the page stays interactive, focus is not trapped
> and the page is not made inert. Place it as a sibling of the main content inside a flex or grid
> container; it renders nothing while closed.

Use `Sheet` instead when the panel is a task that must be finished or dismissed first
(editing one record): that one is modal.

`Escape` closes the drawer while focus is inside it and returns focus to the trigger.

A non-modal side panel that sits next to the content, for filters, inspectors and secondary navigation. There is no scrim, the page stays interactive and focus is not trapped. Generic: it lives in the core entry point.

- Import: `import { Drawer } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Drawer/Drawer.tsx`
- Stories (Storybook title `Components/Drawer`): Default, AtStart, Small, Large, Region, Unpadded, LongContent, Rtl, OpenAndCloseWithKeyboard

## Props

| Prop           | Type                                                         | Required | Default           | Description                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------ | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`        | `ReactNode`                                                  | yes      |                   | Heading of the drawer and its accessible name.                                                                                                                                                                                                   |
| `children`     | `ReactNode \| ((options: DrawerRenderOptions) => ReactNode)` |          |                   | Body of the drawer; it scrolls when it is taller than the drawer. A function receives `close`.                                                                                                                                                   |
| `footer`       | `ReactNode \| ((options: DrawerRenderOptions) => ReactNode)` |          |                   | Footer actions, aligned to the end. A function receives `close`.                                                                                                                                                                                 |
| `placement`    | `'start' \| 'end'`                                           |          | `'end'`           | Edge the drawer sits against: `end` (default) or `start`. Both follow the writing direction.                                                                                                                                                     |
| `size`         | `'sm' \| 'md' \| 'lg'`                                       |          | `'md'`            | Width: `sm` 280px, `md` 320px (default), `lg` 400px. It never exceeds its container.                                                                                                                                                             |
| `padded`       | `boolean`                                                    |          | `true`            | Pads the body. Turn it off for a table or a full-bleed list. Default `true`.                                                                                                                                                                     |
| `isOpen`       | `boolean`                                                    |          |                   | Controlled open state. Pair with `onOpenChange`.                                                                                                                                                                                                 |
| `defaultOpen`  | `boolean`                                                    |          | `false`           | Initial open state when uncontrolled.                                                                                                                                                                                                            |
| `onOpenChange` | `(isOpen: boolean) => void`                                  |          |                   | Called when the drawer opens or closes through the user (close button or `Escape`).                                                                                                                                                              |
| `autoFocus`    | `boolean`                                                    |          | `true`            | Moves focus into the drawer when it opens after the first render. A drawer that is open on first render never takes focus. Default `true`; turn it off for a panel that should stay beside the page without interrupting what the user is doing. |
| `role`         | `'complementary' \| 'region'`                                |          | `'complementary'` | Landmark role. `complementary` (default) for content that supports the page (filters, inspectors); `region` for a section the user may want to find in the landmark list.                                                                        |
| `headingLevel` | `'1' \| '2' \| '3' \| '4' \| '5' \| '6'`                     |          | `'2'`             | Level of the title heading. Default `2`.                                                                                                                                                                                                         |
| `messages`     | `Partial<{ close: string; }>`                                |          |                   | Per-instance overrides of the built-in messages.                                                                                                                                                                                                 |
| `className`    | `string`                                                     |          |                   | Class name for the drawer panel.                                                                                                                                                                                                                 |
| `ref`          | `Ref<HTMLElement>`                                           |          |                   | Ref to the drawer panel.                                                                                                                                                                                                                         |

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Drawer: { ... } }}>`.

| Key     | English default | Notes                                          |
| ------- | --------------- | ---------------------------------------------- |
| `close` | `Close panel`   | Name of the close button in the Drawer header. |

## Design tokens used

`--ds-drawer-from`, `--ds-drawer-padding`, `--ds-drawer-shift`, `--ds-drawer-width`, `--ds-drawer-width-lg`, `--ds-drawer-width-md`, `--ds-drawer-width-sm`, `--ds-duration`, `--ds-ease`, `--ds-font-sans`, `--ds-fs-heading`, `--ds-fs-small`, `--ds-lh-heading`, `--ds-lh-small`, `--ds-line`, `--ds-line-subtle`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-surface`, `--ds-text`, `--ds-topbar-h`, `--ds-weight-semibold`

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

## Related components

- Instead, see Dialog: A short confirmation or form: `Dialog`.
- Instead, see Popover: A few controls anchored to a button: `Popover`.
- Instead, see Sidebar: Top-level navigation: `Sidebar`.
- Renders: IconButton
