import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Tooltip } from './Tooltip';

const gone = () => document.querySelector('[role="tooltip"]') === null;

/**
 * React Aria only opens a tooltip on hover when its last interaction was a pointer move, and
 * the browser fires pointerenter before the first pointermove. Move the pointer over the page
 * first, as a real user always has.
 */
async function hover(target: Parameters<typeof userEvent.hover>[0]) {
  await userEvent.hover(document.body);
  await userEvent.hover(target);
}

describe('Tooltip', () => {
  it('opens on keyboard focus without a delay and describes the trigger', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order">
        <Button>New</Button>
      </Tooltip>,
    );
    expect(gone()).toBe(true);
    await userEvent.tab();
    const tip = screen.getByRole('tooltip');
    await expect.element(tip).toBeVisible();
    await expect.element(tip).toHaveTextContent('Create a new order');
    const trigger = screen.getByRole('button', { name: 'New' });
    await expect.element(trigger).toHaveAccessibleDescription('Create a new order');
  });

  it('opens on hover after the delay and closes when the pointer leaves', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order" delay={50}>
        <Button>New</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'New' });
    await hover(trigger);
    await expect.element(screen.getByRole('tooltip')).toBeVisible();
    await userEvent.unhover(trigger);
    await expect.poll(gone).toBe(true);
  });

  it('closes with Escape while the trigger keeps focus (WCAG 1.4.13)', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order">
        <Button>New</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    await expect.element(screen.getByRole('tooltip')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(gone).toBe(true);
    await expect.element(screen.getByRole('button', { name: 'New' })).toHaveFocus();
  });

  it('stays open while the pointer is over the tooltip itself (hoverable)', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order" delay={50} closeDelay={300}>
        <Button>New</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'New' });
    await hover(trigger);
    const tip = screen.getByRole('tooltip');
    await expect.element(tip).toBeVisible();
    await userEvent.hover(tip);
    // Past the close delay the tooltip is still there because the pointer rests on it.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect.element(screen.getByRole('tooltip')).toBeVisible();
  });

  it('shows the shortcut in mono type, muted on the ink surface', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Search" shortcut="Ctrl+K">
        <Button>Find</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    const tip = screen.getByRole('tooltip');
    expect(tip.element().textContent).toContain('Ctrl+K');
    const shortcut = screen.getByText('Ctrl+K').element();
    const style = getComputedStyle(shortcut);
    expect(style.fontFamily).toContain('Geist Mono');
    expect(style.color).not.toBe(getComputedStyle(tip.element()).color);
  });

  it('uses the ink style: primary background and foreground', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order">
        <Button>New</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    const tip = screen.getByRole('tooltip').element();
    const root = getComputedStyle(document.documentElement);
    const probe = document.createElement('i');
    probe.style.color = root.getPropertyValue('--ds-primary-bg');
    document.body.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.remove();
    expect(getComputedStyle(tip).backgroundColor).toBe(ink);
  });

  it.each([
    ['top', 'above'],
    ['bottom', 'below'],
  ] as const)('places the tooltip %s the trigger', async (placement, where) => {
    const screen = await renderWithProvider(
      <div style={{ padding: 80 }}>
        <Tooltip content="Create a new order" placement={placement}>
          <Button>New</Button>
        </Tooltip>
      </div>,
    );
    await userEvent.tab();
    const tip = screen.getByRole('tooltip').element().getBoundingClientRect();
    const trigger = screen.getByRole('button').element().getBoundingClientRect();
    if (where === 'above') expect(tip.bottom).toBeLessThanOrEqual(trigger.top);
    else expect(tip.top).toBeGreaterThanOrEqual(trigger.bottom);
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Tooltip
          content="Create a new order"
          isOpen={open}
          onOpenChange={(value) => {
            onOpenChange(value);
            setOpen(value);
          }}
        >
          <Button>New</Button>
        </Tooltip>
      );
    }
    const screen = await renderWithProvider(<Controlled />);
    await expect.element(screen.getByRole('tooltip')).toBeVisible();
    await userEvent.tab();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect.poll(gone).toBe(true);
  });

  it('supports defaultOpen for uncontrolled use', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order" defaultOpen>
        <Button>New</Button>
      </Tooltip>,
    );
    await expect.element(screen.getByRole('tooltip')).toBeVisible();
  });

  it('never opens when disabled', async () => {
    await renderWithProvider(
      <Tooltip content="Create a new order" isDisabled>
        <Button>New</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(gone()).toBe(true);
  });

  it('uses the tooltip layer', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Create a new order" defaultOpen>
        <Button>New</Button>
      </Tooltip>,
    );
    const tip = screen.getByRole('tooltip').element();
    expect(getComputedStyle(tip).zIndex).toBe('60');
  });

  it('shows content supplied by the consumer in another locale', async () => {
    const screen = await renderWithProvider(
      <Tooltip content="Criar novo pedido" defaultOpen>
        <Button>Novo</Button>
      </Tooltip>,
      { locale: 'pt-BR' },
    );
    await expect.element(screen.getByRole('tooltip')).toHaveTextContent('Criar novo pedido');
  });

  it('has no axe violations with the tooltip open', async () => {
    const screen = await renderWithProvider(
      <main>
        <Tooltip content="Create a new order" shortcut="Ctrl+N" defaultOpen>
          <Button>New</Button>
        </Tooltip>
      </main>,
    );
    await expect.element(screen.getByRole('tooltip')).toBeVisible();
    await expect.poll(() => document.getAnimations().length).toBe(0);
    await expectNoA11yViolations(document.body);
  });
});
