import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { expectHovered } from '../../test/hover';
import { renderWithProvider } from '../../test/render';
import { contrastRatio } from '../../utils/color';
import { cssColorToHex, tokenColor } from '../Field/field.testing';
import { Button } from '../Button';
import { Input } from '../Input';
import { Popover } from './Popover';

const closed = () => document.querySelector('[role="dialog"]') === null;

function Filters(props: Partial<React.ComponentProps<typeof Popover>>) {
  return (
    <main>
      <Popover trigger={<Button>Filters</Button>} label="Filters" {...props}>
        <Input label="Customer" />
        <Button>Apply</Button>
      </Popover>
    </main>
  );
}

describe('Popover', () => {
  it('opens from the trigger and exposes aria-expanded and aria-haspopup', async () => {
    const screen = await renderWithProvider(<Filters />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger.element().getAttribute('aria-expanded')).toBe('false');
    expect(trigger.element().getAttribute('aria-haspopup')).toBe('dialog');
    await trigger.click();
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    expect(trigger.element().getAttribute('aria-expanded')).toBe('true');
    expect(trigger.element().getAttribute('aria-controls')).toBe(
      screen.getByRole('dialog').element().id,
    );
  });

  it('opens with Enter, moves focus in and restores it to the trigger on Escape', async () => {
    const screen = await renderWithProvider(<Filters />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog');
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await expect.poll(closed).toBe(true);
    await expect.element(trigger).toHaveFocus();
  });

  it('closes on an outside press and restores focus', async () => {
    const screen = await renderWithProvider(
      <div>
        <p>Elsewhere on the page</p>
        <Filters />
      </div>,
    );
    await screen.getByRole('button', { name: 'Filters' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    // The modal popover puts an underlay over the page, which takes the press.
    await userEvent.click(screen.getByText('Elsewhere on the page'), { force: true });
    await expect.poll(closed).toBe(true);
  });

  it('lets interactive content work: typing in a field keeps the popover open', async () => {
    const screen = await renderWithProvider(<Filters />);
    await screen.getByRole('button', { name: 'Filters' }).click();
    const field = screen.getByRole('textbox', { name: 'Customer' });
    await userEvent.click(field);
    await userEvent.keyboard('Northwind');
    await expect.element(field).toHaveValue('Northwind');
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('closes from inside through the close render prop', async () => {
    const screen = await renderWithProvider(
      <Popover trigger={<Button>Options</Button>} label="Options">
        {({ close }) => <Button onPress={close}>Done</Button>}
      </Popover>,
    );
    await screen.getByRole('button', { name: 'Options' }).click();
    await screen.getByRole('button', { name: 'Done' }).click();
    await expect.poll(closed).toBe(true);
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Filters
          isOpen={open}
          onOpenChange={(value) => {
            onOpenChange(value);
            setOpen(value);
          }}
        />
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(closed).toBe(true);
  });

  it('supports defaultOpen for uncontrolled use', async () => {
    const screen = await renderWithProvider(<Filters defaultOpen />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('keeps a field boundary at 3:1 on the raised popover surface, at rest and hovered (TOK-014)', async () => {
    const screen = await renderWithProvider(<Filters defaultOpen />);
    const dialog = screen.getByRole('dialog').element() as HTMLElement;
    const input = screen.getByRole('textbox', { name: 'Customer' });
    const box = input.element().parentElement as HTMLElement;
    // The nearest ancestor that paints a background is the popover surface.
    const painted = (element: HTMLElement): HTMLElement =>
      getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)' && element.parentElement
        ? painted(element.parentElement)
        : element;
    const surface = () => cssColorToHex(getComputedStyle(painted(dialog)).backgroundColor);
    const boundary = () =>
      contrastRatio(cssColorToHex(getComputedStyle(box).borderTopColor), surface());
    expect(surface()).toBe(tokenColor('--ds-surface-raised'));
    expect(boundary()).toBeGreaterThanOrEqual(3);
    await userEvent.hover(input);
    await expectHovered(screen.container.ownerDocument.body);
    await expect.poll(boundary).toBeGreaterThanOrEqual(3);
  });

  it('places the popover below the trigger by default and above it with placement top', async () => {
    const screen = await renderWithProvider(
      <div style={{ padding: 200 }}>
        <Filters placement="top" defaultOpen />
      </div>,
    );
    const trigger = screen
      .getByRole('button', { name: 'Filters' })
      .element()
      .getBoundingClientRect();
    const dialog = screen.getByRole('dialog').element().getBoundingClientRect();
    expect(dialog.bottom).toBeLessThanOrEqual(trigger.top);
  });

  it('draws an arrow when asked', async () => {
    await renderWithProvider(<Filters showArrow defaultOpen />);
    expect(document.querySelector('svg[viewBox="0 0 8 4"]')).not.toBeNull();
  });

  it('uses the popover layer, the raised surface and the overlay shadow', async () => {
    await renderWithProvider(<Filters defaultOpen />);
    const surface = document.querySelector<HTMLElement>('[data-trigger="DialogTrigger"]');
    expect(surface).not.toBeNull();
    const style = getComputedStyle(surface as HTMLElement);
    expect(style.zIndex).toBe('55');
    expect(style.boxShadow).not.toBe('none');
  });

  it('takes its content and name from the consumer, so it can be translated', async () => {
    const screen = await renderWithProvider(
      <Popover trigger={<Button>Filtros</Button>} label="Filtros">
        <Button>Aplicar</Button>
      </Popover>,
      { locale: 'pt-BR' },
    );
    await screen.getByRole('button', { name: 'Filtros' }).click();
    await expect.element(screen.getByRole('dialog', { name: 'Filtros' })).toBeVisible();
  });

  it('has no axe violations with the popover open', async () => {
    const screen = await renderWithProvider(<Filters showArrow />);
    await screen.getByRole('button', { name: 'Filters' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });
});
