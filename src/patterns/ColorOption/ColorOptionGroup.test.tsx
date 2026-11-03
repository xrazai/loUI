import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ColorOption } from './ColorOption';
import { ColorOptionGroup } from './ColorOptionGroup';

interface ExampleProps {
  disableGreen?: boolean;
  selectionMode?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  description?: string;
  errorMessage?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
}

function Example({ disableGreen, ...props }: ExampleProps) {
  return (
    <>
      <button type="button">Before</button>
      <ColorOptionGroup label="Available colors" {...props}>
        <ColorOption id="green" color="#27ae60" label="Green" isDisabled={disableGreen === true} />
        <ColorOption id="navy" color="#1f3a93" label="Navy" />
        <ColorOption id="red" color="#c0392b" label="Brick red" />
      </ColorOptionGroup>
      <button type="button">After</button>
    </>
  );
}

describe('ColorOptionGroup', () => {
  it('names the group with its label and the options with their labels', async () => {
    const screen = await renderWithProvider(<Example />);
    await expect.element(screen.getByRole('toolbar', { name: 'Available colors' })).toBeVisible();
    await expect
      .element(screen.getByRole('button', { name: 'Navy' }))
      .toHaveAttribute('aria-pressed', 'false');
  });

  it('accepts aria-label instead of a visible label', async () => {
    const screen = await renderWithProvider(
      <ColorOptionGroup aria-label="Colors">
        <ColorOption id="navy" color="#1f3a93" label="Navy" />
      </ColorOptionGroup>,
    );
    await expect.element(screen.getByRole('toolbar', { name: 'Colors' })).toBeVisible();
  });

  it('is a named radiogroup in single mode', async () => {
    const screen = await renderWithProvider(
      <Example selectionMode="single" defaultValue={['navy']} />,
    );
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Available colors' }))
      .toBeVisible();
    await expect.element(screen.getByRole('radio', { name: 'Navy' })).toBeChecked();
  });

  it('chooses several colors and reports all ids (uncontrolled)', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Example onChange={onChange} defaultValue={['navy']} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Green' }));
    expect(onChange).toHaveBeenLastCalledWith(['navy', 'green']);
    await userEvent.click(screen.getByRole('button', { name: 'Navy' }));
    expect(onChange).toHaveBeenLastCalledWith(['green']);
  });

  it('single mode keeps one color', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Example selectionMode="single" defaultValue={['navy']} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Green' }));
    expect(onChange).toHaveBeenLastCalledWith(['green']);
    await expect.element(screen.getByRole('radio', { name: 'Navy' })).not.toBeChecked();
  });

  it('stays put when controlled and the parent does not update', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Example value={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Navy' }));
    expect(onChange).toHaveBeenCalledWith(['navy']);
    await expect
      .element(screen.getByRole('button', { name: 'Navy' }))
      .toHaveAttribute('aria-pressed', 'false');
  });

  it('works controlled with state', async () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>(['red']);
      return (
        <ColorOptionGroup label="Colors" value={value} onChange={setValue}>
          <ColorOption id="red" color="#c0392b" label="Brick red" />
          <ColorOption id="navy" color="#1f3a93" label="Navy" />
        </ColorOptionGroup>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Navy' }));
    await expect
      .element(screen.getByRole('button', { name: 'Navy' }))
      .toHaveAttribute('aria-pressed', 'true');
    await expect
      .element(screen.getByRole('button', { name: 'Brick red' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('disables one option', async () => {
    const screen = await renderWithProvider(<Example disableGreen />);
    await expect.element(screen.getByRole('button', { name: 'Green' })).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Navy' })).toBeEnabled();
  });

  it('disables the whole group', async () => {
    const screen = await renderWithProvider(<Example isDisabled />);
    await expect.element(screen.getByRole('button', { name: 'Navy' })).toBeDisabled();
  });

  it('links description and error with aria-describedby while invalid', async () => {
    const screen = await renderWithProvider(
      <Example description="Pick at least one." isInvalid errorMessage="Choose a color." />,
    );
    const group = screen.getByRole('toolbar').element();
    const ids = (group.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0] ?? '')?.textContent).toBe('Pick at least one.');
    expect(document.getElementById(ids[1] ?? '')?.textContent).toBe('Choose a color.');
    expect(group.hasAttribute('data-invalid')).toBe(true);
  });

  it('shows no error while valid, even with an errorMessage', async () => {
    const screen = await renderWithProvider(<Example errorMessage="Choose a color." />);
    expect(screen.getByText('Choose a color.').elements()).toHaveLength(0);
    expect(screen.getByRole('toolbar').element().hasAttribute('aria-describedby')).toBe(false);
  });

  it('has one tab stop and arrows move between options', async () => {
    const screen = await renderWithProvider(<Example />);
    await userEvent.keyboard('{Tab}{Tab}');
    await expect.element(screen.getByRole('button', { name: 'Green' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(screen.getByRole('button', { name: 'Navy' })).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect.element(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('has no axe violations (axe)', async () => {
    const screen = await renderWithProvider(
      <main>
        <Example
          description="Pick at least one."
          isInvalid
          errorMessage="Choose a color."
          defaultValue={['navy']}
          disableGreen
        />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
