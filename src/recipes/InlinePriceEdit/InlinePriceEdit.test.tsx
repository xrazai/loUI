import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProvider } from '../../test/render';
import { RecipeHost } from '../RecipeHost';
import { expectNoViolationsOnceSettled } from '../settled';
import { InlinePriceEdit } from './InlinePriceEdit';
import type { InlinePriceEditProps } from './InlinePriceEdit';

async function setup(props: InlinePriceEditProps = {}) {
  return renderWithProvider(
    <RecipeHost>
      <InlinePriceEdit initialPrice={1250} {...props} />
    </RecipeHost>,
  );
}

const trigger = (screen: Awaited<ReturnType<typeof setup>>, price = '$12.50') =>
  screen.getByRole('button', { name: `Edit price of Linen, white: ${price}` });

describe('InlinePriceEdit', () => {
  it('opens the field on press with the old value, focused', async () => {
    const screen = await setup();
    await userEvent.click(trigger(screen));
    const field = screen.getByRole('textbox', { name: 'Price of Linen, white' });
    await expect.element(field).toHaveValue('$12.50');
    await expect.element(field).toHaveFocus();
  });

  it('opens from the keyboard', async () => {
    const screen = await setup();
    trigger(screen).element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('textbox')).toHaveFocus();
  });

  it('confirms with Enter, returns focus to the trigger and announces the saved price', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave });
    await userEvent.click(trigger(screen));
    await userEvent.keyboard('{Control>}a{/Control}{Delete}1800{Enter}');
    expect(onSave).toHaveBeenCalledExactlyOnceWith(1800);
    await expect.element(trigger(screen, '$18.00')).toHaveFocus();
    await expect.element(screen.getByRole('status')).toHaveTextContent('Price saved: $18.00');
  });

  it('cancels with Escape: restores the old value, saves nothing, focus on the trigger', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave });
    await userEvent.click(trigger(screen));
    await userEvent.keyboard('999{Escape}');
    expect(onSave).not.toHaveBeenCalled();
    await expect.element(trigger(screen)).toHaveFocus();
  });

  it('confirms on blur and leaves focus where the user moved it', async () => {
    const onSave = vi.fn();
    const screen = await renderWithProvider(
      <RecipeHost>
        <InlinePriceEdit initialPrice={1250} onSave={onSave} />
        <button type="button">Elsewhere</button>
      </RecipeHost>,
    );
    await userEvent.click(trigger(screen));
    await userEvent.keyboard('{Control>}a{/Control}{Delete}700');
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith(700);
    await expect.element(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
    await expect.element(trigger(screen, '$7.00')).toBeVisible();
  });

  it('saves once when Enter is followed by the blur it causes', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave });
    await userEvent.click(trigger(screen));
    await userEvent.keyboard('5{Enter}');
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows the inherited price as the placeholder while empty, and empty means inherit', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave, inheritedPrice: 4990 });
    await userEvent.click(trigger(screen));
    await userEvent.keyboard('{Control>}a{/Control}{Delete}');
    const field = screen.getByRole('textbox');
    await expect.element(field).toHaveValue('');
    await expect.element(field).toHaveAttribute('placeholder', '$49.90');
    await userEvent.keyboard('{Enter}');
    expect(onSave).toHaveBeenCalledExactlyOnceWith(null);
    await expect.element(trigger(screen, '$49.90')).toBeVisible();
  });

  it('does not save when nothing changed', async () => {
    const onSave = vi.fn();
    const screen = await setup({ onSave });
    await userEvent.click(trigger(screen));
    await userEvent.keyboard('{Enter}');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('has no axe violations: reading and editing', async () => {
    const screen = await setup();
    await expectNoViolationsOnceSettled();
    await userEvent.click(trigger(screen));
    await expectNoViolationsOnceSettled();
  });
});
