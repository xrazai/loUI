import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Stepper } from './Stepper';
import type { StepperProps } from './Stepper';

const steps = [
  { id: 'basics', label: 'Basics', description: 'Name and purpose' },
  { id: 'source', label: 'Source' },
  { id: 'rules', label: 'Rules' },
  { id: 'review', label: 'Review' },
];

const nine = Array.from({ length: 9 }, (_, index) => ({
  id: `s${String(index)}`,
  label: `Step name ${String(index + 1)}`,
}));

function Example(props: Partial<StepperProps>) {
  return (
    <>
      <button type="button">Before</button>
      <Stepper aria-label="Setup progress" steps={steps} current={2} {...props} />
      <button type="button">After</button>
    </>
  );
}

function text(element: Element): string {
  return (element as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
}

describe('Stepper', () => {
  describe('rendering and ARIA', () => {
    it('is a named ordered list with one item per step', async () => {
      const screen = await renderWithProvider(<Example />);
      const list = screen.getByRole('list', { name: 'Setup progress' });
      await expect.element(list).toBeVisible();
      expect(list.element().tagName).toBe('OL');
      expect(screen.getByRole('listitem').elements()).toHaveLength(4);
    });

    it('can be named by another element', async () => {
      const screen = await renderWithProvider(
        <>
          <span id="n">Progress</span>
          <Stepper aria-labelledby="n" steps={steps} current={0} />
        </>,
      );
      await expect.element(screen.getByRole('list', { name: 'Progress' })).toBeVisible();
    });

    it('states each step as text, not only by color or check', async () => {
      const screen = await renderWithProvider(<Example />);
      const items = screen.getByRole('listitem').elements();
      expect(items.map(text)).toEqual([
        'Basics Completed',
        'Source Completed',
        '3 Rules Current',
        '4 Review Not started',
      ]);
    });

    it('marks only the current step with aria-current="step"', async () => {
      await renderWithProvider(<Example />);
      const marked = document.querySelectorAll('[aria-current]');
      expect(marked).toHaveLength(1);
      expect(marked[0]?.getAttribute('aria-current')).toBe('step');
      expect(marked[0]?.textContent).toContain('Rules');
    });

    it('treats the current step as completed with complete', async () => {
      const screen = await renderWithProvider(<Example current={3} complete />);
      const last = screen.getByRole('listitem').last().element();
      expect(last.textContent).toContain('Completed');
      expect(last.getAttribute('data-state')).toBe('complete');
    });

    it('draws the markers as decoration', async () => {
      const screen = await renderWithProvider(<Example />);
      const hidden = screen.container.querySelectorAll('li span[aria-hidden="true"]');
      expect(hidden).toHaveLength(4);
    });

    it('renders the description only in the vertical orientation', async () => {
      const horizontal = await renderWithProvider(<Example />);
      expect(horizontal.container.textContent).not.toContain('Name and purpose');
      await horizontal.unmount();
      const vertical = await renderWithProvider(<Example orientation="vertical" />);
      await expect.element(vertical.getByText('Name and purpose')).toBeVisible();
    });

    it('sets data-orientation on the root', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(<Example ref={ref} orientation="vertical" />);
      expect(ref.current?.getAttribute('data-orientation')).toBe('vertical');
    });
  });

  describe('navigation to completed steps', () => {
    it('has no buttons without onStepPress', async () => {
      const screen = await renderWithProvider(<Example />);
      const list = screen.getByRole('list', { name: 'Setup progress' }).element();
      expect(list.querySelectorAll('button')).toHaveLength(0);
    });

    it('makes only completed steps buttons', async () => {
      const screen = await renderWithProvider(<Example onStepPress={() => undefined} />);
      const list = screen.getByRole('list', { name: 'Setup progress' }).element();
      const buttons = Array.from(list.querySelectorAll('button'));
      expect(buttons.map(text)).toEqual(['Basics Completed', 'Source Completed']);
    });

    it('makes the current step a button too when the flow is complete', async () => {
      const screen = await renderWithProvider(
        <Example current={3} complete onStepPress={() => undefined} />,
      );
      const list = screen.getByRole('list', { name: 'Setup progress' }).element();
      expect(list.querySelectorAll('button')).toHaveLength(4);
      expect(list.querySelector('button[aria-current="step"]')?.textContent).toContain('Review');
    });

    it('calls onStepPress with the index and the step, with pointer and keyboard', async () => {
      const onStepPress = vi.fn();
      const screen = await renderWithProvider(<Example onStepPress={onStepPress} />);
      await userEvent.tab();
      await userEvent.tab();
      await expect.element(screen.getByRole('button', { name: 'Basics Completed' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onStepPress).toHaveBeenLastCalledWith(0, steps[0]);
      await userEvent.tab();
      await expect.element(screen.getByRole('button', { name: 'Source Completed' })).toHaveFocus();
      await userEvent.keyboard(' ');
      expect(onStepPress).toHaveBeenLastCalledWith(1, steps[1]);
      await screen.getByRole('button', { name: 'Basics Completed' }).click();
      expect(onStepPress).toHaveBeenCalledTimes(3);
    });

    it('moves focus past the buttons to the next control in tab order', async () => {
      const screen = await renderWithProvider(<Example onStepPress={() => undefined} />);
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('makes the step buttons a target of at least 24 by 24 pixels', async () => {
      const screen = await renderWithProvider(
        <Example steps={nine} current={8} onStepPress={() => undefined} />,
      );
      const buttons = screen.container.querySelectorAll('ol button');
      expect(buttons).toHaveLength(8);
      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(24);
        expect(rect.height).toBeGreaterThanOrEqual(24);
      }
    });
  });

  describe('reflow', () => {
    it('shows the "Step 3 of 9" summary and fits 9 steps in 320 px', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 320 }} data-testid="frame">
          <Stepper
            aria-label="New agent steps"
            steps={nine}
            current={2}
            onStepPress={() => undefined}
          />
        </div>,
      );
      const frame = screen.getByTestId('frame').element();
      const summary = frame.querySelector('p');
      expect(summary).not.toBeNull();
      expect(getComputedStyle(summary as Element).display).toBe('block');
      expect(text(summary as Element)).toBe('Step 3 of 9: Step name 3');
      expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
      const list = frame.querySelector('ol') as HTMLElement;
      expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    });

    it('keeps the labels available to assistive technology when collapsed', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 320 }}>
          <Stepper aria-label="New agent steps" steps={nine} current={2} />
        </div>,
      );
      const item = screen.getByRole('listitem').nth(3).element();
      expect(item.textContent).toContain('Step name 4');
      expect(item.textContent).toContain('Not started');
    });

    it('hides the summary when there is room', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 900 }}>
          <Stepper aria-label="New agent steps" steps={nine} current={2} />
        </div>,
      );
      const summary = screen.container.querySelector('p');
      expect(getComputedStyle(summary as Element).display).toBe('none');
    });
  });

  describe('messages', () => {
    it('uses the pt-BR catalog', async () => {
      const screen = await renderWithProvider(<Example />, { locale: 'pt-BR' });
      const items = screen.getByRole('listitem').elements();
      expect(items.map(text)).toEqual([
        'Basics Concluída',
        'Source Concluída',
        '3 Rules Atual',
        '4 Review Não iniciada',
      ]);
    });

    it('translates the summary', async () => {
      const screen = await renderWithProvider(
        <Stepper aria-label="Etapas" steps={nine} current={2} />,
        { locale: 'pt-BR' },
      );
      expect(screen.container.querySelector('p')?.textContent).toBe('Etapa 3 de 9: Step name 3');
    });

    it('applies provider and instance overrides', async () => {
      const provider = await renderWithProvider(<Example />, {
        messages: { Stepper: { current: 'In progress' } },
      });
      expect(provider.container.textContent).toContain('In progress');
      await provider.unmount();

      const instance = await renderWithProvider(<Example messages={{ current: 'Here' }} />, {
        messages: { Stepper: { current: 'In progress' } },
      });
      expect(instance.container.textContent).toContain('Here');
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Example ref={ref} className="extra" id="st1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('st1');
  });

  it('has no axe violations in any orientation or configuration', async () => {
    const screen = await renderWithProvider(
      <main>
        <Example />
        <Example orientation="vertical" aria-label="Vertical steps" />
        <Example onStepPress={() => undefined} aria-label="Navigable steps" />
        <Example current={3} complete aria-label="Finished steps" />
        <Stepper aria-label="Nine steps" steps={nine} current={4} />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
