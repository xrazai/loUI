# AppShell

Status: experimental

The application layout: a sidebar, and a main column with a top bar above a scrollable content region. It includes the skip link and the landmarks.

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

## Props

| Prop                                             | Type                              | Default   | Notes                                                               |
| ------------------------------------------------ | --------------------------------- | --------- | ------------------------------------------------------------------- |
| `sidebar`                                        | `ReactNode`                       |           | A `Sidebar`                                                         |
| `topBar`                                         | `ReactNode`                       |           | A `TopBar`; put `<AppShellNavToggle />` in its `children`           |
| `children`                                       | `ReactNode`                       |           | The page, inside the one `main`                                     |
| `detail`, `detailLabel`                          | `ReactNode`, `string`             | "Details" | Optional aside at the inline end (`--ds-app-shell-detail-w`, 360px) |
| `mainId`                                         | `string`                          | `'main'`  | `id` of `main` and the skip link target                             |
| `padded`                                         | `boolean`                         | `true`    | Pads `main` (24px); turn off for content with its own padding       |
| `skipLink`                                       | `boolean`                         | `true`    |                                                                     |
| `isNavOpen`, `defaultNavOpen`, `onNavOpenChange` |                                   | `false`   | Off-canvas sidebar state (below md)                                 |
| `messages`                                       | `{ navToggle, navClose, detail }` |           | Per-instance overrides                                              |

The shell is `100dvh` tall (capped by its parent's height): give the parent a height to embed it.

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
- `AppShellNavToggle` reports `aria-expanded` and `aria-controls`. Its label is "Menu" (`pt-BR` "Menu"; the close button is "Close menu" / "Fechar menu").

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

## Differences from the handoff

- The handoff assumed a 1180px minimum width and a fixed 240px sidebar. The shell now works from 320px, and the sidebar width stays a token.
- The skip link, the single `main` and the independent scrolling were left to each screen; the shell provides them.
