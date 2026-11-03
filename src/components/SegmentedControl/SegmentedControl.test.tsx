import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Kbd } from '../Kbd';
import { Stack } from '../Stack';
import { SegmentedControl } from './SegmentedControl';
import type { SegmentedControlProps } from './SegmentedControl';

const options = [
  { value: 'list', label: 'List' },
  { value: 'board', label: 'Board', count: 12, countLabel: '12 open' },
  { value: 'calendar', label: 'Calendar' },
];

type ExampleProps = Partial<
  Omit<SegmentedControlProps, 'label' | 'aria-label' | 'aria-labelledby'>
>;

function Example(props: ExampleProps) {
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

  describe('visible label and description (GAP-041)', () => {
    it('names the group with the visible label, not only aria-label', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl label="Transaction type" options={options} />,
      );
      await expect
        .element(screen.getByRole('radiogroup', { name: 'Transaction type' }))
        .toBeVisible();
      await expect.element(screen.getByText('Transaction type')).toBeVisible();
    });

    it('lets the visible label win over aria-label so the name is not doubled', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl label="Transaction type" aria-label="View" options={options} />,
      );
      await expect
        .element(screen.getByRole('radiogroup', { name: 'Transaction type' }))
        .toBeVisible();
    });

    it('links the description with aria-describedby and keeps a consumer one', async () => {
      const screen = await renderWithProvider(
        <>
          <span id="extra">Extra hint.</span>
          <SegmentedControl
            label="View"
            description="Applies at once."
            aria-describedby="extra"
            options={options}
          />
        </>,
      );
      await expect
        .element(screen.getByRole('radiogroup', { name: 'View' }))
        .toHaveAccessibleDescription('Extra hint. Applies at once.');
    });

    it('can carry only a description when aria-label names the group', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl aria-label="View" description="Applies at once." options={options} />,
      );
      await expect
        .element(screen.getByRole('radiogroup', { name: 'View' }))
        .toHaveAccessibleDescription('Applies at once.');
    });

    it('tints the description with the same tone attribute as the sibling fields', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl
          label="View"
          description="Saved for this device."
          descriptionTone="success"
          options={options}
        />,
      );
      expect(screen.getByText('Saved for this device.').element().getAttribute('data-tone')).toBe(
        'success',
      );
    });

    it('renders the bare group, with no wrapper, without a label or description', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl aria-label="View" options={options} />,
      );
      expect(screen.container.firstElementChild?.getAttribute('role')).toBe('radiogroup');
    });

    it('keeps className and ref on the bar when a label wraps it', async () => {
      const ref = createRef<HTMLDivElement>();
      await renderWithProvider(
        <SegmentedControl ref={ref} label="View" className="extra" options={options} />,
      );
      expect(ref.current?.getAttribute('role')).toBe('radiogroup');
      expect(ref.current?.classList.contains('extra')).toBe(true);
    });

    it('shows shortcuts in the description without doubling the option names', async () => {
      const screen = await renderWithProvider(
        <SegmentedControl
          label="View"
          description={
            <>
              Switch with <Kbd keys={['Alt', '1']} platform="other" /> to{' '}
              <Kbd keys={['Alt', '3']} platform="other" />
            </>
          }
          options={options}
        />,
      );
      await expect.element(screen.getByRole('radio', { name: 'List' })).toBeVisible();
      await expect
        .element(screen.getByRole('radiogroup', { name: 'View' }))
        .toHaveAccessibleDescription('Switch with Option 1 to Option 3');
    });

    it('keeps one tab stop and arrow navigation with a label', async () => {
      const screen = await renderWithProvider(
        <>
          <button type="button">Before</button>
          <SegmentedControl label="View" description="Applies at once." options={options} />
          <button type="button">After</button>
        </>,
      );
      await userEvent.keyboard('{Tab}{Tab}');
      await expect.element(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      await expect.element(screen.getByRole('radio', { name: /Board/ })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });
  });

  describe('width and overflow (GAP-041)', () => {
    const transfer = [
      { value: 'transfer', label: 'Transfer' },
      { value: 'deposit', label: 'Deposit' },
      { value: 'withdrawal', label: 'Withdrawal' },
      { value: 'adjustment', label: 'Adjustment' },
    ];

    it('does not stretch to full width inside a Stack', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 600 }}>
          <Stack>
            <SegmentedControl aria-label="Type" options={transfer} />
            <SegmentedControl label="Type" options={transfer} />
          </Stack>
        </div>,
      );
      for (const group of screen.getByRole('radiogroup').elements()) {
        expect(group.getBoundingClientRect().width).toBeLessThan(600);
      }
    });

    it('stretches inside a Stack when fullWidth is set', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 600 }}>
          <Stack>
            <SegmentedControl aria-label="Type" options={transfer} fullWidth />
            <SegmentedControl label="Type" options={transfer} fullWidth />
          </Stack>
        </div>,
      );
      for (const group of screen.getByRole('radiogroup').elements()) {
        expect(group.getBoundingClientRect().width).toBe(600);
      }
    });

    it('shows four labels in 440 px without truncating any of them', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 440 }}>
          <SegmentedControl label="Type" options={transfer} fullWidth />
        </div>,
      );
      const group = screen.getByRole('radiogroup').element();
      expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
      for (const radio of screen.getByRole('radio').elements()) {
        expect(radio.scrollWidth).toBeLessThanOrEqual(radio.clientWidth);
        const text = radio.firstElementChild as HTMLElement;
        expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth + 1);
        expect(getComputedStyle(text).textOverflow).toBe('clip');
      }
    });

    it('scrolls the bar instead of truncating when the labels do not fit', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 260 }}>
          <SegmentedControl
            label="Status"
            options={[
              { value: 'a', label: 'Awaiting supplier confirmation' },
              { value: 'b', label: 'Ready to ship' },
              { value: 'c', label: 'Transfer to another warehouse' },
            ]}
          />
        </div>,
      );
      const group = screen.getByRole('radiogroup').element();
      expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(260);
      expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
      for (const radio of screen.getByRole('radio').elements()) {
        const label = radio.firstElementChild as HTMLElement;
        // The segment is as wide as its text: nothing is clipped inside it.
        expect(radio.getBoundingClientRect().width).toBeGreaterThanOrEqual(
          label.getBoundingClientRect().width,
        );
        expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
      }
      expect(group.scrollHeight).toBeLessThanOrEqual(group.clientHeight);
    });

    it('scrolls a focused option into view without changing the keyboard contract', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 200 }}>
          <SegmentedControl
            aria-label="Status"
            options={[
              { value: 'a', label: 'Awaiting supplier confirmation' },
              { value: 'b', label: 'Ready to ship' },
            ]}
          />
        </div>,
      );
      await userEvent.keyboard('{Tab}{ArrowRight}');
      const last = screen.getByRole('radio', { name: 'Ready to ship' });
      await expect.element(last).toHaveFocus();
      const bar = screen.getByRole('radiogroup').element().getBoundingClientRect();
      expect(last.element().getBoundingClientRect().right).toBeLessThanOrEqual(bar.right + 1);
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

    it('has no axe violations with a label, a toned description and a scrolling bar (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <div style={{ inlineSize: 220 }}>
            <SegmentedControl
              label="Status"
              description="Over by $5"
              descriptionTone="warning"
              options={[
                { value: 'a', label: 'Awaiting supplier confirmation' },
                { value: 'b', label: 'Ready to ship' },
              ]}
            />
          </div>
          <SegmentedControl label="View" options={options} isDisabled />
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
