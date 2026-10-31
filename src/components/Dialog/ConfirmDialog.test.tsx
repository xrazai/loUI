import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { ConfirmDialog } from './ConfirmDialog';
import type { ConfirmDialogProps } from './ConfirmDialog';

const none = () => document.querySelector('[role="alertdialog"]') === null;

function DeleteOrder(props: Partial<ConfirmDialogProps>) {
  return (
    <main>
      <ConfirmDialog
        trigger={<Button variant="danger">Delete order</Button>}
        title="Delete order #1048?"
        description="The order and its 14 lines will be removed. This can't be undone."
        confirmLabel="Delete order"
        onConfirm={() => undefined}
        {...props}
      />
    </main>
  );
}

describe('ConfirmDialog', () => {
  it('is an alert dialog with the question as title and the consequence as description', async () => {
    const screen = await renderWithProvider(<DeleteOrder />);
    await screen.getByRole('button', { name: 'Delete order' }).click();
    const dialog = screen.getByRole('alertdialog', { name: 'Delete order #1048?' });
    await expect.element(dialog).toBeVisible();
    await expect
      .element(dialog)
      .toHaveAccessibleDescription(
        "The order and its 14 lines will be removed. This can't be undone.",
      );
  });

  it('puts the initial focus on Cancel', async () => {
    const screen = await renderWithProvider(<DeleteOrder />);
    await screen.getByRole('button', { name: 'Delete order' }).click();
    await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('does not confirm when Enter or Space is pressed right after opening with the keyboard', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    const trigger = screen.getByRole('button', { name: 'Delete order' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
    await expect.poll(() => none()).toBe(true);
    await expect.element(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms with the danger-solid button that names the action, then closes', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    await screen.getByRole('button', { name: 'Delete order' }).click();
    const confirm = screen.getByRole('alertdialog').getByRole('button', { name: 'Delete order' });
    expect(confirm.element().getAttribute('data-variant')).toBe('danger-solid');
    await confirm.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await expect.poll(() => none()).toBe(true);
  });

  it('can be confirmed by keyboard: Tab to the confirm button, Enter', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    await screen.getByRole('button', { name: 'Delete order' }).click();
    await userEvent.tab();
    await expect
      .element(screen.getByRole('alertdialog').getByRole('button', { name: 'Delete order' }))
      .toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels with the Cancel button and with Escape, restoring focus to the trigger', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteOrder onConfirm={onConfirm} />);
    const trigger = screen.getByRole('button', { name: 'Delete order' });
    await trigger.click();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    await expect.poll(() => none()).toBe(true);
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('alertdialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => none()).toBe(true);
    await expect.element(trigger).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('is not dismissed by a press outside, because the user has to answer', async () => {
    const screen = await renderWithProvider(<DeleteOrder />);
    await screen.getByRole('button', { name: 'Delete order' }).click();
    const overlay = document.querySelector<HTMLElement>('[class*="overlay"]') as HTMLElement;
    await userEvent.click(overlay, { position: { x: 4, y: 4 } });
    await expect.element(screen.getByRole('alertdialog')).toBeVisible();
  });

  it('can focus the confirm button for a non-destructive confirmation, with the primary tone', async () => {
    const screen = await renderWithProvider(
      <DeleteOrder
        tone="neutral"
        initialFocus="confirm"
        title="Send invoice?"
        description="The customer receives it by email."
        confirmLabel="Send invoice"
      />,
    );
    await screen.getByRole('button', { name: 'Delete order' }).click();
    const confirm = screen.getByRole('alertdialog').getByRole('button', { name: 'Send invoice' });
    await expect.element(confirm).toHaveFocus();
    expect(confirm.element().getAttribute('data-variant')).toBe('primary');
  });

  it('keeps the dialog open after confirming when closeOnConfirm is false, and shows pending', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(
      <DeleteOrder defaultOpen closeOnConfirm={false} isPending onConfirm={onConfirm} />,
    );
    const confirm = screen.getByRole('alertdialog').getByRole('button', { name: 'Delete order' });
    expect(confirm.element().getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(confirm, { force: true });
    expect(onConfirm).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('alertdialog')).toBeVisible();
  });

  it('is controlled through isOpen', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <DeleteOrder
          isOpen={open}
          onOpenChange={(value) => {
            onOpenChange(value);
            setOpen(value);
          }}
        />
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect.element(screen.getByRole('alertdialog')).toBeVisible();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(() => none()).toBe(true);
  });

  it('uses the pt-BR catalog for Cancel, a provider override and an instance override', async () => {
    const pt = await renderWithProvider(
      <DeleteOrder
        defaultOpen
        title="Excluir pedido #1048?"
        description="O pedido será removido."
        confirmLabel="Excluir pedido"
      />,
      { locale: 'pt-BR' },
    );
    await expect.element(pt.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    await pt.unmount();
    const provider = await renderWithProvider(<DeleteOrder defaultOpen />, {
      messages: { Dialog: { cancel: 'Keep order' } },
    });
    await expect.element(provider.getByRole('button', { name: 'Keep order' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <DeleteOrder defaultOpen messages={{ cancel: 'Go back' }} />,
    );
    await expect.element(instance.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  it('has no axe violations with the confirmation open', async () => {
    const screen = await renderWithProvider(<DeleteOrder />);
    await screen.getByRole('button', { name: 'Delete order' }).click();
    await expect.element(screen.getByRole('alertdialog')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });
});
