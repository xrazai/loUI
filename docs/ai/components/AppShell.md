# AppShell

> The application layout: a sidebar, and a main column with a top bar above a scrollable
> content region. The sidebar and the content scroll independently; the page itself does not.

Landmarks: the sidebar (`aside`, from `Sidebar`), the top bar (`header`), one `main`
(`id="main"`), and the optional detail `aside`. A skip link to `main` comes first.

Responsive contract (TOK-010): the shell measures its own width (a container query, so it
also works inside a frame). From `--ds-breakpoint-md` (768px) up the sidebar sits in the flow.
Below it the sidebar leaves the flow and opens as an off-canvas panel over the content,
controlled by `isNavOpen` and `AppShellNavToggle`; while it is open the rest of the page is
inert, `Escape` and the scrim close it, and focus returns to the toggle. The shell works from
320px. It fills its parent: give the parent a height, or it takes the viewport height.

The application layout: a sidebar, and a main column with a top bar above a scrollable content region. It includes the skip link and the landmarks.

- Import: `import { AppShell } from 'loui-ds';`
- Status: experimental (do not use in recipes until stable)
- Source: `src/components/AppShell/AppShell.tsx`
- Stories (Storybook title `Layout/AppShell`): Default, WithDetail, WithoutSidebar, Unpadded, LongContent, NarrowClosed, NarrowOpen, Narrow320, RightToLeft

## Props

| Prop              | Type                                                                | Required | Default | Description                                                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sidebar`         | `ReactNode`                                                         |          |         | The app sidebar: a `Sidebar` element. Below the md breakpoint it becomes an off-canvas panel.                                                                                                                                        |
| `topBar`          | `ReactNode`                                                         |          |         | The page header: a `TopBar` element. Put an `AppShellNavToggle` in its `children` so narrow screens can open the sidebar.                                                                                                            |
| `children`        | `ReactNode`                                                         |          |         | The page content. It is rendered inside the one `main` landmark.                                                                                                                                                                     |
| `detail`          | `ReactNode`                                                         |          |         | Optional detail pane at the inline end, `--ds-app-shell-detail-w` (360px) wide, for the record selected in the main content. It is an `aside` landmark with its own scroll. Below the md breakpoint it moves under the main content. |
| `detailLabel`     | `string`                                                            |          |         | Accessible name of the detail aside. Default "Details" from the message catalog.                                                                                                                                                     |
| `mainId`          | `string`                                                            |          | `main`  | `id` of the `main` element, and the target of the skip link. Default `main`.                                                                                                                                                         |
| `padded`          | `boolean`                                                           |          | `true`  | Pads the main content with `--ds-app-shell-main-padding`. Turn it off when the content brings its own padding (a `Container` has a gutter). Default `true`.                                                                          |
| `skipLink`        | `boolean`                                                           |          | `true`  | Renders the skip link as the first focusable element. Default `true`; turn it off only if the app has its own.                                                                                                                       |
| `isNavOpen`       | `boolean`                                                           |          |         | Controlled state of the off-canvas sidebar (narrow screens only). Pair with `onNavOpenChange`.                                                                                                                                       |
| `defaultNavOpen`  | `boolean`                                                           |          | `false` | Initial state of the off-canvas sidebar when uncontrolled. Default `false`.                                                                                                                                                          |
| `onNavOpenChange` | `(isOpen: boolean) => void`                                         |          |         | Called when the off-canvas sidebar opens or closes (toggle, `Escape`, scrim, close button).                                                                                                                                          |
| `messages`        | `Partial<{ navToggle: string; navClose: string; detail: string; }>` |          |         | Per-instance overrides of the built-in messages.                                                                                                                                                                                     |

### Inherited props

- Standard DOM attributes, ARIA attributes and event handlers; other attributes and `ref` go to the root element.

## Messages (i18n)

Locales shipped: en, pt-BR. Override per instance with the `messages` prop or globally with `<DSProvider messages={{ AppShell: { ... } }}>`.

| Key         | English default | Notes                                                                  |
| ----------- | --------------- | ---------------------------------------------------------------------- |
| `navToggle` | `Menu`          | Text of the button that opens the navigation panel on narrow screens.  |
| `navClose`  | `Close menu`    | Text of the button that closes the navigation panel on narrow screens. |
| `detail`    | `Details`       | Accessible name of the detail aside landmark.                          |

## Design tokens used

`--ds-accent`, `--ds-app-shell-detail-w`, `--ds-app-shell-main-padding`, `--ds-app-shell-nav-z-index`, `--ds-bg`, `--ds-duration`, `--ds-ease`, `--ds-font-sans`, `--ds-line-control`, `--ds-line-subtle`, `--ds-scrim`, `--ds-shadow-dialog`, `--ds-space-1`, `--ds-space-12`, `--ds-space-2`, `--ds-space-3`, `--ds-text`, `--ds-toast-clearance`

## When to use

- The frame of every screen of an app: `Sidebar` + `TopBar` + content (+ optional detail pane).

## When not to use

- A marketing page or a single-column document: use `Container` and let the page scroll.
- Inside another AppShell.

## Anatomy

```
div.root  (container, fills the parent, no page scroll)
  SkipLink                       first focusable element
  div.nav                        wraps the Sidebar (aside); off-canvas below md
  div.scrim                      only when the panel is open
  div.column
    TopBar                       header
    div.body
      main#main                  scrolls on its own
      aside "Details"            optional, 360px, scrolls on its own
