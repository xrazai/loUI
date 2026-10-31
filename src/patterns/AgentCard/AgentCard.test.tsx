import { createRef } from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { AgentCard } from './AgentCard';
import type { AgentCardProps } from './AgentCard';

const base: AgentCardProps = {
  name: 'Marketplace agent',
  area: 'Marketplace',
  icon: ShoppingBag,
  description: 'Answers buyer questions and reviews. You approve before it sends.',
  lastActivity: 'Last reply sent at 08:40',
  pending: 4,
  onOpen: () => undefined,
};

describe('AgentCard', () => {
  describe('semantics', () => {
    it('is one button named by the agent name, without nested interactive elements', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} />);
      const buttons = screen.getByRole('button');
      expect(buttons.elements()).toHaveLength(1);
      await expect.element(screen.getByRole('button', { name: 'Marketplace agent' })).toBeVisible();
      const root = screen.getByRole('heading', { name: 'Marketplace agent' }).element()
        .parentElement?.parentElement?.parentElement as HTMLElement;
      expect(root.querySelectorAll('button, a, [role="button"], [tabindex]')).toHaveLength(1);
    });

    it('is a real link when it has an href', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} href="#agent" />);
      const link = screen.getByRole('link', { name: 'Marketplace agent' });
      await expect.element(link).toHaveAttribute('href', '#agent');
      expect(screen.getByRole('button').elements()).toHaveLength(0);
    });

    it('exposes the name as a heading of the chosen level', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} headingLevel={2} />);
      await expect
        .element(screen.getByRole('heading', { level: 2, name: 'Marketplace agent' }))
        .toBeVisible();
    });

    it('describes the card with status, description and footer', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} />);
      const button = screen.getByRole('button', { name: 'Marketplace agent' }).element();
      const description = (button.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .map((id) => document.getElementById(id)?.textContent)
        .join(' | ');
      expect(description).toContain('Active');
      expect(description).toContain('Answers buyer questions');
      expect(description).toContain('Last reply sent at 08:40');
      expect(description).toContain('4 to approve');
    });

    it('hides the icon from assistive technology', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} />);
      expect(screen.getByRole('img').elements()).toHaveLength(0);
    });
  });

  describe('status', () => {
    it.each([
      ['testing', 'In testing'],
      ['active', 'Active'],
      ['paused', 'Paused'],
      ['soon', 'Coming soon'],
    ] as const)('shows the %s status as text', async (status, text) => {
      const screen = await renderWithProvider(<AgentCard {...base} status={status} />);
      await expect.element(screen.getByText(text, { exact: true })).toBeVisible();
    });

    it('is not interactive when coming soon, and ignores the pending count', async () => {
      const onOpen = vi.fn();
      const screen = await renderWithProvider(
        <AgentCard
          {...base}
          status="soon"
          href="#agent"
          onOpen={onOpen}
          lastActivity={undefined}
        />,
      );
      expect(screen.getByRole('button').elements()).toHaveLength(0);
      expect(screen.getByRole('link').elements()).toHaveLength(0);
      await expect
        .element(screen.getByRole('heading', { name: 'Marketplace agent' }))
        .toBeVisible();
      await expect.element(screen.getByText('Not set up yet')).toBeVisible();
      expect(screen.getByText('to approve').elements()).toHaveLength(0);
      const root = screen.getByRole('heading').element().closest('[data-status]') as HTMLElement;
      expect(getComputedStyle(root).borderStyle).toBe('dashed');
    });

    it('shows a solid border for available cards', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} />);
      const root = screen.getByRole('heading').element().closest('[data-status]') as HTMLElement;
      expect(getComputedStyle(root).borderStyle).toBe('solid');
    });
  });

  describe('pending count', () => {
    it('hides the count when there is nothing to approve', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} pending={0} />);
      expect(screen.getByText('to approve').elements()).toHaveLength(0);
    });

    it('shows a formatted accent number with text', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} pending={1200} />);
      await expect.element(screen.getByText('1,200', { exact: true })).toBeVisible();
      await expect.element(screen.getByText('to approve')).toBeVisible();
    });
  });

  describe('activation', () => {
    it('calls onOpen on Enter and Space', async () => {
      const onOpen = vi.fn();
      const screen = await renderWithProvider(<AgentCard {...base} onOpen={onOpen} />);
      screen.getByRole('button', { name: 'Marketplace agent' }).element().focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onOpen).toHaveBeenCalledTimes(2);
    });

    it('calls onOpen when any part of the card is clicked (stretched hit area)', async () => {
      const onOpen = vi.fn();
      const screen = await renderWithProvider(<AgentCard {...base} onOpen={onOpen} />);
      // The description is covered by the stretched link, so a plain click would be refused as intercepted.
      await screen.getByText('Answers buyer questions', { exact: false }).click({ force: true });
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('activates a link with Enter', async () => {
      const onOpen = vi.fn();
      const screen = await renderWithProvider(
        <AgentCard {...base} href="#agent" onOpen={onOpen} />,
      );
      screen.getByRole('link', { name: 'Marketplace agent' }).element().focus();
      await userEvent.keyboard('{Enter}');
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('draws the focus ring on the whole card', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} />);
      await userEvent.tab();
      const root = screen.getByRole('heading').element().closest('[data-status]') as HTMLElement;
      expect(getComputedStyle(root).boxShadow).not.toBe('none');
    });
  });

  describe('i18n', () => {
    it('renders pt-BR', async () => {
      const screen = await renderWithProvider(<AgentCard {...base} status="paused" />, {
        locale: 'pt-BR',
      });
      await expect.element(screen.getByText('Pausado')).toBeVisible();
      await expect.element(screen.getByText('para aprovar')).toBeVisible();
    });

    it('accepts instance and provider overrides', async () => {
      const instance = await renderWithProvider(
        <AgentCard {...base} messages={{ statusActive: 'Live' }} />,
      );
      await expect.element(instance.getByText('Live')).toBeVisible();
      await instance.unmount();
      const provider = await renderWithProvider(
        <AgentCard {...base} status="soon" lastActivity={undefined} />,
        {
          messages: { AgentCard: { notConfigured: 'Never configured' } },
        },
      );
      await expect.element(provider.getByText('Never configured')).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<AgentCard {...base} ref={ref} className="extra" id="card-1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('card-1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Agents</h1>
        <AgentCard {...base} headingLevel={2} />
        <AgentCard
          {...base}
          headingLevel={2}
          href="#a"
          status="testing"
          name="Support agent"
          icon={MessageCircle}
        />
        <AgentCard {...base} headingLevel={2} status="paused" name="Paused agent" />
        <AgentCard
          name="Chat agent"
          headingLevel={2}
          status="soon"
          description="Will draft orders from the conversation."
        />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
