import type { ReactElement } from 'react';
import { render } from 'vitest-browser-react';

/**
 * Renders a component for browser-mode tests.
 * The design system provider (DSProvider) will wrap the tree here once it
 * exists (ADR-0005); until then this is a thin pass-through.
 */
export function renderWithProvider(ui: ReactElement) {
  return render(ui);
}