```

## Responsive decision (TOK-010)

**The DS guarantees every component works from 320px wide, and AppShell collapses its sidebar into an off-canvas panel below `--ds-breakpoint-md` (768px).**

Why built in rather than left to apps: a sidebar hidden by an app without a way back strands keyboard and touch users, and every product would build the same panel. It is kept simple: it reuses the same `Sidebar` element (no second copy, no lost state) and CSS does the layout.

- The shell measures **its own width** with a container query, so it behaves the same in a frame, a preview or a test. The 768px in the CSS is `--ds-breakpoint-md`; CSS cannot read variables inside a query, so `AppShell.test.tsx` asserts the two agree at 767/768px.
- From md up the sidebar sits in the flow. Below, it leaves the flow; `AppShellNavToggle` (visible only below md) opens it as a panel over a scrim.
- While open: focus moves into the panel, the rest of the page is `inert`, `Escape`, the scrim or the "Close menu" button close it, and focus returns to the toggle. It is not a `Dialog`: it keeps the sidebar's own landmarks.
- The detail pane moves **under** the main content (half the height at most, own scroll) below md.
- Breakpoint tokens: `--ds-breakpoint-sm|md|lg|xl` (480 / 768 / 1024 / 1280 px); content: `--ds-content-max`, `--ds-content-gutter`; `--ds-container-sm|md|lg`.

## Accessibility

- Landmarks: `aside` (Sidebar, "Sidebar"), `header` (TopBar), **one** `main`, optional `aside` ("Details"). Each `nav` in the sidebar is named by its caption.
- The skip link is the first stop and moves focus to `main`.
- `main` and the detail aside scroll independently. While they overflow they become keyboard stops (`tabindex="0"`) so the arrow keys scroll them; with nothing to scroll there is no extra tab stop.
- The closed panel is `visibility: hidden` and `inert`, so it is out of the tab order and the accessibility tree.
- The panel slide respects `prefers-reduced-motion`; the layout mirrors in RTL.
- `AppShellNavToggle` reports `aria-expanded` and `aria-controls`. It is an `IconButton` (menu icon) named "Menu" (`pt-BR` "Menu"; pass a string child to rename it); the close button is an `IconButton` (x icon) named "Close menu" / "Fechar menu", which sits on the scrim beside the panel and never wraps.

## Content rules

- One `h1` per page: `TopBar` renders it from `title`.
- One primary action per screen, at the end of the top bar.

## Examples

```tsx
<AppShell
  sidebar={<Sidebar workspace={workspace} sections={sections} value={route} onChange={go} />}
  topBar={
    <TopBar title="Orders" actions={<Button variant="primary">New order</Button>}>
      <AppShellNavToggle />
    </TopBar>
  }
  detail={selected ? <OrderDetail order={selected} /> : undefined}
>
  <OrdersTable />
</AppShell>
```

## Related components

- Instead, see Container: A marketing page or a single-column document: use `Container` and let the page scroll.
- Renders: IconButton, SkipLink
