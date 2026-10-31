import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { contrastRatio } from '../../utils/color';
import { cssColorToHex, tokenColor } from '../Field/field.testing';
import { StatusSteps } from './StatusSteps';
import type { StatusStepsProps } from './StatusSteps';

const steps = [
  { id: 'draft', label: 'Draft' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
];

function Example(props: Partial<StatusStepsProps>) {
  return (
    <>
      <button type="button">Before</button>
      <StatusSteps aria-label="Order status" steps={steps} current={1} {...props} />
      <button type="button">After</button>
    </>
  );
}

describe('StatusSteps', () => {
  describe('rendering and ARIA', () => {
    it('is a named ordered list with one item per step', async () => {
      const screen = await renderWithProvider(<Example />);
      const list = screen.getByRole('list', { name: 'Order status' });
      await expect.element(list).toBeVisible();
      expect(list.element().tagName).toBe('OL');
      expect(screen.getByRole('listitem').elements()).toHaveLength(4);
    });

    it('can be named by another element', async () => {
      const screen = await renderWithProvider(
        <>
          <span id="n">Progress</span>
          <StatusSteps aria-labelledby="n" steps={steps} current={0} />
        </>,
      );
      await expect.element(screen.getByRole('list', { name: 'Progress' })).toBeVisible();
    });

    it('states each step as text, not only by color or check', async () => {
      const screen = await renderWithProvider(<Example />);
      const items = screen.getByRole('listitem').elements();
      expect(
        items.map((item) => (item as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
      ).toEqual([
        'Draft Completed',
        '2 Packed Current',
        '3 Shipped Not started',
        '4 Delivered Not started',
      ]);
    });

    it('marks only the current step with aria-current="step"', async () => {
      await renderWithProvider(<Example />);
      const marked = document.querySelectorAll('[aria-current]');
      expect(marked).toHaveLength(1);
      expect(marked[0]?.getAttribute('aria-current')).toBe('step');
      expect(marked[0]?.textContent).toContain('Packed');
    });

    it('treats the current step as complete with complete', async () => {
      const screen = await renderWithProvider(<Example current={3} complete />);
      const last = screen.getByRole('listitem').last().element();
      expect(last.textContent).toContain('Completed');
      expect(last.getAttribute('data-state')).toBe('complete');
    });

    it('draws the markers and connectors as decoration (hidden from assistive technology)', async () => {
      const screen = await renderWithProvider(<Example />);
      const markers = screen.container.querySelectorAll('li > span > [aria-hidden="true"]');
      expect(markers).toHaveLength(4);
    });

    it('is not interactive without onSelect', async () => {
      const screen = await renderWithProvider(<Example />);
      expect(screen.getByRole('button', { name: /Packed/ }).elements()).toHaveLength(0);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLOListElement>();
      await renderWithProvider(
        <StatusSteps
          ref={ref}
          aria-label="Order status"
          steps={steps}
          current={0}
          className="extra"
          data-testid="s"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLOListElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('s');
    });
  });

  describe('interactive', () => {
    it('renders every step as a button named with its state', async () => {
      const screen = await renderWithProvider(<Example onSelect={vi.fn()} />);
      expect(screen.getByRole('button', { name: /Draft/ }).elements()).toHaveLength(1);
      await expect
        .element(screen.getByRole('button', { name: 'Packed Current' }))
        .toHaveAttribute('aria-current', 'step');
      await expect.element(screen.getByRole('button', { name: 'Draft Completed' })).toBeVisible();
    });

    it('keeps the marker border at 3:1 on the hovered step surface (TOK-014)', async () => {
      const screen = await renderWithProvider(<Example onSelect={vi.fn()} />);
      const button = screen.getByRole('button', { name: /Shipped/ });
      const content = button.element();
      const marker = content.querySelector<HTMLElement>('[class*="marker"]');
      if (!marker) throw new Error('Marker not found.');
      const ratioOnStep = () =>
        contrastRatio(
          cssColorToHex(getComputedStyle(marker).borderTopColor),
          cssColorToHex(getComputedStyle(content).backgroundColor),
        );
      await userEvent.hover(button);
      await expectHovered(screen.container);
      // The step fill fades in, then the border must hold 3:1 against it.
      await expect
        .poll(() => cssColorToHex(getComputedStyle(content).backgroundColor))
        .toBe(tokenColor('--ds-surface-hover'));
      expect(ratioOnStep()).toBeGreaterThanOrEqual(3);
      expect(cssColorToHex(getComputedStyle(marker).borderTopColor)).toBe(
        tokenColor('--ds-status-steps-marker-hover-border'),
      );
    });

    it('calls onSelect with the index and the step on click', async () => {
      const onSelect = vi.fn();
      const screen = await renderWithProvider(<Example onSelect={onSelect} />);
      await userEvent.click(screen.getByRole('button', { name: /Shipped/ }));
      expect(onSelect).toHaveBeenCalledWith(2, steps[2]);
    });

    it('is operated with Tab, Enter and Space', async () => {
      const onSelect = vi.fn();
      const screen = await renderWithProvider(<Example onSelect={onSelect} />);
      await userEvent.keyboard('{Tab}{Tab}');
      await expect.element(screen.getByRole('button', { name: /Draft/ })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onSelect).toHaveBeenLastCalledWith(0, steps[0]);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: /Packed/ })).toHaveFocus();
      await userEvent.keyboard(' ');
      expect(onSelect).toHaveBeenLastCalledWith(1, steps[1]);
    });
  });

  describe('i18n', () => {
    it('states the progress in pt-BR', async () => {
      const screen = await renderWithProvider(<Example />, { locale: 'pt-BR' });
      await expect.element(screen.getByText('Concluído')).toBeInTheDocument();
      await expect.element(screen.getByText('Atual')).toBeInTheDocument();
      expect(screen.getByText('Não iniciado').elements()).toHaveLength(2);
    });

    it('applies a provider override', async () => {
      const screen = await renderWithProvider(<Example />, {
        messages: { StatusSteps: { current: 'In progress' } },
      });
      await expect.element(screen.getByText('In progress')).toBeInTheDocument();
    });

    it('applies an instance override', async () => {
      const screen = await renderWithProvider(<Example messages={{ upcoming: 'Waiting' }} />, {
        locale: 'pt-BR',
      });
      expect(screen.getByText('Waiting').elements()).toHaveLength(2);
      await expect.element(screen.getByText('Atual')).toBeInTheDocument();
    });

    it('formats the step number for the locale', async () => {
      const screen = await renderWithProvider(
        <StatusSteps aria-label="Etapas" steps={steps} current={0} />,
        { locale: 'ar-EG' },
      );
      expect(screen.getByRole('listitem').first().element().textContent).toContain('١');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
          <StatusSteps aria-label="Done" steps={steps} current={3} complete />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when interactive and focused (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example onSelect={vi.fn()} />
        </main>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
