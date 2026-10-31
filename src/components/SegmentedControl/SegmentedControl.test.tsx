import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { SegmentedControl } from './SegmentedControl';
import type { SegmentedControlProps } from './SegmentedControl';

const options = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board', count: 12, countLabel: '12 open' },
  { value: 'calendar', label: 'Calendar' },
];

function Example(props: Partial<SegmentedControlProps>) {
  return (
    <>
      <button type="button">Before</button>
      <SegmentedControl aria-label="View" options={options} {...props} />
      <button type="button">After</button>
    </>
  );
}

describe('SegmentedControl', () => {
  describe('rendering and ARIA', () => {
    it('is a named radio group (a value control, not tabs)', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('radiogroup', { name: 'View' })).toBeVisible();
      expect(screen.getByRole('tab').elements()).toHaveLength(0);
      expect(screen.getByRole('radio').elements()).toHaveLength(3);
    });

    it('selects the first option when there is no default', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    });

    it('starts on defaultValue', async () => {
      const screen = await renderWithProvider(<Example defaultValue="calendar" />);
      await expect.element(screen.getByRole('radio', { name: 'Calendar' })).toBeChecked();
    });

    it('can be named by another element', async () => {
      const screen = await renderWithProvider(
        <>
          <span id="v">Display mode</span>
          <SegmentedControl aria-labelledby="v" options={options} />
        </>,
      );
      await expect.element(screen.getByRole('radiogroup', { name: 'Display mode' })).toBeVisible();
    });

    it('announces the count through its label', async () => {
      const screen = await renderWithProvider(<Example />);
      await expect.element(screen.getByRole('radio', { name: 'Board 12 open' })).toBeVisible();
    });

    it('formats numeric counts for the active locale (pt-BR)', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl
          aria-label="Situação"
          options={[{ value: 'a', label: 'Todos', count: 1248 }]}
        />,
        { locale: 'pt-BR' },
      );
      await expect.element(screen.getByRole('radio', { name: 'Todos 1.248' })).toBeVisible();
    });

    it('uses the segment heights from the size tokens', async () => {
      const screen = await renderWithProvider(
        <>
          <SegmentedControl aria-label="Medium" options={options} />
          <SegmentedControl aria-label="Small" size="sm" options={options} />
        </>,
      );
      const md = screen.getByRole('radiogroup', { name: 'Medium' }).getByRole('radio').first();
      const sm = screen.getByRole('radiogroup', { name: 'Small' }).getByRole('radio').first();
      expect(md.element().getBoundingClientRect().height).toBe(32);
      expect(sm.element().getBoundingClientRect().height).toBe(24);
    });

    it('stretches the segments with fullWidth', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 400 }}>
          <SegmentedControl aria-label="View" options={options} fullWidth />
        </div>,
      );
      const group = screen.getByRole('radiogroup').element();
      expect(group.getBoundingClientRect().width).toBe(400);
      expect(group.getAttribute('data-full-width')).toBe('true');
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <SegmentedControl
          ref={ref}
          aria-label="View"
          options={options}
          className="extra"
          data-testid="s"
        />,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('s');
    });
  });

  describe('keyboard contract', () => {
    it('has a single tab stop', async () => {
      const screen = await renderWithProvider(<Example />);
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('moves focus with the arrows and selects with Space', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.keyboard('{Tab}{Tab}');
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('radio', { name: /Board/ })).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      await userEvent.keyboard(' ');
      await expect.element(screen.getByRole('radio', { name: /Board/ })).toBeChecked();
      expect(onChange).toHaveBeenCalledWith('board');
      await userEvent.keyboard('{ArrowLeft}');
      await expect.element(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
    });

    it('never ends with an empty selection', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.click(screen.getByRole('radio', { name: 'List' }));
      await expect.element(screen.getByRole('radio', { name: 'List' })).toBeChecked();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('skips disabled options and ignores clicks on them', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <Example
          onChange={onChange}
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', isDisabled: true },
            { value: 'c', label: 'C' },
          ]}
        />,
      );
      await userEvent.keyboard('{Tab}{Tab}{ArrowRight}');
      await expect.element(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
      await userEvent.click(screen.getByRole('radio', { name: 'B' }), { force: true });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('follows clicks when uncontrolled', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example onChange={onChange} />);
      await userEvent.click(screen.getByRole('radio', { name: 'Calendar' }));
      await expect.element(screen.getByRole('radio', { name: 'Calendar' })).toBeChecked();
      expect(onChange).toHaveBeenCalledWith('calendar');
    });

    it('stays put when controlled and the parent does not update', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<Example value="list" onChange={onChange} />);
      await userEvent.click(screen.getByRole('radio', { name: 'Calendar' }));
      expect(onChange).toHaveBeenCalledWith('calendar');
      await expect.element(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    });

    it('follows a state owned by the parent', async () => {
      function Parent() {
        const [value, setValue] = useState('list');
        return <Example value={value} onChange={setValue} />;
      }
      const screen = await renderWithProvider(<Parent />);
      await userEvent.click(screen.getByRole('radio', { name: 'Calendar' }));
      await expect.element(screen.getByRole('radio', { name: 'Calendar' })).toBeChecked();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
          <SegmentedControl aria-label="Small" size="sm" options={options} fullWidth />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused, disabled or with a disabled option (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <Example />
          <SegmentedControl aria-label="Off" options={options} isDisabled />
          <SegmentedControl
            aria-label="Some off"
            options={[
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B', isDisabled: true },
            ]}
          />
        </main>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
