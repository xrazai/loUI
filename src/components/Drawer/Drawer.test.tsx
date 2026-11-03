import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Input } from '../Input';
import { Drawer } from './Drawer';
import type { DrawerProps } from './Drawer';

const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);
const gone = () => document.querySelector('aside') === null;

function Page(props: Partial<DrawerProps>) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  return (
    <main style={{ display: 'flex' }}>
      <div>
        <Button
          onPress={() => {
            setOpen(true);
          }}
        >
          Open filters
        </Button>
        <Button>Page action</Button>
      </div>
      <Drawer title="Filters" {...props} isOpen={open} onOpenChange={setOpen}>
        <Input label="Customer" />
        <Button>Apply filters</Button>
      </Drawer>
    </main>
  );
}

describe('Drawer', () => {
  it('renders nothing while closed', async () => {
    await renderWithProvider(<Page />);
    expect(gone()).toBe(true);
  });

  it('opens as a complementary landmark named by its title, with a heading and close button', async () => {
    const screen = await renderWithProvider(<Page />);
    await screen.getByRole('button', { name: 'Open filters' }).click();
    await expect.element(screen.getByRole('complementary', { name: 'Filters' })).toBeVisible();
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Filters' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Close panel' })).toBeVisible();
  });

  it('can be a region instead, and uses another heading level', async () => {
    const screen = await renderWithProvider(<Page role="region" headingLevel={3} defaultOpen />);
    await expect.element(screen.getByRole('heading', { level: 3 })).toBeVisible();
    await expect.element(screen.getByRole('region', { name: 'Filters' })).toBeVisible();
  });

  it('is non-modal: no scrim, nothing inert, the page stays interactive', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(
      <main>
        <Button onPress={onPress}>Page action</Button>
        <Drawer title="Filters" defaultOpen>
          <Input label="Customer" />
        </Drawer>
      </main>,
    );
    await screen.getByRole('button', { name: 'Page action' }).click();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[inert]')).toBeNull();
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('moves focus into the drawer when it opens and does not trap Tab', async () => {
    const screen = await renderWithProvider(<Page />);
    await screen.getByRole('button', { name: 'Open filters' }).click();
    const drawer = screen.getByRole('complementary');
    await expect.element(drawer).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Close panel' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    // Shift+Tab leaves the drawer for the page: nothing holds focus inside.
    expect(drawer.element().contains(document.activeElement)).toBe(false);
  });

  it('does not take focus when it is open on first render', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    const drawer = screen.getByRole('complementary');
    await expect.element(drawer).toBeVisible();
    expect(drawer.element().contains(document.activeElement)).toBe(false);
  });

  it('does not take focus when autoFocus is off', async () => {
    const screen = await renderWithProvider(<Page autoFocus={false} />);
    await screen.getByRole('button', { name: 'Open filters' }).click();
    await expect.element(screen.getByRole('complementary')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Open filters' })).toHaveFocus();
  });

  it('closes on Escape from inside and returns focus to the trigger', async () => {
    const screen = await renderWithProvider(<Page />);
    const trigger = screen.getByRole('button', { name: 'Open filters' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('complementary')).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(screen.getByRole('textbox', { name: 'Customer' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(gone).toBe(true);
    await expect.element(trigger).toHaveFocus();
  });

  it('does not close on Escape when focus is outside the drawer', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    await screen.getByRole('button', { name: 'Page action' }).click();
    await userEvent.keyboard('{Escape}');
    await expect.element(screen.getByRole('complementary')).toBeVisible();
  });

  it('closes with the close button and restores focus', async () => {
    const screen = await renderWithProvider(<Page />);
    const trigger = screen.getByRole('button', { name: 'Open filters' });
    await trigger.click();
    await screen.getByRole('button', { name: 'Close panel' }).click();
    await expect.poll(gone).toBe(true);
    await expect.element(trigger).toHaveFocus();
  });

  it('closes from inside through the close render prop', async () => {
    const screen = await renderWithProvider(
      <Drawer
        title="Filters"
        defaultOpen
        footer={({ close }) => <Button onPress={close}>Apply filters</Button>}
      >
        <p>Body</p>
      </Drawer>,
    );
    await screen.getByRole('button', { name: 'Apply filters' }).click();
    await expect.poll(gone).toBe(true);
  });

  it('is controlled through isOpen and reports changes', async () => {
    const onOpenChange = vi.fn();
    const screen = await renderWithProvider(
      <Drawer title="Filters" isOpen onOpenChange={onOpenChange}>
        <Button>Apply filters</Button>
      </Drawer>,
    );
    await screen.getByRole('button', { name: 'Close panel' }).click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // The consumer did not change isOpen, so the drawer stays.
    await expect.element(screen.getByRole('complementary')).toBeVisible();
  });

  it('sits against the requested edge and follows the writing direction', async () => {
    const screen = await renderWithProvider(
      <div dir="rtl" style={{ display: 'flex' }}>
        <Drawer title="Filters" placement="end" defaultOpen />
        <main>Content</main>
      </div>,
    );
    const style = getComputedStyle(screen.getByRole('complementary').element());
    expect(style.borderInlineStartWidth).toBe('1px');
    expect(style.borderInlineEndWidth).toBe('0px');
    await screen.unmount();
    const start = await renderWithProvider(
      <Drawer title="Filters" placement="start" defaultOpen />,
    );
    const startStyle = getComputedStyle(start.getByRole('complementary').element());
    expect(startStyle.borderInlineEndWidth).toBe('1px');
  });

  it('has no shadow and sizes itself from the size token', async () => {
    const screen = await renderWithProvider(
      <div style={{ display: 'flex', inlineSize: 800 }}>
        <Drawer title="Filters" size="lg" defaultOpen />
      </div>,
    );
    await settled();
    const element = screen.getByRole('complementary').element();
    expect(getComputedStyle(element).boxShadow).toBe('none');
    expect(element.getBoundingClientRect().width).toBe(400);
  });

  it('uses the pt-BR message, a provider override and an instance override', async () => {
    const pt = await renderWithProvider(<Drawer title="Filtros" defaultOpen />, {
      locale: 'pt-BR',
    });
    await expect.element(pt.getByRole('button', { name: 'Fechar painel' })).toBeVisible();
    await pt.unmount();
    const provider = await renderWithProvider(<Drawer title="Filters" defaultOpen />, {
      messages: { Drawer: { close: 'Hide filters' } },
    });
    await expect.element(provider.getByRole('button', { name: 'Hide filters' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <Drawer title="Filters" defaultOpen messages={{ close: 'Dismiss' }} />,
    );
    await expect.element(instance.getByRole('button', { name: 'Dismiss' })).toBeVisible();
  });

  it('has no axe violations when open', async () => {
    await renderWithProvider(<Page defaultOpen />);
    await settled();
    await expectNoA11yViolations(document.body);
  });
});
