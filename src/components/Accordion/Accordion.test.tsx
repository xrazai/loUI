import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Accordion } from './Accordion';
import type { AccordionProps } from './Accordion';

const items = [
  { value: 'a', title: 'Shipping', meta: '2 min', content: 'Shipping answer' },
  { value: 'b', title: 'Returns', content: 'Returns answer' },
  { value: 'c', title: 'Samples', content: 'Samples answer', isDisabled: true },
];

function Example(props: Partial<AccordionProps>) {
  return <Accordion items={items} {...props} />;
}

const expanded = (screen: Awaited<ReturnType<typeof renderWithProvider>>, name: string) =>
  screen
    .getByRole('button', { name: new RegExp(name) })
    .element()
    .getAttribute('aria-expanded');

describe('Accordion', () => {
  describe('structure', () => {
    it('wraps each trigger button in a heading (level 3 by default)', async () => {
      const screen = await renderWithProvider(<Example />);
      const headings = screen.getByRole('heading', { level: 3 });
      expect(headings.elements()).toHaveLength(3);
      for (const heading of headings.elements()) {
        expect(heading.querySelector('button')).not.toBeNull();
      }
    });

    it('supports another heading level', async () => {
      const screen = await renderWithProvider(<Example headingLevel={2} />);
      expect(screen.getByRole('heading', { level: 2 }).elements()).toHaveLength(3);
    });

    it('collapses by default and links trigger and panel', async () => {
      const screen = await renderWithProvider(<Example defaultValue={['b']} />);
      expect(expanded(screen, 'Shipping')).toBe('false');
      expect(expanded(screen, 'Returns')).toBe('true');
      const trigger = screen.getByRole('button', { name: /Returns/ }).element();
      const panel = screen.getByRole('group', { name: /Returns/ }).element();
      expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
      await expect.element(screen.getByText('Returns answer')).toBeVisible();
      const closed = screen.getByText('Shipping answer').element().closest('[role="group"]');
      expect(closed?.hasAttribute('hidden')).toBe(true);
      expect(closed?.getBoundingClientRect().height).toBe(0);
    });

    it('shows the meta text after the title', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('button', { name: 'Shipping 2 min' })).toBeVisible();
    });

    it('draws a border in the bordered variant and none in plain', async () => {
      const bordered = await renderWithProvider(<Example data-testid="acc" />);
      const root = bordered.container.querySelector('[data-testid="acc"]') as HTMLElement;
      expect(getComputedStyle(root).borderTopWidth).toBe('1px');
      await bordered.unmount();
      const plain = await renderWithProvider(<Example variant="plain" data-testid="acc" />);
      const plainRoot = plain.container.querySelector('[data-testid="acc"]') as HTMLElement;
      expect(getComputedStyle(plainRoot).borderTopWidth).toBe('0px');
    });

    it('rotates the chevron when expanded', async () => {
      const screen = await renderWithProvider(<Example />);
      const chevron = screen
        .getByRole('button', { name: /Shipping/ })
        .element()
        .querySelector('svg') as Element;
      expect(getComputedStyle(chevron).transform).toBe('none');
      await userEvent.click(screen.getByRole('button', { name: /Shipping/ }));
      await expect
        .poll(() => getComputedStyle(chevron).transform, { timeout: 2000 })
        .not.toBe('none');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(<Example ref={ref} className="extra" data-testid="acc" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('acc');
    });
  });

  describe('keyboard and mouse', () => {
    it('toggles with Enter and Space and closes the others in single mode', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: /Shipping/ })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(expanded(screen, 'Shipping')).toBe('true');
      expect(onChange).toHaveBeenLastCalledWith(['a']);
      await userEvent.keyboard('{Tab}');
      await userEvent.keyboard(' ');
      expect(expanded(screen, 'Returns')).toBe('true');
      expect(expanded(screen, 'Shipping')).toBe('false');
      expect(onChange).toHaveBeenLastCalledWith(['b']);
      await userEvent.keyboard(' ');
      expect(expanded(screen, 'Returns')).toBe('false');
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it('keeps several sections open with multiple', async () => {
      const screen = await renderWithProvider(<Example multiple />);
      await userEvent.click(screen.getByRole('button', { name: /Shipping/ }));
      await userEvent.click(screen.getByRole('button', { name: /Returns/ }));
      expect(expanded(screen, 'Shipping')).toBe('true');
      expect(expanded(screen, 'Returns')).toBe('true');
    });

    it('skips a disabled item in the tab order and ignores clicks', async () => {
      const screen = await renderWithProvider(<Example />);
      const disabled = screen.getByRole('button', { name: /Samples/ });
      await expect.element(disabled).toBeDisabled();
      await userEvent.click(disabled, { force: true });
      expect(expanded(screen, 'Samples')).toBe('false');
    });

    it('disables every section with isDisabled', async () => {
      const screen = await renderWithProvider(<Example isDisabled />);
      for (const button of screen.getByRole('button').elements()) {
        expect((button as HTMLButtonElement).disabled).toBe(true);
      }
    });
  });

  describe('controlled and uncontrolled', () => {
    it('stays closed when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example value={[]} onChange={onChange} />);
      await userEvent.click(screen.getByRole('button', { name: /Shipping/ }));
      expect(onChange).toHaveBeenCalledWith(['a']);
      expect(expanded(screen, 'Shipping')).toBe('false');
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [value, setValue] = useState<string[]>(['b']);
        return <Example value={value} onChange={setValue} multiple />;
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByRole('button', { name: /Shipping/ }));
      expect(expanded(screen, 'Shipping')).toBe('true');
      expect(expanded(screen, 'Returns')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations collapsed, expanded and in the plain variant (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example defaultValue={['a']} multiple />
          <Example variant="plain" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when a trigger is focused (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
