# Sheet

> A side panel that slides in from the inline-end edge, for viewing or editing one record
> without leaving the list. Built on React Aria `Modal` and `Dialog`: focus is trapped and
> restored, the page is inert and does not scroll, and `Escape` closes only the top-most layer
> (a `Dialog` opened from a sheet closes first).

The header (title, mono meta, extra content, close button) is `--ds-topbar-h` tall; the body
scrolls; the footer stays at the bottom.

A side panel that slides in from the inline-end edge to view or edit one record without leaving the list. Built on React Aria `Modal` and `Dialog`. Generic: it lives in the core entry point.

- Handoff source: `components/erp/Sheet` (CMP-PAT-01).

- Import: `import { Sheet } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/Sheet/Sheet.tsx`
- Stories (Storybook title `Components/Sheet`): Default, Open, Medium, Large, CloseButton, LongContent, NotPadded, LongTitle, WithDescription, RightToLeft

## Props

| Prop                        | Type                                                          | Required | Default | Description                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                     | `ReactNode`                                                   | yes      |         | Heading of the sheet and its accessible name. One line; it is truncated with an ellipsis.                                                                           |
| `meta`                      | `ReactNode`                                                   |          |         | Short mono text after the title, such as a record code ("ORD-1048").                                                                                                |
| `headerExtra`               | `ReactNode`                                                   |          |         | Extra header content after the meta, usually a `Badge` with the status.                                                                                             |
| `description`               | `ReactNode`                                                   |          |         | Optional description linked to the sheet with `aria-describedby`.                                                                                                   |
| `children`                  | `ReactNode \| ((options: SheetRenderOptions) => ReactNode)`   |          |         | Body of the sheet; it scrolls when it is taller than the viewport. A function receives `close`.                                                                     |
| `footer`                    | `ReactNode \| ((options: SheetRenderOptions) => ReactNode)`   |          |         | Footer actions, aligned to the end: Cancel (secondary) then the primary action. A function receives `close`. The footer stays at the bottom while the body scrolls. |
| `footerStart`               | `ReactNode \| ((options: SheetRenderOptions) => ReactNode)`   |          |         | Footer content aligned to the start, for the destructive action ("Delete order").                                                                                   |
| `size`                      | `'sm' \| 'md' \| 'lg'`                                        |          | `'sm'`  | Width: `sm` 440px (default), `md` 460px, `lg` 480px. Full width on small screens.                                                                                   |
| `padded`                    | `boolean`                                                     |          | `true`  | Pads the body (24px, 18px between children). Turn off for a table or a full-bleed list. Default `true`.                                                             |
| `trigger`                   | `ReactElement<unknown, string \| JSXElementConstructor<any>>` |          |         | The element that opens the sheet. Optional: omit it and control the sheet with `isOpen`.                                                                            |
| `isOpen`                    | `boolean`                                                     |          |         | Controlled open state. Pair with `onOpenChange`.                                                                                                                    |
| `defaultOpen`               | `boolean`                                                     |          |         | Initial open state when uncontrolled.                                                                                                                               |
| `onOpenChange`              | `(isOpen: boolean) => void`                                   |          |         | Called when the sheet opens or closes.                                                                                                                              |
| `isDismissable`             | `boolean`                                                     |          | `true`  | Whether pressing the scrim closes the sheet. Default `true`.                                                                                                        |
| `isKeyboardDismissDisabled` | `boolean`                                                     |          |         | Disables closing with `Escape`. Use it only while a request is running.                                                                                             |
| `messages`                  | `Partial<{ close: string; }>`                                 |          |         | Per-instance overrides of the built-in messages.                                                                                                                    |
| `className`                 | `string`                                                      |          |         | Class name for the sheet panel.                                                                                                                                     |
| `ref`                       | `Ref<HTMLElement>`                                            |          |         | Ref to the sheet panel.                                                                                                                                             |

## Variants, sizes and tones

