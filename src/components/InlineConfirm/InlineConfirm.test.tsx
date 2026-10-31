import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { InlineConfirm } from './InlineConfirm';
import type { InlineConfirmProps } from './InlineConfirm';

function DeleteLine(props: Partial<InlineConfirmProps>) {
  return (
    <main>
      <InlineConfirm
        label="Delete line"
        prompt="Remove this line? This can't be undone."
        onConfirm={() => undefined}
        {...props}
      />
    </main>
  );
}

describe('InlineConfirm', () => {
  it('shows only the trigger until it is pressed, then the prompt with Cancel and confirm', async () => {
    const screen = await renderWithProvider(<DeleteLine />);
    expect(screen.getByRole('group').elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Delete line' }).click();
    const group = screen.getByRole('group', { name: "Remove this line? This can't be undone." });
    await expect.element(group).toBeVisible();
    await expect.element(group.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect.element(group.getByRole('button', { name: 'Delete line' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Delete line' }).elements()).toHaveLength(1);
  });

  it('puts the initial focus on Cancel, not on the confirm button', async () => {
    const screen = await renderWithProvider(<DeleteLine />);
    await screen.getByRole('button', { name: 'Delete line' }).click();
    await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('does not confirm when Enter is pressed right after opening with the keyboard', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteLine onConfirm={onConfirm} />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('button', { name: 'Delete line' })).toHaveFocus();
    expect(screen.getByRole('group').elements()).toHaveLength(0);
  });

  it('can start with the focus on the confirm button when configured', async () => {
    const screen = await renderWithProvider(
      <DeleteLine initialFocus="confirm" tone="neutral" label="Send invoice" />,
    );
    await screen.getByRole('button', { name: 'Send invoice' }).click();
    const confirm = screen.getByRole('group').getByRole('button', { name: 'Send invoice' });
    await expect.element(confirm).toHaveFocus();
    expect(confirm.element().getAttribute('data-variant')).toBe('primary');
  });

  it('confirms with the danger-solid button, closes the prompt and returns focus to the trigger', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteLine onConfirm={onConfirm} />);
    await screen.getByRole('button', { name: 'Delete line' }).click();
    const confirm = screen.getByRole('group').getByRole('button', { name: 'Delete line' });
    expect(confirm.element().getAttribute('data-variant')).toBe('danger-solid');
    await userEvent.tab();
    await expect.element(confirm).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('group').elements()).toHaveLength(0);
    await expect.element(screen.getByRole('button', { name: 'Delete line' })).toHaveFocus();
  });

  it('cancels with the Cancel button and returns focus to the trigger', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteLine onConfirm={onConfirm} />);
    await screen.getByRole('button', { name: 'Delete line' }).click();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    expect(onConfirm).not.toHaveBeenCalled();
    await expect.element(screen.getByRole('button', { name: 'Delete line' })).toHaveFocus();
  });

  it('cancels with Escape when focus is inside, and restores focus to the trigger', async () => {
    const onConfirm = vi.fn();
    const screen = await renderWithProvider(<DeleteLine onConfirm={onConfirm} />);
    await screen.getByRole('button', { name: 'Delete line' }).click();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('group').elements()).toHaveLength(0);
    await expect.element(screen.getByRole('button', { name: 'Delete line' })).toHaveFocus();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('scopes Escape: it is not a window listener', async () => {
    const screen = await renderWithProvider(
      <div>
        <Button>Elsewhere</Button>
        <DeleteLine />
      </div>,
    );
    await screen.getByRole('button', { name: 'Delete line' }).click();
    // Focus leaves the prompt, then Escape is pressed on the other control.
    screen.getByRole('button', { name: 'Elsewhere' }).element().focus();
    await userEvent.keyboard('{Escape}');
    await expect.element(screen.getByRole('group')).toBeVisible();
  });

  it('does not close an enclosing Dialog when Escape cancels the prompt, then Escape closes the Dialog', async () => {
    const screen = await renderWithProvider(
      <Dialog title="Order" defaultOpen>
        <InlineConfirm label="Delete line" onConfirm={() => undefined} />
      </Dialog>,
    );
    await screen.getByRole('button', { name: 'Delete line' }).click();
    await expect.element(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('group').elements()).toHaveLength(0);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('uses the default prompt and confirm label from the catalog and props', async () => {
    const screen = await renderWithProvider(
      <main>
        <InlineConfirm
          label="Delete line"
          confirmLabel="Yes, delete line"
          onConfirm={() => undefined}
        />
      </main>,
    );
    await screen.getByRole('button', { name: 'Delete line' }).click();
    await expect.element(screen.getByText('Are you sure?')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Yes, delete line' })).toBeVisible();
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <DeleteLine
          isOpen={open}
          onOpenChange={(value) => {
            onOpenChange(value);
            setOpen(value);
          }}
        />
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect.element(screen.getByRole('group')).toBeVisible();
    await screen.getByRole('button', { name: 'Cancel' }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('group').elements()).toHaveLength(0);
  });

  it('supports defaultOpen and a disabled trigger', async () => {
    const open = await renderWithProvider(<DeleteLine defaultOpen />);
    await expect.element(open.getByRole('group')).toBeVisible();
    await open.unmount();
    const disabled = await renderWithProvider(<DeleteLine isDisabled />);
    await userEvent.click(disabled.getByRole('button', { name: 'Delete line' }), { force: true });
    expect(disabled.getByRole('group').elements()).toHaveLength(0);
  });

  it('uses the pt-BR catalog, a provider override and an instance override', async () => {
    const pt = await renderWithProvider(
      <InlineConfirm label="Excluir linha" onConfirm={() => undefined} defaultOpen />,
      { locale: 'pt-BR' },
    );
    await expect.element(pt.getByText('Tem certeza?')).toBeVisible();
    await expect.element(pt.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    await pt.unmount();
    const provider = await renderWithProvider(<DeleteLine defaultOpen prompt={undefined} />, {
      messages: { InlineConfirm: { cancel: 'Keep line' } },
    });
    await expect.element(provider.getByRole('button', { name: 'Keep line' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <DeleteLine defaultOpen messages={{ cancel: 'Go back' }} />,
    );
    await expect.element(instance.getByRole('button', { name: 'Go back' })).toBeVisible();
  });

  it('has no axe violations in the closed and the asking states', async () => {
    const screen = await renderWithProvider(<DeleteLine />);
    await expectNoA11yViolations(screen.container);
    await screen.getByRole('button', { name: 'Delete line' }).click();
    await expect.element(screen.getByRole('group')).toBeVisible();
    await expectNoA11yViolations(screen.container);
  });
});
