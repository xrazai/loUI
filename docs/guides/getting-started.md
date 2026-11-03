# Getting started

Browse every component live in Storybook: <https://xrazai.github.io/loUI/>. AI tools can load <https://xrazai.github.io/loUI/llms.txt> (see [Using with AI](./using-with-ai.md)).

## Requirements

- React 19 and React DOM 19 (peer dependencies). React 18 is not supported.
- An evergreen browser. Node 24 or later for tooling.
- A bundler that handles CSS imports and `woff2` assets (Vite, Next.js, webpack, esbuild).

## Install

Each version is a [GitHub Release](https://github.com/xrazai/loUI/releases) with the package attached (it is not on npm: ADR-0004). Install the version you want by its URL:

```sh
pnpm add https://github.com/xrazai/loUI/releases/download/v0.1.0/loui-ds-0.1.0.tgz react react-dom
```

To upgrade, install the URL of the newer release (read its notes first: before 1.0 a minor version may break). npm and yarn accept the same URL.

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
        3 boxes of notebooks are left. Reorder to avoid delays.
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

**Next.js (App Router).** See [SSR and Next.js](#ssr-and-nextjs) below.

## SSR and Next.js

The package ships a `"use client"` directive **per module**: every file that uses hooks, React context or React Aria has it, and the entry points (`index.js`) and pure helpers do not. So a React Server Component (the default in the Next.js App Router) can import the design system directly, with no wrapper file:

```tsx
// app/layout.tsx (Server Component)
import '@loui/ds/styles.css';
import { DSProvider, ToastRegion } from '@loui/ds';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DSProvider locale="en-US">
          {children}
          <ToastRegion />
        </DSProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx (Server Component): components are client references and render on the server too
import { Button, DataTable } from '@loui/ds';
```

Rules that follow from the React Server Components model, not from the library:

- Props that cross from a Server to a Client Component must be serializable. **Functions cannot**: `onPress`, `onChange`, render props such as `DataTable` column `render` or `Dialog` `footer={({ close }) => ...}`, and component values such as an `icon` prop. Put those in a file that starts with `'use client'` (a small component per interaction, see `examples/next-app/app/CreateOrderButton.tsx`).
- `DSProvider` takes plain props (`locale`, `messages`) and works in a Server layout; `navigate` and `useHref` are functions, so wrap the provider in a client component when you use client-side routing.
- Hooks (`useHotkeys`, `useToast`, ...) and the `toast` API only work in Client Components.
- Import the stylesheet once in the root layout. `dist/styles.css` and the Geist fonts need no `transpilePackages` or other `next.config` settings.

`sideEffects` in `package.json` lists only `**/*.css`, so bundlers drop unused components (importing `Button` alone costs about 12 kB brotli, enforced by `pnpm size` and `pnpm test:treeshake`). The packaging is verified on every pull request by building `examples/vite-app` and `examples/next-app` (Next.js 16, App Router, Turbopack) against a packed tarball: `pnpm examples:verify`.

## Next steps

- Read the [Principles](./principles.md) and the [Content guidelines](./content-guidelines.md) before building a screen.
- Browse the components in Storybook; each page lists props, variants, states and accessibility notes.
- Agents: start from [Using with AI](./using-with-ai.md).
