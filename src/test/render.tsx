import type { ReactElement, ReactNode } from 'react';
import { render } from 'vitest-browser-react';
import { DSProvider } from '../providers/DSProvider';
import type { DSProviderProps } from '../providers/DSProvider';

export interface RenderWithProviderOptions {
  locale?: DSProviderProps['locale'];
  messages?: DSProviderProps['messages'];
}

/**
 * Renders a component for browser-mode tests, wrapped in `DSProvider` (ADR-0005).
 * The wrapper is kept across `rerender`.
 */
export function renderWithProvider(
  ui: ReactElement,
  { locale, messages }: RenderWithProviderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <DSProvider locale={locale} messages={messages}>
        {children}
      </DSProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}
