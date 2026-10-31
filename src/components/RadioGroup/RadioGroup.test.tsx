import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { borderContrast, cssColorToHex, tokenColor } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Radio, RadioGroup } from './RadioGroup';

function circleOf(input: Element): HTMLElement {
  const label = input.closest('label');
  const circle = [...(label?.children ?? [])].find((child) => !child.contains(input));
  if (!(circle instanceof HTMLElement)) throw new Error('Radio circle not found.');
  return circle;
}

function Regions(props: Partial<React.ComponentProps<typeof RadioGroup>>) {
  return (
    <RadioGroup label="Region" {...props}>
      <Radio value="eu" label="Frankfurt" />
      <Radio value="us" label="Virginia" />
      <Radio value="sa" label="Sao Paulo" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a radiogroup named by its label with native radio inputs and a shared description', async () => {
    const screen = await renderWithProvider(<Regions description="Where your data is stored." />);
    const group = screen.getByRole('radiogroup', { name: 'Region' });
    await expect.element(group).toBeInTheDocument();
    await expect.element(group).toHaveAccessibleDescription('Where your data is stored.');
    const radio = screen.getByRole('radio', { name: 'Frankfurt' }).element();
    expect(radio.tagName).toBe('INPUT');
    expect(radio.getAttribute('type')).toBe('radio');
  });

  it('is a single tab stop with roving focus: arrows move and select, and wrap', async () => {
    const screen = await renderWithProvider(
      <>
        <button type="button">before</button>
        <Regions />
        <button type="button">after</button>
      </>,
    );
    await screen.getByRole('button', { name: 'before' }).click();
    await userEvent.tab();
    await expect.element(screen.getByRole('radio', { name: 'Frankfurt' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('radio', { name: 'Virginia' })).toBeChecked();
    await expect.element(screen.getByRole('radio', { name: 'Virginia' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(screen.getByRole('radio', { name: 'Sao Paulo' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('radio', { name: 'Frankfurt' })).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(screen.getByRole('radio', { name: 'Sao Paulo' })).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(screen.getByRole('radio', { name: 'Virginia' })).toBeChecked();
    // Tab leaves the group in one step.
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  it('focuses the selected radio when tabbing into the group', async () => {
    const screen = await renderWithProvider(
      <>
        <button type="button">before</button>
        <Regions defaultValue="us" />
      </>,
    );
    await screen.getByRole('button', { name: 'before' }).click();
    await userEvent.tab();
    await expect.element(screen.getByRole('radio', { name: 'Virginia' })).toHaveFocus();
  });

  it('selects the focused radio with Space and by clicking the label', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Regions onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect.element(screen.getByRole('radio', { name: 'Frankfurt' })).toBeChecked();
    await screen.getByText('Sao Paulo').click();
    await expect.element(screen.getByRole('radio', { name: 'Sao Paulo' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('sa');
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState('us');
      return (
        <>
          <Regions value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    await expect.element(controlled.getByRole('radio', { name: 'Virginia' })).toBeChecked();
    await controlled.getByText('Frankfurt').click();
    expect(controlled.container.querySelector('output')?.textContent).toBe('eu');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Regions defaultValue="sa" />);
    await expect.element(uncontrolled.getByRole('radio', { name: 'Sao Paulo' })).toBeChecked();
  });

  it('submits the selected value under the group name', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Regions name="region" defaultValue="us" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('region')).toBe('us');
  });

  it('is required: no error before submit, error and focus after a failed attempt', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Regions name="region" isRequired errorMessage="Choose a region." />
        <button type="submit">Save</button>
      </form>,
    );
    await expect.element(screen.getByRole('radiogroup', { name: 'Region' })).toBeRequired();
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Choose a region.');
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Region' }))
      .toHaveAccessibleDescription('Choose a region.');
  });

  it('marks the group invalid when controlled', async () => {
    const screen = await renderWithProvider(<Regions isInvalid errorMessage="Choose a region." />);
    await expect
      .element(screen.getByRole('radiogroup', { name: 'Region' }))
      .toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the required marker from messages (pt-BR provider override)', async () => {
    const screen = await renderWithProvider(<Regions isRequired />, {
      locale: 'pt-BR',
      messages: { Field: { requiredMark: '(obrigatório)' } },
    });
    expect(screen.container.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      '(obrigatório)',
    );
  });

  it('supports horizontal orientation', async () => {
    const screen = await renderWithProvider(<Regions orientation="horizontal" />);
    const a = screen.getByRole('radio', { name: 'Frankfurt' }).element().closest('label');
    const b = screen.getByRole('radio', { name: 'Virginia' }).element().closest('label');
    expect(a?.getBoundingClientRect().top).toBe(b?.getBoundingClientRect().top);
    expect(
      screen.getByRole('radiogroup').element().getAttribute('aria-orientation') ?? 'horizontal',
    ).toBe('horizontal');
  });

  it('disables the whole group, one option, and keeps read only unchanged', async () => {
    const group = await renderWithProvider(<Regions isDisabled defaultValue="eu" />);
    await expect.element(group.getByRole('radio', { name: 'Frankfurt' })).toBeDisabled();
    const root = group.getByRole('radiogroup').element();
    // The group root never dims as a whole; the label and each option row dim once.
    expect(Number(getComputedStyle(root).opacity)).toBe(1);
    const row = group.getByRole('radio', { name: 'Frankfurt' }).element().closest('label');
    expect(Number(getComputedStyle(row as Element).opacity)).toBeCloseTo(0.35, 2);
    await group.unmount();

    const one = await renderWithProvider(
      <RadioGroup label="Region">
        <Radio value="eu" label="Frankfurt" />
        <Radio value="us" label="Virginia" isDisabled />
      </RadioGroup>,
    );
    await expect.element(one.getByRole('radio', { name: 'Virginia' })).toBeDisabled();
    const dimmed = one.getByRole('radio', { name: 'Virginia' }).element().closest('label');
    expect(Number(getComputedStyle(dimmed as Element).opacity)).toBeCloseTo(0.35, 2);
    const other = one.getByRole('radio', { name: 'Frankfurt' }).element().closest('label');
    expect(Number(getComputedStyle(other as Element).opacity)).toBe(1);
    await one.unmount();

    const readOnly = await renderWithProvider(<Regions isReadOnly defaultValue="eu" />);
    await readOnly.getByText('Virginia').click();
    await expect.element(readOnly.getByRole('radio', { name: 'Frankfurt' })).toBeChecked();
  });

  it('draws an 18px circle with a 9px accent dot when selected, and keeps the border at 3:1', async () => {
    const screen = await renderWithProvider(<Regions defaultValue="eu" />);
    const selected = circleOf(screen.getByRole('radio', { name: 'Frankfurt' }).element());
    const other = circleOf(screen.getByRole('radio', { name: 'Virginia' }).element());
    const size = getComputedStyle(selected);
    expect([size.width, size.height]).toEqual(['18px', '18px']);
    const dot = selected.firstElementChild as HTMLElement;
    expect(getComputedStyle(dot).width).toBe('9px');
    expect(getComputedStyle(dot).opacity).toBe('1');
    expect(getComputedStyle(other.firstElementChild as HTMLElement).opacity).toBe('0');
    expect(cssColorToHex(getComputedStyle(dot).backgroundColor)).toBe(tokenColor('--ds-accent'));
    // Rest, hover and focus keep the unselected border at 3:1 or better.
    expect(borderContrast(other)).toBeGreaterThanOrEqual(3);
    const background = getComputedStyle(other).backgroundColor;
    await userEvent.hover(screen.getByText('Virginia'));
    expect(borderContrast(other)).toBeGreaterThanOrEqual(3);
    expect(getComputedStyle(other).backgroundColor).toBe(background);
    await userEvent.tab();
    expect(getComputedStyle(selected).boxShadow).not.toBe('none');
  });

  it('keeps each option row at the 24px minimum target', async () => {
    const screen = await renderWithProvider(<Regions />);
    const row = screen.getByRole('radio', { name: 'Frankfurt' }).element().closest('label');
    expect(row?.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
  });

  it('links an option description without adding it to the name', async () => {
    const screen = await renderWithProvider(
      <RadioGroup label="Region">
        <Radio value="eu" label="Frankfurt" description="Lowest latency for Europe." />
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Frankfurt' });
    await expect.element(radio).toHaveAccessibleDescription('Lowest latency for Europe.');
  });

  it('warns once in development when the group has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = { children: <Radio value="a" label="A" /> } as unknown as Parameters<
      typeof RadioGroup
    >[0];
    await renderWithProvider(<RadioGroup {...props} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('RadioGroup needs an accessible name'),
    );
  });

  it('forwards className, ref and consumer handlers', async () => {
    const ref = createRef<HTMLDivElement>();
    const onFocus = vi.fn();
    await renderWithProvider(
      <RadioGroup label="Region" className="extra" ref={ref} onFocus={onFocus}>
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  describe('axe', () => {
    it('has no violations: default, selected, horizontal, descriptions', async () => {
      const screen = await renderWithProvider(
        <main>
          <Regions description="Pick one." />
          <Regions defaultValue="eu" orientation="horizontal" />
          <RadioGroup aria-label="Plan">
            <Radio value="a" label="A" description="First." />
            <Radio value="b" label="B" />
          </RadioGroup>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations: required, invalid, disabled, read only', async () => {
      const screen = await renderWithProvider(
        <main>
          <Regions isRequired />
          <Regions isInvalid errorMessage="Choose one." />
          <Regions isDisabled />
          <Regions isReadOnly defaultValue="eu" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
