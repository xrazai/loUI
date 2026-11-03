# Sheet

Status: experimental

A side panel that slides in from the inline-end edge to view or edit one record without leaving the list. Built on React Aria `Modal` and `Dialog`. Generic: it lives in the core entry point.

- Handoff source: `components/erp/Sheet` (CMP-PAT-01).

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

## Props

| Prop                                      | Type                                    | Default | Notes                                                                     |
| ----------------------------------------- | --------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `title`                                   | `ReactNode` (required)                  | none    | Heading and accessible name (not limited to strings, unlike the handoff). |
| `meta`                                    | `ReactNode`                             |         | Mono text after the title ("ORD-1048").                                   |
| `headerExtra`                             | `ReactNode`                             |         | Usually a `Badge`.                                                        |
| `description`                             | `ReactNode`                             |         | Linked with `aria-describedby`.                                           |
| `children`                                | `ReactNode \| ({ close }) => ReactNode` |         | Body.                                                                     |
| `footer` / `footerStart`                  | `ReactNode \| ({ close }) => ReactNode` |         | End / start aligned actions.                                              |
| `size`                                    | `'sm' \| 'md' \| 'lg'`                  | `sm`    | 440 / 460 / 480 px (`--ds-sheet-width-*`); full width on small screens.   |
| `padded`                                  | `boolean`                               | `true`  | `false` for a table or list that bleeds to the edges.                     |
| `trigger`                                 | `ReactElement`                          |         | Optional when controlled.                                                 |
| `isOpen` / `defaultOpen` / `onOpenChange` |                                         |         | Controlled / uncontrolled open state.                                     |
| `isDismissable`                           | `boolean`                               | `true`  | Press on the scrim closes it.                                             |
| `isKeyboardDismissDisabled`               | `boolean`                               | `false` |                                                                           |
| `messages`                                | `{ close }`                             |         | "Close panel" (pt-BR "Fechar painel").                                    |

## Accessibility

- Same overlay contract as `Dialog`: focus trapped and restored, `inert` page, scroll lock, `Escape` closes only the top layer (a `Dialog` opened inside the sheet closes first; tested in `Dialog.test.tsx`).
- Named by the title through `aria-labelledby`, so a non-string title works (the handoff only labeled string titles).
- The close button is an `IconButton` named from messages. The handoff set `title="Close (Esc)"`.
- Slide-in is a 150 ms transform and the scrim fades; both are removed under `prefers-reduced-motion`. The slide direction follows the writing direction (`:dir(rtl)`).
- The panel is `Modal` content inside the overlay, so it stacks above the scrim without a second z-index.
- See the Dialog doc ("Layers") for popovers opened from inside the sheet.
- **Exit animation.** The sheet stays mounted for the 150 ms slide-out. It keeps rendering the props of its last open render during that time, so you can clear the state that feeds it (`setRecord(null)`) in the same update that closes it and the panel will not animate out empty (no blank fields or title). Reopening shows the new content at once. Under `prefers-reduced-motion` there is no animation, so it leaves the DOM immediately (tested). If the tab is hidden the browser does not run animations and React Aria unmounts the sheet only once the tab is visible again.

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

## Differences from the handoff

- Built on React Aria `Modal`: focus trap/restore, `inert`, scroll lock, stack-aware `Escape` (the handoff added a window listener per sheet).
- `width` (440 / 460 / 480 ERP-specific values) became `size` (`sm` / `md` / `lg`) with component tokens; header height is `--ds-topbar-h`; layers come from `--ds-z-sheet`.
- `contained` mode is not ported. `onClose` is replaced by `onOpenChange`.
- The scrim is `--ds-scrim`, no blur; the panel is `--ds-surface` with the dialog shadow.
- New: `description`, `footerStart`, controlled state, close label from messages, RTL slide.
