import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { Inline } from '../Inline';
import { borderContrast, cssColorToHex, tokenColor } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Select } from './Select';
import type { SelectProps } from './Select';

const regions = [
  { value: 'eu', label: 'Frankfurt' },
  { value: 'us', label: 'Virginia' },
  { value: 'sa', label: 'Sao Paulo' },
];

function Regions(props: Partial<SelectProps>) {
  return <Select label="Region" options={regions} {...props} />;
}

describe('Select', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('names the trigger with its label and shows the placeholder from messages', async () => {
    const screen = await renderWithProvider(<Regions description="Where data is stored." />);
    const trigger = screen.getByRole('button', { name: /Region/ });
    await expect.element(trigger).toHaveTextContent('Select an option');
    await expect.element(trigger).toHaveAccessibleDescription('Where data is stored.');
    expect(trigger.element().getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('opens a listbox with the options and selects one by clicking', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Regions onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: /Region/ });
    await trigger.click();
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getByRole('option').elements()).toHaveLength(3);
    await screen.getByRole('option', { name: 'Virginia' }).click();
    await expect.element(trigger).toHaveTextContent('Virginia');
    expect(onChange).toHaveBeenLastCalledWith('us');
    await expect.poll(() => document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('opens with the arrow keys, supports typeahead, Enter selects, Escape restores focus', async () => {
    const screen = await renderWithProvider(<Regions />);
    const trigger = screen.getByRole('button', { name: /Region/ });
    await userEvent.tab();
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('s');
    await expect.element(screen.getByRole('option', { name: 'Sao Paulo' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(trigger).toHaveTextContent('Sao Paulo');
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="listbox"]')).toBeNull();
    await expect.element(trigger).toHaveFocus();
  });

  it('selects by prefix when typing on the closed trigger', async () => {
    const screen = await renderWithProvider(<Regions />);
    const trigger = screen.getByRole('button', { name: /Region/ });
    await userEvent.tab();
    await userEvent.keyboard('v');
    await expect.element(trigger).toHaveTextContent('Virginia');
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('moves with Home and End and the arrow keys inside the list', async () => {
    const screen = await renderWithProvider(<Regions />);
    await screen.getByRole('button', { name: /Region/ }).click();
    await userEvent.keyboard('{End}');
    await expect.element(screen.getByRole('option', { name: 'Sao Paulo' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect.element(screen.getByRole('option', { name: 'Frankfurt' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('option', { name: 'Virginia' })).toHaveFocus();
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('eu');
      return (
        <>
          <Regions value={value} onChange={setValue} />
          <output>{String(value)}</output>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    await expect
      .element(controlled.getByRole('button', { name: /Region/ }))
      .toHaveTextContent('Frankfurt');
    await controlled.getByRole('button', { name: /Region/ }).click();
    await controlled.getByRole('option', { name: 'Sao Paulo' }).click();
    expect(controlled.container.querySelector('output')?.textContent).toBe('sa');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Regions defaultValue="us" />);
    await expect
      .element(uncontrolled.getByRole('button', { name: /Region/ }))
      .toHaveTextContent('Virginia');
  });

  it('submits name and value through the hidden native select', async () => {
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
    await screen.getByRole('button', { name: /Region/ }).click();
    await screen.getByRole('option', { name: 'Sao Paulo' }).click();
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('region')).toBe('sa');
  });

  it('is required: no error before a submit attempt, error after', async () => {
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
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Choose a region.');
    await expect.element(screen.getByRole('button', { name: /Region/ })).toHaveFocus();
  });

  it('marks the select invalid when controlled and links the error', async () => {
    const screen = await renderWithProvider(<Regions isInvalid errorMessage="Choose a region." />);
    const trigger = screen.getByRole('button', { name: /Region/ });
    await expect.element(trigger).toHaveAccessibleDescription('Choose a region.');
    expect(trigger.element().closest('[data-invalid]')).not.toBeNull();
  });

  it('takes the placeholder from messages: pt-BR, provider override and instance override', async () => {
    const ptBR = await renderWithProvider(<Regions label="Região" />, { locale: 'pt-BR' });
    await expect
      .element(ptBR.getByRole('button', { name: /Região/ }))
      .toHaveTextContent('Selecione uma opção');
    await ptBR.unmount();
    const provider = await renderWithProvider(<Regions />, {
      messages: { Select: { placeholder: 'Pick one' } },
    });
    await expect
      .element(provider.getByRole('button', { name: /Region/ }))
      .toHaveTextContent('Pick one');
    await provider.unmount();
    const instance = await renderWithProvider(<Regions messages={{ placeholder: 'Choose' }} />);
    await expect
      .element(instance.getByRole('button', { name: /Region/ }))
      .toHaveTextContent('Choose');
    await instance.unmount();
    const prop = await renderWithProvider(<Regions placeholder="Anywhere" />);
    await expect
      .element(prop.getByRole('button', { name: /Region/ }))
      .toHaveTextContent('Anywhere');
  });

  it('shows the required marker from messages', async () => {
    const screen = await renderWithProvider(<Regions isRequired />, {
      messages: { Field: { requiredMark: '(required)' } },
    });
    expect(screen.container.querySelector('[aria-hidden="true"]')?.textContent).toBe('(required)');
  });

  it('disables the select and the listed options', async () => {
    const disabled = await renderWithProvider(<Regions isDisabled />);
    await expect.element(disabled.getByRole('button', { name: /Region/ })).toBeDisabled();
    await disabled.unmount();
    const screen = await renderWithProvider(
      <Regions
        options={[
          { value: 'eu', label: 'Frankfurt' },
          { value: 'us', label: 'Virginia', isDisabled: true },
          { value: 'sa', label: 'Sao Paulo' },
        ]}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('option', { name: 'Virginia' }).element().getAttribute('aria-disabled'),
    ).toBe('true');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(screen.getByRole('option', { name: 'Sao Paulo' })).toHaveFocus();
  });

  it('renders sections with captions', async () => {
    const screen = await renderWithProvider(
      <Regions
        options={[
          { id: 'eu', label: 'Europe', options: [{ value: 'fra', label: 'Frankfurt' }] },
          { id: 'am', label: 'Americas', options: [{ value: 'va', label: 'Virginia' }] },
        ]}
      />,
    );
    await screen.getByRole('button', { name: /Region/ }).click();
    await expect.element(screen.getByRole('group', { name: 'Europe' })).toBeInTheDocument();
    await expect.element(screen.getByRole('group', { name: 'Americas' })).toBeInTheDocument();
    expect(screen.getByRole('option').elements()).toHaveLength(2);
  });

  it('marks the selected option with a check icon', async () => {
    const screen = await renderWithProvider(<Regions defaultValue="us" />);
    await screen.getByRole('button', { name: /Region/ }).click();
    const selected = screen.getByRole('option', { name: 'Virginia' }).element();
    expect(selected.getAttribute('aria-selected')).toBe('true');
    expect(selected.querySelector('svg')).not.toBeNull();
    expect(
      screen.getByRole('option', { name: 'Frankfurt' }).element().querySelector('svg'),
    ).toBeNull();
  });

  it('renders the sizes at 32, 40 and 48px', async () => {
    const screen = await renderWithProvider(
      <>
        <Regions label="Small" size="sm" />
        <Regions label="Medium" />
        <Regions label="Large" size="lg" />
      </>,
    );
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        getComputedStyle(screen.getByRole('button', { name: new RegExp(name) }).element()).height,
    );
    expect(heights).toEqual(['32px', '40px', '48px']);
  });

  it('styles the overlay: raised surface, overlay shadow, radius lg, dropdown layer, 36px items', async () => {
    const screen = await renderWithProvider(<Regions />);
    await screen.getByRole('button', { name: /Region/ }).click();
    const popover = screen
      .getByRole('listbox')
      .element()
      .closest('[data-trigger="Select"]') as HTMLElement;
    const style = getComputedStyle(popover);
    expect(cssColorToHex(style.backgroundColor)).toBe(tokenColor('--ds-surface-raised'));
    expect(style.borderTopLeftRadius).toBe('10px');
    expect(style.boxShadow).not.toBe('none');
    expect(style.zIndex).toBe('50');
    expect(
      screen.getByRole('option', { name: 'Frankfurt' }).element().getBoundingClientRect().height,
    ).toBe(36);
    expect(popover.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      screen
        .getByRole('button', { name: /Region/ })
        .element()
        .getBoundingClientRect().width - 1,
    );
  });

  it('keeps the trigger border at 3:1 at rest, hover, focus and invalid, with no background change', async () => {
    const screen = await renderWithProvider(
      <>
        <Regions label="Rest" />
        <Regions label="Bad" isInvalid errorMessage="No." />
      </>,
    );
    const trigger = screen.getByRole('button', { name: /Rest/ });
    expect(borderContrast(trigger.element())).toBeGreaterThanOrEqual(3);
    const background = getComputedStyle(trigger.element()).backgroundColor;
    await userEvent.hover(trigger);
    await expectHovered(screen.container);
    await expect.poll(() => borderContrast(trigger.element())).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(trigger.element()).backgroundColor).toBe(background);
    await userEvent.tab();
    await expect.poll(() => borderContrast(trigger.element())).toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(trigger.element()).boxShadow).not.toBe('none');
    expect(
      borderContrast(screen.getByRole('button', { name: /Bad/ }).element()),
    ).toBeGreaterThanOrEqual(3);
  });

  it('keeps the focus ring when the consumer passes onFocus and onBlur', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const screen = await renderWithProvider(<Regions onFocus={onFocus} onBlur={onBlur} />);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(
      getComputedStyle(screen.getByRole('button', { name: /Region/ }).element()).boxShadow,
    ).not.toBe('none');
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards className and ref; warns without an accessible name', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<Regions className="extra" ref={ref} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = { options: regions } as unknown as Parameters<typeof Select>[0];
    await renderWithProvider(<Select {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Select needs an accessible name'));
  });

  describe('axe', () => {
    it('has no violations: closed in default, selected, described, required, invalid, disabled', async () => {
      const screen = await renderWithProvider(
        <main>
          <Regions label="Default" />
          <Regions label="Selected" defaultValue="eu" description="Where data is stored." />
          <Regions label="Required" isRequired />
          <Regions label="Invalid" isInvalid errorMessage="Choose one." />
          <Regions label="Disabled" isDisabled />
          <Select aria-label="Unlabelled" options={regions} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations with the list open, with sections and a selected option', async () => {
      const screen = await renderWithProvider(
        <main>
          <Regions
            defaultValue="va"
            options={[
              { id: 'eu', label: 'Europe', options: [{ value: 'fra', label: 'Frankfurt' }] },
              {
                id: 'am',
                label: 'Americas',
                options: [
                  { value: 'va', label: 'Virginia' },
                  { value: 'sp', label: 'Sao Paulo', isDisabled: true },
                ],
              },
            ]}
          />
        </main>,
      );
      await screen.getByRole('button', { name: /Region/ }).click();
      await expect.element(screen.getByRole('listbox')).toBeVisible();
      await expectNoA11yViolations(document.body);
    });
  });
});

describe('Select fullWidth', () => {
  async function renderRow(props: { fullWidth?: boolean }) {
    return renderWithProvider(
      <div style={{ inlineSize: 700 }}>
        <Inline gap={2} wrap="nowrap">
          <Select label="Region" options={[{ id: "eu", label: "Europe" }]} {...props} />
          <button type="button">Apply</button>
        </Inline>
      </div>,
    );
  }

  it('takes the free space of an Inline row, and not by default', async () => {
    const plain = await renderRow({});
    const plainRoot = plain.container.querySelector('[data-size]') as HTMLElement;
    expect(plainRoot.hasAttribute('data-full-width')).toBe(false);
    const plainWidth = plainRoot.getBoundingClientRect().width;
    await plain.unmount();
    const full = await renderRow({ fullWidth: true });
    const root = full.container.querySelector('[data-full-width="true"]') as HTMLElement;
    const button = full.container.querySelector('button:last-of-type') as HTMLElement;
    expect(root.getBoundingClientRect().width).toBeGreaterThan(plainWidth);
    expect(button.getBoundingClientRect().right).toBeCloseTo(700, 0);
  });
});
