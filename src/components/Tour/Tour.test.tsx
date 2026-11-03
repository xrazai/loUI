import { useRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Tour } from './Tour';
import type { TourProps } from './Tour';

const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);
const none = () => document.querySelector('[role="dialog"]') === null;

function Page(props: Partial<TourProps>) {
  const [open, setOpen] = useState(props.defaultOpen ?? false);
  const search = useRef<HTMLButtonElement>(null);
  const filters = useRef<HTMLButtonElement>(null);
  const create = useRef<HTMLButtonElement>(null);
  return (
    <main>
      <Button
        onPress={() => {
          setOpen(true);
        }}
      >
        Start tour
      </Button>
      <Button ref={search}>Search</Button>
      <Button ref={filters}>Filters</Button>
      <Button ref={create}>Create item</Button>
      <Tour
        steps={[
          { target: search, title: 'Search', content: 'Find any item by name.' },
          { target: filters, title: 'Filters', content: 'Narrow the list.' },
          { target: create, title: 'Create item', content: 'Add a new item.' },
        ]}
        {...props}
        isOpen={open}
        onOpenChange={(value) => {
          setOpen(value);
          props.onOpenChange?.(value);
        }}
      />
    </main>
  );
}

describe('Tour', () => {
  it('renders nothing while closed', async () => {
    await renderWithProvider(<Page />);
    expect(none()).toBe(true);
  });

  it('shows the first step as a non-modal dialog named by its title, with a counter', async () => {
    const screen = await renderWithProvider(<Page />);
    await screen.getByRole('button', { name: 'Start tour' }).click();
    const step = screen.getByRole('dialog', { name: 'Search' });
    await expect.element(step).toBeVisible();
    await expect.element(screen.getByText('Find any item by name.')).toBeVisible();
    await expect.element(screen.getByText('Step 1 of 3')).toBeVisible();
    // The page stays reachable: no inert, no aria-modal.
    expect(document.querySelector('[inert]')).toBeNull();
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
  });

  it('has Next and Skip on the first step, and no Back', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    await expect.element(screen.getByRole('button', { name: 'Next' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Skip tour' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('moves focus into each step and positions it against its own target', async () => {
    const screen = await renderWithProvider(<Page />);
    await screen.getByRole('button', { name: 'Start tour' }).click();
    const first = screen.getByRole('dialog', { name: 'Search' });
    await expect.element(first).toHaveFocus();
    await screen.getByRole('button', { name: 'Next' }).click();
    const second = screen.getByRole('dialog', { name: 'Filters' });
    await expect.element(second).toHaveFocus();
    await expect.element(screen.getByText('Step 2 of 3')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Back' })).toBeVisible();
    await settled();
    const target = screen.getByRole('button', { name: 'Filters', exact: true }).element();
    const box = second.element().getBoundingClientRect();
    const anchor = target.getBoundingClientRect();
    expect(box.top).toBeGreaterThanOrEqual(anchor.bottom - 1);
    // The arrow points at the target: its center lies within the target horizontally.
    const arrow = second.element().parentElement?.querySelector('svg')?.getBoundingClientRect();
    expect(arrow).toBeDefined();
    const center = (arrow?.left ?? 0) + (arrow?.width ?? 0) / 2;
    expect(center).toBeGreaterThanOrEqual(anchor.left);
    expect(center).toBeLessThanOrEqual(anchor.right);
  });

  it('goes back to the previous step', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    await screen.getByRole('button', { name: 'Next' }).click();
    await screen.getByRole('button', { name: 'Back' }).click();
    await expect.element(screen.getByRole('dialog', { name: 'Search' })).toBeVisible();
  });

  it('shows Done instead of Next and Skip on the last step, and completes', async () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    const onOpenChange = vi.fn();
    const screen = await renderWithProvider(
      <Page
        defaultStep={2}
        defaultOpen
        onComplete={onComplete}
        onSkip={onSkip}
        onOpenChange={onOpenChange}
      />,
    );
    await expect.element(screen.getByText('Step 3 of 3')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Skip tour' })).not.toBeInTheDocument();
    await screen.getByRole('button', { name: 'Done' }).click();
    await expect.poll(none).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('skips with the Skip button', async () => {
    const onSkip = vi.fn();
    const onComplete = vi.fn();
    const screen = await renderWithProvider(
      <Page defaultOpen onSkip={onSkip} onComplete={onComplete} />,
    );
    await screen.getByRole('button', { name: 'Skip tour' }).click();
    await expect.poll(none).toBe(true);
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('skips with Escape and returns focus to the button that started the tour', async () => {
    const onSkip = vi.fn();
    const screen = await renderWithProvider(<Page onSkip={onSkip} />);
    const start = screen.getByRole('button', { name: 'Start tour' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('dialog', { name: 'Search' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(none).toBe(true);
    expect(onSkip).toHaveBeenCalledTimes(1);
    await expect.element(start).toHaveFocus();
  });

  it('returns focus to the starting button when the tour is completed', async () => {
    const screen = await renderWithProvider(<Page />);
    const start = screen.getByRole('button', { name: 'Start tour' });
    await start.click();
    await screen.getByRole('button', { name: 'Next' }).click();
    await screen.getByRole('button', { name: 'Next' }).click();
    await screen.getByRole('button', { name: 'Done' }).click();
    await expect.poll(none).toBe(true);
    await expect.element(start).toHaveFocus();
  });

  it('does not end when focus or a press moves elsewhere on the page', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await screen.getByRole('button', { name: 'Create item' }).click();
    await expect.element(screen.getByRole('dialog', { name: 'Search' })).toBeVisible();
  });

  it('can be navigated with the keyboard only', async () => {
    const screen = await renderWithProvider(<Page defaultOpen />);
    const dialog = screen.getByRole('dialog', { name: 'Search' });
    await expect.element(dialog).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Skip tour' })).toHaveFocus();
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  });

  it('is controlled through step and reports step changes', async () => {
    const onStepChange = vi.fn();
    const screen = await renderWithProvider(
      <Page step={1} onStepChange={onStepChange} defaultOpen />,
    );
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await screen.getByRole('button', { name: 'Next' }).click();
    expect(onStepChange).toHaveBeenCalledWith(2);
    // The consumer kept step=1, so the tour stays on that step.
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  });

  it('renders nothing for a step whose target is not mounted', async () => {
    const missing = { current: null };
    const screen = await renderWithProvider(
      <main>
        <Tour steps={[{ target: missing, title: 'Gone', content: 'Not here.' }]} defaultOpen />
      </main>,
    );
    expect(none()).toBe(true);
    expect(screen.container.textContent).not.toContain('Gone');
  });

  it('uses the popover layer, the raised surface and the overlay shadow', async () => {
    await renderWithProvider(<Page defaultOpen />);
    const surface = document.querySelector<HTMLElement>('[role="dialog"]')?.parentElement ?? null;
    expect(surface).not.toBeNull();
    const style = getComputedStyle(surface as HTMLElement);
    expect(style.zIndex).toBe('55');
    expect(style.boxShadow).not.toBe('none');
  });

  it('uses the pt-BR messages, a provider override and an instance override', async () => {
    const pt = await renderWithProvider(<Page defaultOpen />, { locale: 'pt-BR' });
    await expect.element(pt.getByText('Passo 1 de 3')).toBeVisible();
    await expect.element(pt.getByRole('button', { name: 'Avançar' })).toBeVisible();
    await expect.element(pt.getByRole('button', { name: 'Pular tour' })).toBeVisible();
    await pt.unmount();
    const provider = await renderWithProvider(<Page defaultOpen />, {
      messages: { Tour: { next: 'Continue' } },
    });
    await expect.element(provider.getByRole('button', { name: 'Continue' })).toBeVisible();
    await provider.unmount();
    const instance = await renderWithProvider(
      <Page defaultOpen messages={{ skip: 'Close tour' }} />,
    );
    await expect.element(instance.getByRole('button', { name: 'Close tour' })).toBeVisible();
  });

  it('has no axe violations on a middle step', async () => {
    const screen = await renderWithProvider(<Page defaultOpen defaultStep={1} />);
    await expect.element(screen.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await settled();
    await expectNoA11yViolations(document.body);
  });
});
