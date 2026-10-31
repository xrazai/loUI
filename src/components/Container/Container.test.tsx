import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Container } from './Container';

describe('Container', () => {
  it('limits the inline size to the content maximum and centers itself', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 1600 }}>
        <Container data-testid="container">Content</Container>
      </div>,
    );
    const element = screen.getByTestId('container').element();
    expect(element.getBoundingClientRect().width).toBe(1200);
    expect(element.getBoundingClientRect().left).toBeGreaterThan(0);
  });

  it.each([
    ['sm', 640],
    ['md', 960],
    ['lg', 1200],
  ] as const)('size %s is %ipx wide', async (size, px) => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 1600 }}>
        <Container data-testid="container" size={size}>
          Content
        </Container>
      </div>,
    );
    expect(screen.getByTestId('container').element().getBoundingClientRect().width).toBe(px);
  });

  it('size full has no maximum', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 1600 }}>
        <Container data-testid="container" size="full">
          Content
        </Container>
      </div>,
    );
    expect(screen.getByTestId('container').element().getBoundingClientRect().width).toBe(1600);
  });

  it('adds the 24px gutter, and removes it with gutter={false}', async () => {
    const screen = await renderWithProvider(
      <>
        <Container data-testid="gutter">Content</Container>
        <Container data-testid="flush" gutter={false}>
          Content
        </Container>
      </>,
    );
    expect(getComputedStyle(screen.getByTestId('gutter').element()).paddingInlineStart).toBe(
      '24px',
    );
    expect(getComputedStyle(screen.getByTestId('flush').element()).paddingInlineStart).toBe('0px');
  });

  it('shrinks with a narrow parent instead of overflowing', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 320 }}>
        <Container data-testid="container">Content</Container>
      </div>,
    );
    expect(screen.getByTestId('container').element().getBoundingClientRect().width).toBe(320);
  });

  it('renders the element given by as and merges className, rest props and ref', async () => {
    const ref = createRef<HTMLDivElement>();
    const screen = await renderWithProvider(
      <Container as="section" ref={ref} className="extra" id="c1" aria-label="Orders">
        Content
      </Container>,
    );
    expect(ref.current?.tagName).toBe('SECTION');
    expect(ref.current?.classList.contains('extra')).toBe(true);
    await expect.element(screen.getByRole('region', { name: 'Orders' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Container size="md">
          <h1>Page</h1>
        </Container>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
