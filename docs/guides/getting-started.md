# Getting started

## Requirements

- React 19 and React DOM 19 (peer dependencies). React 18 is not supported.
- An evergreen browser. Node 24 or later for tooling.
- A bundler that handles CSS imports and `woff2` assets (Vite, Next.js, webpack, esbuild).

## Install

`@loui/ds` is private and unlicensed for now (ADR-0004). Install it from your private registry or workspace:

```sh
pnpm add @loui/ds react react-dom
```

`react-aria-components`, `react-stately` and `lucide-react` are regular dependencies of the package; you do not install them yourself.

## 1. Load the stylesheet once

Import the stylesheet once, at the root of your app, before any component renders:

```tsx
import '@loui/ds/styles.css';
```

It contains, in this layer order, `reset`, `tokens`, `base`, `components` and `utilities`. Because everything sits in named cascade layers, your own unlayered CSS always wins over the design system without specificity tricks.

The stylesheet sets the dark theme on the page (`bg-canvas` on `html`, `bg` and `text` on `body`, the Geist font), so you normally do not need your own reset.

## 2. Wrap the app in `DSProvider`

```tsx
import { DSProvider } from '@loui/ds';

export function Root({ children }: { children: React.ReactNode }) {
  return <DSProvider locale="en-US">{children}</DSProvider>;
}
```

| Prop       | Purpose                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `locale`   | BCP 47 tag. Drives messages, number and date formatting, sorting, and the direction (RTL) of React Aria widgets. |
| `messages` | Overrides keyed by component, e.g. `{ Alert: { dismiss: 'Close' } }`. Applied over the built-in catalogs.        |
| `navigate` | Client-side navigation for `Link` and link-like components (your router's `navigate`).                           |
| `useHref`  | Maps a router path to a real `href` (needed for basename routing).                                               |

Without a provider everything still works in `en-US`; it just does not follow the user's locale. English is the default and `pt-BR` ships with the library. See `docs/architecture/i18n.md` for how messages resolve.

Client-side routing, for example with React Router:

```tsx
import { useNavigate, useHref } from 'react-router';

function Providers({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <DSProvider navigate={navigate} useHref={useHref}>
      {children}
    </DSProvider>
  );
}
```

## 3. Use components

```tsx
import { Alert, Button } from '@loui/ds';

export function Example() {
  return (
    <>
      <Alert tone="warning" title="Low stock">
        3 rolls of linen are left. Reorder to avoid delays.
      </Alert>
      <Button variant="primary" onPress={() => console.log('created')}>
        Create order
      </Button>
    </>
  );
}
```

Use `onPress`, not `onClick`: it is the React Aria press event and works for mouse, touch, keyboard and screen readers.

## Fonts

Geist (UI) and Geist Mono (data) are self-hosted and ship inside the package: `styles.css` references `./fonts/*.woff2` relative to itself, and the build copies them to `dist/fonts`. Nothing is fetched from Google Fonts or a CDN at runtime. Your bundler resolves the font files when it processes `@loui/ds/styles.css`; there is nothing to configure. Both families load with `font-display: swap` and a metric-matched fallback so the layout does not shift.

## Theming

Dark is the only theme. The semantic token layer (`--ds-bg`, `--ds-surface`, `--ds-text`, ...) can be overridden in your own CSS if you must; component code only reads semantic tokens. A `[data-theme="paper"]` scope provides the light surface for receipt and PDF previews. Forced-colors and reduced-motion modes are handled by the components.

## Server-side rendering

- Components never touch `window` or `document` while rendering or at import time, so they render on the server.
- IDs come from React `useId`; React Aria needs no `SSRProvider` with React 19.
- `useMediaQuery` returns its `defaultValue` (`false`) on the server and corrects after hydration. Prefer CSS media queries for styling.
- Import `@loui/ds/styles.css` in the root layout so the first paint is already styled.

## Framework notes

**Vite.** Import the stylesheet in `main.tsx`; nothing else is needed.

**Next.js (App Router).** Import the stylesheet in `app/layout.tsx` and render `DSProvider` in a small client component, because it takes functions as props. The package does not yet ship `'use client'` directives, so import interactive components from client components (a file with `'use client'`). This is tracked under REL-001 and not yet verified in a Next.js fixture.

## Next steps

- Read the [Principles](./principles.md) and the [Content guidelines](./content-guidelines.md) before building a screen.
- Browse the components in Storybook; each page lists props, variants, states and accessibility notes.
- Agents: start from [Using with AI](./using-with-ai.md).
