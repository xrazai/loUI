/**
 * Keyboard contract: Button / link, Checkbox, Switch.
 * Spec: AGENTS.md section 8, rows "Button / link" and "Checkbox / switch" (TEST-004).
 */
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { Link } from '../../components/Link';
import { Switch } from '../../components/Switch';
import { Toggle } from '../../components/Toggle';
import { renderWithProvider } from '../render';
import { expectFocus, press, tabOrder } from './contract';

function Around({ children }: { children: React.ReactNode }) {
  return (
    <>
      <button type="button">Before</button>
      {children}
      <button type="button">After</button>
    </>
  );
}

describe('keyboard contract: button and link', () => {
  it('Tab reaches the button once; Enter and Space both activate it', async () => {
    const onPress = vi.fn();
    await renderWithProvider(
      <Around>
        <Button onPress={onPress}>Save changes</Button>
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(2)).toEqual(['Save changes', 'After']);
    await userEvent.tab({ shift: true });
    await expectFocus('Save changes');
    await press('{Enter}');
    expect(onPress).toHaveBeenCalledTimes(1);
    await press(' ');
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('a disabled button is skipped by Tab and never activates', async () => {
    const onPress = vi.fn();
    await renderWithProvider(
      <Around>
        <Button isDisabled onPress={onPress}>
          Save changes
        </Button>
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['After']);
    await press('{Enter} ');
    expect(onPress).not.toHaveBeenCalled();
  });

  it('a link activates with Enter but not with Space', async () => {
    const onPress = vi.fn();
    await renderWithProvider(
      <Around>
        <Link href="#target" onPress={onPress}>
          Pricing details
        </Link>
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Pricing details']);
    await press(' ');
    expect(onPress).not.toHaveBeenCalled();
    await press('{Enter}');
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('keyboard contract: checkbox', () => {
  it('is one Tab stop and Space toggles it', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Around>
        <Checkbox label="Weekly summary" onChange={onChange} />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Weekly summary']);
    const box = screen.getByRole('checkbox', { name: 'Weekly summary' });
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.element(box).toBeChecked();
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
    await expect.element(box).not.toBeChecked();
  });

  it('Enter does not toggle a checkbox (native behavior)', async () => {
    const onChange = vi.fn();
    await renderWithProvider(
      <Around>
        <Checkbox label="Weekly summary" onChange={onChange} />
      </Around>,
    );
    await userEvent.tab();
    await userEvent.tab();
    await press('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('a disabled checkbox is skipped by Tab', async () => {
    await renderWithProvider(
      <Around>
        <Checkbox label="Weekly summary" isDisabled />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['After']);
  });
});

describe('keyboard contract: switch', () => {
  it('is one Tab stop and Space toggles it', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Around>
        <Switch label="Email notifications" onChange={onChange} />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Email notifications']);
    const control = screen.getByRole('switch', { name: 'Email notifications' });
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.element(control).toBeChecked();
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('a disabled switch is skipped by Tab', async () => {
    await renderWithProvider(
      <Around>
        <Switch label="Email notifications" isDisabled />
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['After']);
  });
});

describe('keyboard contract: toggle button', () => {
  it('is one Tab stop; Space and Enter both flip aria-pressed', async () => {
    const onChange = vi.fn();
    const screen = await renderWithProvider(
      <Around>
        <Toggle onChange={onChange}>Show archived</Toggle>
      </Around>,
    );
    await userEvent.tab();
    expect(await tabOrder(1)).toEqual(['Show archived']);
    const toggle = screen.getByRole('button', { name: 'Show archived' });
    await press(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    await press('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(await tabOrder(1)).toEqual(['After']);
  });
});
