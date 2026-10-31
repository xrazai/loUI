import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { colorContrastOnPage, cssColorToHex, tokenColor } from '../Field/field.testing';
import { resetMissingNameWarnings } from '../Field/labeling';
import { Switch } from './Switch';

function parts(input: Element) {
  const label = input.closest('label');
  const children = [...(label?.children ?? [])].filter((child) => !child.contains(input));
  const track = children.find((child) => child.querySelector('span') !== null);
  const text = children.find((child) => child !== track);
  if (!(track instanceof HTMLElement)) throw new Error('Switch track not found.');
  const knob = track.firstElementChild;
  if (!(knob instanceof HTMLElement)) throw new Error('Switch knob not found.');
  return { label: label as HTMLElement, track, knob, text };
}

describe('Switch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetMissingNameWarnings();
  });

  it('is a native checkbox with role switch, named by its label', async () => {
    const screen = await renderWithProvider(
      <Switch label="Email notifications" description="Sent every morning." />,
    );
    const toggle = screen.getByRole('switch', { name: 'Email notifications' });
    expect(toggle.element().tagName).toBe('INPUT');
    expect(toggle.element().getAttribute('type')).toBe('checkbox');
    await expect.element(toggle).toHaveAccessibleDescription('Sent every morning.');
  });

  it('toggles with Space and with one click on the label (no double toggle)', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(<Switch label="Alerts" onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Alerts' });
    await userEvent.tab();
    await expect.element(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect.element(toggle).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
    await screen.getByText('Alerts').click();
    await expect.element(toggle).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('toggles when the track is clicked', async () => {
    const screen = await renderWithProvider(<Switch label="Alerts" />);
    const toggle = screen.getByRole('switch', { name: 'Alerts' });
    const { track } = parts(toggle.element());
    await userEvent.click(track);
    await expect.element(toggle).toBeChecked();
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <>
          <Switch label="Controlled" isSelected={on} onChange={setOn} />
          <output>{String(on)}</output>
        </>
      );
    }
    const controlled = await renderWithProvider(<Controlled />);
    await controlled.getByText('Controlled').click();
    expect(controlled.container.querySelector('output')?.textContent).toBe('true');
    await controlled.unmount();
    const uncontrolled = await renderWithProvider(<Switch label="Uncontrolled" defaultSelected />);
    await expect.element(uncontrolled.getByRole('switch', { name: 'Uncontrolled' })).toBeChecked();
  });

  it('places the label at the start (default) or the end of the track', async () => {
    const screen = await renderWithProvider(
      <>
        <Switch label="Start" />
        <Switch label="End" labelPlacement="end" />
      </>,
    );
    const start = parts(screen.getByRole('switch', { name: 'Start' }).element());
    const end = parts(screen.getByRole('switch', { name: 'End' }).element());
    expect(start.text?.getBoundingClientRect().left).toBeLessThan(
      start.track.getBoundingClientRect().left,
    );
    expect(end.track.getBoundingClientRect().left).toBeLessThan(
      end.text?.getBoundingClientRect().left ?? 0,
    );
  });

  it('draws a 36x20 track and a 16px knob that moves when on', async () => {
    const screen = await renderWithProvider(<Switch label="Alerts" />);
    const toggle = screen.getByRole('switch', { name: 'Alerts' });
    const { track, knob } = parts(toggle.element());
    expect(track.getBoundingClientRect().width).toBe(36);
    expect(track.getBoundingClientRect().height).toBe(20);
    expect(knob.getBoundingClientRect().width).toBe(16);
    const off = knob.getBoundingClientRect().left - track.getBoundingClientRect().left;
    expect(off).toBe(2);
    await screen.getByText('Alerts').click();
    await expect
      .poll(() => knob.getBoundingClientRect().left - track.getBoundingClientRect().left)
      .toBe(18);
  });

  it('uses the accent when on, and keeps the off track at 3:1 against the page', async () => {
    const screen = await renderWithProvider(<Switch label="Alerts" />);
    const toggle = screen.getByRole('switch', { name: 'Alerts' });
    const { track } = parts(toggle.element());
    expect(colorContrastOnPage(getComputedStyle(track).backgroundColor)).toBeGreaterThanOrEqual(3);
    await userEvent.hover(screen.getByText('Alerts'));
    await expectHovered(screen.container);
    await expect
      .poll(() => colorContrastOnPage(getComputedStyle(track).backgroundColor))
      .toBeGreaterThanOrEqual(3);
    await userEvent.tab();
    await expect
      .poll(() => colorContrastOnPage(getComputedStyle(track).backgroundColor))
      .toBeGreaterThanOrEqual(3);
    await expect.poll(() => getComputedStyle(track).boxShadow).not.toBe('none');
    await userEvent.keyboard(' ');
    await expect
      .poll(() => cssColorToHex(getComputedStyle(track).backgroundColor))
      .toBe(tokenColor('--ds-accent'));
  });

  it('submits name and value only while on', async () => {
    let data: FormData | undefined;
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Switch label="Alerts" name="alerts" value="enabled" />
        <button type="submit">Save</button>
      </form>,
    );
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.has('alerts')).toBe(false);
    await screen.getByText('Alerts').click();
    await screen.getByRole('button', { name: 'Save' }).click();
    expect(data?.get('alerts')).toBe('enabled');
  });

  it('is required: error only after a failed submit', async () => {
    const screen = await renderWithProvider(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Switch label="Terms" name="terms" isRequired errorMessage="Accept the terms." />
        <button type="submit">Save</button>
      </form>,
    );
    expect(screen.container.querySelector('[role="alert"]')).toBeNull();
    await screen.getByRole('button', { name: 'Save' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('Accept the terms.');
    await expect.element(screen.getByRole('switch', { name: 'Terms' })).toHaveFocus();
  });

  it('shows the required marker from messages', async () => {
    const mark = (container: Element) =>
      container.querySelector('[aria-hidden="true"]')?.textContent;
    const base = await renderWithProvider(<Switch label="Terms" isRequired />);
    expect(mark(base.container)).toBe('*');
    await base.unmount();
    const provider = await renderWithProvider(<Switch label="Termos" isRequired />, {
      locale: 'pt-BR',
      messages: { Field: { requiredMark: '(obrigatório)' } },
    });
    expect(mark(provider.container)).toBe('(obrigatório)');
  });

  it('is disabled with the shared opacity token and read only keeps its state', async () => {
    const screen = await renderWithProvider(
      <>
        <Switch label="Disabled" isDisabled />
        <Switch label="Read only" isReadOnly defaultSelected />
      </>,
    );
    const disabled = screen.getByRole('switch', { name: 'Disabled' });
    await expect.element(disabled).toBeDisabled();
    expect(
      Number(getComputedStyle(disabled.element().closest('label') as Element).opacity),
    ).toBeCloseTo(0.35, 2);
    await screen.getByText('Read only').click();
    await expect.element(screen.getByRole('switch', { name: 'Read only' })).toBeChecked();
  });

  it('accepts aria-label and renders a compact track without a label', async () => {
    const screen = await renderWithProvider(<Switch aria-label="Dark mode" />);
    const toggle = screen.getByRole('switch', { name: 'Dark mode' });
    await expect.element(toggle).toBeInTheDocument();
    expect(parts(toggle.element()).label.getBoundingClientRect().width).toBeLessThan(100);
  });

  it('warns once in development when there is no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const props = {} as unknown as Parameters<typeof Switch>[0];
    await renderWithProvider(<Switch {...props} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Switch needs an accessible name'));
  });

  it('forwards className, ref and inputRef; composes consumer onFocus', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    const screen = await renderWithProvider(
      <Switch label="A" className="extra" ref={ref} inputRef={inputRef} onFocus={onFocus} />,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole('switch', { name: 'A' })
        .element()
        .closest('label')
        ?.hasAttribute('data-focus-visible'),
    ).toBe(true);
  });

  describe('axe', () => {
    it('has no violations: off, on, label at end, with description, unlabelled', async () => {
      const screen = await renderWithProvider(
        <main>
          <Switch label="Off" />
          <Switch label="On" defaultSelected />
          <Switch label="End" labelPlacement="end" description="Track first." />
          <Switch aria-label="Dark mode" />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no violations: required, invalid, disabled, read only', async () => {
      const screen = await renderWithProvider(
        <main>
          <Switch label="Required" isRequired />
          <Switch label="Invalid" isInvalid errorMessage="Fix this." />
          <Switch label="Disabled" isDisabled />
          <Switch label="Read only" isReadOnly defaultSelected />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
