# Bundle size

How much JavaScript Loui DS adds to an app, where the rest comes from, and what to do about it.

## What a typical app ships

Measured on `examples/vite-app` (Vite 8, production build): an `AppShell` with `Sidebar`, `TopBar`, a `DataTable` with pagination, a `Dialog` with an `Input`, and toasts.

| Share of the bundle                                      | Before minification | Notes                                                                                                    |
| -------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| `react-dom` + `react` + `scheduler`                      | ~550 kB             | Fixed cost of React 19.                                                                                  |
| `react-aria` + `react-aria-components` + `react-stately` | ~620 kB             | Behavior layer (ADR-0001): focus, keyboard, overlays, i18n. Includes translated strings for 30+ locales. |
| `@loui/ds` (components, i18n, utilities)                 | ~90 kB              | Only the components the app imports; the package is tree-shakable (`sideEffects` lists CSS only).        |
| `lucide-react`                                           | ~10 kB              | Only the curated icons that are used.                                                                    |

Minified output: **531 kB (163 kB gzip)** without optimization, **489 kB (150 kB gzip)** with the locale plugin below. The design system's own code is under a fifth of the total; the rest is React and React Aria, which every app built on this system needs anyway.

## 1. Strip unused React Aria locales (recommended)

React Aria bundles its built-in strings (for example "Next month", "Dismiss") for every locale it supports. `@react-aria/optimize-locales-plugin` keeps only the locales your app serves. Use the same list you pass to `DSProvider`.

Vite:

```ts
// vite.config.ts
import optimizeLocales from '@react-aria/optimize-locales-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{ ...optimizeLocales.vite({ locales: ['en-US', 'pt-BR'] }), enforce: 'pre' }, react()],
});
```

Next.js (webpack):

```ts
// next.config.ts
import optimizeLocales from '@react-aria/optimize-locales-plugin';
import type { NextConfig } from 'next';

const config: NextConfig = {
  webpack(webpackConfig) {
    webpackConfig.plugins.push(optimizeLocales.webpack({ locales: ['en-US', 'pt-BR'] }));
    return webpackConfig;
  },
};

export default config;
```

Saving in the example: 42 kB minified (14 kB gzip). A locale that is stripped falls back to English strings inside React Aria; Loui DS's own messages are unaffected (they come from its catalogs).

## 2. Import from the package root

Always `import { Button } from '@loui/ds'`. Bundlers drop what you do not use. Do not import from `@loui/ds/dist/...` paths: they are not part of the public API and can duplicate modules.

## 3. Split heavy screens, not components

Lazy-load whole routes or rarely opened surfaces with `React.lazy` and `Suspense`, for example a settings page, a report with charts, or the command palette's command list. Splitting individual small components costs more in requests than it saves.

```tsx
const Reports = lazy(() => import('./routes/Reports'));
```

Keep `DSProvider`, `AppShell` and the toast region in the main chunk: they are on every screen.

## 4. Check before you ship

- `vite build` prints the size of each chunk; add `rollup-plugin-visualizer` (or Next's `@next/bundle-analyzer`) when a chunk grows unexpectedly.
- The design system itself is guarded by `size-limit` in its CI (`pnpm size`), so its own growth is reviewed per change.
