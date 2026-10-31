import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders a span by default and keeps content in the accessibility tree', async () => {
    const screen = await renderWithProvider(
      <button type="button">
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>,
    );
    await expect.element(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    expect(screen.container.querySelector('span')).not.toBeNull();
  });

  it('renders the element given by `as`', async () => {
    const screen = await renderWithProvider(<VisuallyHidden as="h2">Section</VisuallyHidden>);
    await expect.element(screen.getByRole('heading', { name: 'Section' })).toBeInTheDocument();
  });

  it('merges className and accepts the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(
      <VisuallyHidden ref={ref} className="extra">
        Text
      </VisuallyHidden>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.classList.length).toBeGreaterThan(1);
  });

  it('collapses to a 1px box', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(<VisuallyHidden ref={ref}>Text</VisuallyHidden>);
    const rect = ref.current?.getBoundingClientRect();
    expect(rect?.width).toBe(1);
    expect(rect?.height).toBe(1);
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <button type="button">
          <span aria-hidden="true">x</span>
          <VisuallyHidden>Close dialog</VisuallyHidden>
        </button>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
