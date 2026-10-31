import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Code } from './Code';

const longLine =
  'const value = computeSomethingVeryLongThatDoesNotFitInTheBox(argumentOne, argumentTwo);';

describe('Code', () => {
  it('renders an inline code element in the mono face', async () => {
    const screen = await renderWithProvider(
      <p>
        Run <Code data-testid="code">pnpm test</Code> now.
      </p>,
    );
    const element = screen.getByTestId('code').element();
    expect(element.tagName).toBe('CODE');
    expect(getComputedStyle(element).fontFamily).toContain('Geist Mono');
    expect(element.closest('pre')).toBeNull();
  });

  it('renders a block as pre > code and keeps whitespace', async () => {
    const screen = await renderWithProvider(
      <Code variant="block" data-testid="code">
        {'line one\n  line two'}
      </Code>,
    );
    const element = screen.getByTestId('code').element();
    expect(element.tagName).toBe('CODE');
    expect(element.parentElement?.tagName).toBe('PRE');
    expect(getComputedStyle(element).whiteSpace).toBe('pre');
  });

  it('a block that overflows becomes a labelled, focusable region that scrolls sideways', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 200 }}>
        <Code variant="block">{longLine}</Code>
      </div>,
    );
    const region = screen.getByRole('region', { name: 'Code' });
    await expect.element(region).toHaveAttribute('tabindex', '0');
    await userEvent.tab();
    expect(document.activeElement).toBe(region.element());
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => region.element().scrollLeft).toBeGreaterThan(0);
  });

  it('a block that fits is a plain pre with no tab stop', async () => {
    const screen = await renderWithProvider(
      <Code variant="block" data-testid="code">
        short
      </Code>,
    );
    const pre = screen.getByTestId('code').element().parentElement;
    await expect.poll(() => pre?.getAttribute('tabindex')).toBeNull();
    expect(pre?.getAttribute('role')).toBeNull();
  });

  it('names the region with aria-label, the pt-BR catalog or a message override', async () => {
    const narrow = (extra: object) => (
      <div style={{ inlineSize: 200 }}>
        <Code variant="block" {...extra}>
          {longLine}
        </Code>
      </div>
    );
    const named = await renderWithProvider(narrow({ 'aria-label': 'Request body' }));
    await expect.element(named.getByRole('region', { name: 'Request body' })).toBeInTheDocument();
    await named.unmount();

    const portuguese = await renderWithProvider(narrow({}), { locale: 'pt-BR' });
    await expect.element(portuguese.getByRole('region', { name: 'Código' })).toBeInTheDocument();
    await portuguese.unmount();

    const provider = await renderWithProvider(narrow({}), {
      messages: { Code: { blockLabel: 'Snippet' } },
    });
    await expect.element(provider.getByRole('region', { name: 'Snippet' })).toBeInTheDocument();
    await provider.unmount();

    const instance = await renderWithProvider(narrow({ messages: { blockLabel: 'Sample' } }));
    await expect.element(instance.getByRole('region', { name: 'Sample' })).toBeInTheDocument();
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(
      <Code ref={ref} className="extra" id="c">
        x
      </Code>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('c');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <p>
          Use <Code>pnpm check</Code> before pushing.
        </p>
        <div style={{ inlineSize: 200 }}>
          <Code variant="block">{longLine}</Code>
        </div>
        <Code variant="block">short</Code>
      </main>,
    );
    await expect.element(screen.getByRole('region', { name: 'Code' })).toBeInTheDocument();
    await expectNoA11yViolations(screen.container);
  });
});
