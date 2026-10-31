import { renderToString } from 'react-dom/server';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProvider } from '../test/render';
import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function Width() {
  const wide = useMediaQuery('(min-width: 700px)');
  return <output>{wide ? 'wide' : 'narrow'}</output>;
}

function Motion() {
  const reduced = usePrefersReducedMotion();
  return <output>{reduced ? 'reduced' : 'full'}</output>;
}

/** A controllable stand-in for a MediaQueryList. */
function fakeMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const spy = vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        media: query,
        get matches() {
          return matches;
        },
        addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      }) as unknown as MediaQueryList,
  );
  return {
    spy,
    listeners,
    set(next: boolean) {
      matches = next;
      for (const listener of [...listeners]) listener();
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('reflects the viewport and updates when it changes', async () => {
    await page.viewport(500, 600);
    const screen = await renderWithProvider(<Width />);
    await expect.element(screen.getByText('narrow')).toBeInTheDocument();
    await page.viewport(900, 600);
    await expect.element(screen.getByText('wide')).toBeInTheDocument();
    await page.viewport(500, 600);
    await expect.element(screen.getByText('narrow')).toBeInTheDocument();
  });

  it('renders the default value on the server', () => {
    expect(renderToString(<Width />)).toContain('narrow');
    function Defaulted() {
      return <output>{useMediaQuery('(min-width: 700px)', true) ? 'wide' : 'narrow'}</output>;
    }
    expect(renderToString(<Defaulted />)).toContain('wide');
  });

  it('unsubscribes on unmount', async () => {
    const media = fakeMatchMedia(false);
    const screen = await renderWithProvider(<Width />);
    expect(media.listeners.size).toBe(1);
    await screen.unmount();
    expect(media.listeners.size).toBe(0);
  });
});

describe('usePrefersReducedMotion', () => {
  it('is false by default and follows the OS preference', async () => {
    const media = fakeMatchMedia(false);
    const screen = await renderWithProvider(<Motion />);
    await expect.element(screen.getByText('full')).toBeInTheDocument();
    expect(media.spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    media.set(true);
    await expect.element(screen.getByText('reduced')).toBeInTheDocument();
    media.set(false);
    await expect.element(screen.getByText('full')).toBeInTheDocument();
  });

  it('starts reduced when the OS already asks for it', async () => {
    fakeMatchMedia(true);
    const screen = await renderWithProvider(<Motion />);
    await expect.element(screen.getByText('reduced')).toBeInTheDocument();
  });
});