- `size`: `sm`, `md`, `lg`

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ Sheet: { ... } }}>`.

| Key     | English default | Notes                                         |
| ------- | --------------- | --------------------------------------------- |
| `close` | `Close panel`   | Name of the close button in the Sheet header. |

## Design tokens used

`--ds-duration`, `--ds-ease`, `--ds-font-mono`, `--ds-font-sans`, `--ds-fs-heading`, `--ds-fs-label`, `--ds-fs-small`, `--ds-lh-heading`, `--ds-lh-label`, `--ds-lh-small`, `--ds-line-strong`, `--ds-line-subtle`, `--ds-scrim`, `--ds-shadow-dialog`, `--ds-sheet-from`, `--ds-sheet-padding`, `--ds-sheet-width`, `--ds-sheet-width-lg`, `--ds-sheet-width-md`, `--ds-sheet-width-sm`, `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-surface`, `--ds-text`, `--ds-text-2`, `--ds-topbar-h`, `--ds-weight-semibold`

## When to use

- A record's details or edit form next to the list it came from.
- Filters or settings with a footer of actions.

## When not to use

- A short confirmation or a small form: use `Dialog`.
- A hint or a few controls on a trigger: use `Popover`.
- Page-level navigation: use `Sidebar`.

## Anatomy

```
DialogTrigger
  trigger
  ModalOverlay       --ds-scrim, z sheet
    Modal            surface, strong line at the start edge, dialog shadow, width sm | md | lg
      Dialog         role=dialog, aria-labelledby = title
        header       --ds-topbar-h tall: title (ellipsis) · meta (mono) · headerExtra · close IconButton
        body         scrolls; padded (24px) or not
        footer       sticky: footerStart (destructive) ... footer (Cancel + primary)
```

## Accessibility

- Same overlay contract as `Dialog`: focus trapped and restored, `inert` page, scroll lock, `Escape` closes only the top layer (a `Dialog` opened inside the sheet closes first; tested in `Dialog.test.tsx`).
- Named by the title through `aria-labelledby`, so a non-string title works (the handoff only labeled string titles).
- The close button is an `IconButton` named from messages. The handoff set `title="Close (Esc)"`.
- Slide-in is a 150 ms transform and the scrim fades; both are removed under `prefers-reduced-motion`. The slide direction follows the writing direction (`:dir(rtl)`).
- The panel is `Modal` content inside the overlay, so it stacks above the scrim without a second z-index.
- See the Dialog doc ("Layers") for popovers opened from inside the sheet.
- **Exit animation.** The sheet stays mounted for the 150 ms slide-out. It keeps rendering the props of its last open render during that time, so you can clear the state that feeds it (`setRecord(null)`) in the same update that closes it and the panel will not animate out empty (no blank fields or title). Reopening shows the new content at once. Under `prefers-reduced-motion` there is no animation, so it leaves the DOM immediately (tested). If the tab is hidden the browser does not run animations and React Aria unmounts the sheet only once the tab is visible again.

Controlled use without a `trigger` renders the overlay directly, without a `DialogTrigger`, so opening the sheet logs nothing to the console (GAP-022). Focus still returns to the element focused before it opened.

## Content rules

- Title: the record type or name, sentence case. Meta: its code, as data.
- Footer: destructive action at the start ("Delete order"); Cancel then the primary action at the end ("Save order"). Deleting still goes through a `ConfirmDialog`.

## Examples

```tsx
<Sheet
  trigger={<Button>View order</Button>}
  title="Order"
  meta="ORD-1048"
  headerExtra={<Badge tone="success">Shipped</Badge>}
  footerStart={<Button variant="danger">Delete order</Button>}
  footer={({ close }) => (
    <>
      <Button onPress={close}>Cancel</Button>
      <Button variant="primary" onPress={save}>
        Save order
      </Button>
    </>
  )}
>
  <Input label="Customer" />
</Sheet>
```

## Related components

- Instead, see Dialog: A short confirmation or a small form: use `Dialog`.
- Instead, see Popover: A hint or a few controls on a trigger: use `Popover`.
- Instead, see Sidebar: Page-level navigation: use `Sidebar`.
- Renders: IconButton
