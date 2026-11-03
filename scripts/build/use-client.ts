import type { Plugin } from 'rolldown';

/**
 * Adds a `'use client'` directive to every emitted module that needs the client runtime
 * (ARCH-010). The library is built unbundled (one output file per source module), so the
 * directive is per file: components and hooks are client modules, while the barrel
 * (`index.js`) and pure helpers stay directive-free. A React Server Component can then
 * `import { Button } from 'loui-ds'` and gets a client reference; no consumer wrapper is needed.
 *
 * A module needs the directive when its emitted code imports React Aria / React Stately, uses a
 * React API that does not exist in the server build of React (hooks, context, `memo`...), or
 * touches browser globals at call time.
 */
const CLIENT_IMPORT =
  /from\s+["'](?:react-aria-components|react-aria|react-stately|@react-aria\/[^"']+|@react-stately\/[^"']+)["']/;
const HOOK_CALL = /(?<![\w.$])use[A-Z]\w*\s*\(/;
const REACT_IMPORT = /import\s*\{([^}]*)\}\s*from\s+["']react["']/g;
const CLIENT_ONLY_REACT_API =
  /^(use[A-Z]\w*|createContext|memo|forwardRef|lazy|startTransition|Component|PureComponent)$/;

export function needsUseClient(code: string): boolean {
  if (/^\s*["']use client["']/.test(code)) return false;
  if (CLIENT_IMPORT.test(code)) return true;
  // Any hook call (React's or our own, e.g. `useMessages`) must run on the client.
  if (HOOK_CALL.test(code)) return true;
  for (const match of code.matchAll(REACT_IMPORT)) {
    const names = (match[1] ?? '').split(',').map((n) => n.trim().split(/\s+as\s+/)[0] ?? '');
    if (names.some((n) => CLIENT_ONLY_REACT_API.test(n))) return true;
  }
  return false;
}

export function clientDirectivePlugin(): Plugin {
  return {
    name: 'loui:use-client',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js') || !needsUseClient(code)) return null;
      // Keep a leading comment line (e.g. `/* empty css */`) after the directive; a directive
      // must be the first statement, comments before it are allowed but we put it first anyway.
      return { code: `"use client";\n${code}`, map: null };
    },
  };
}
