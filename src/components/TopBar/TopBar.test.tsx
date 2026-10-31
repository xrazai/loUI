import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  describe('rendering', () => {
    it('renders a header with the title as an h1', async () => {
      const screen = await renderWithProvider(<TopBar title="Orders" />);
      await expect.element(screen.getByRole('banner')).toBeVisible();
      await expect.element(screen.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
    });

    it('is as tall as the top bar token (64px, not the handoff 56px)', async () => {
      const screen = await renderWithProvider(<TopBar title="Orders" subtitle="1,248 orders" />);
      expect(screen.getByRole('banner').element().getBoundingClientRect().height).toBe(64);
    });

    it('shows the subtitle under the title', async () => {
      const screen = await renderWithProvider(<TopBar title="Orders" subtitle="1,248 orders" />);
      await expect.element(screen.getByText('1,248 orders')).toBeVisible();
    });

    it('supports another heading level', async () => {
      const screen = await renderWithProvider(<TopBar title="Orders" headingLevel={3} />);
      await expect.element(screen.getByRole('heading', { level: 3 })).toBeVisible();
    });

    it('shows a breadcrumb instead of a title', async () => {
      const screen = await renderWithProvider(
        <TopBar
          title="Ignored"
          breadcrumb={[{ label: 'Orders', href: '#orders' }, { label: 'ORD-1048' }]}
        />,
      );
      await expect.element(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
      expect(screen.getByRole('heading').elements()).toHaveLength(0);
    });

    it('puts the actions at the end and the extra content next to the title', async () => {
      const screen = await renderWithProvider(
        <TopBar title="Orders" actions={<Button variant="primary">Create order</Button>}>
          <span>Live</span>
        </TopBar>,
      );
      const title = screen.getByRole('heading').element().getBoundingClientRect();
      const live = screen.getByText('Live').element().getBoundingClientRect();
      const action = screen.getByRole('button').element().getBoundingClientRect();
      expect(live.left).toBeGreaterThan(title.right - 1);
      expect(action.left).toBeGreaterThan(live.right);
    });

    it('truncates a long title instead of pushing the actions out', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 400 }}>
          <TopBar
            title="Purchase orders awaiting supplier confirmation and approval by finance"
            actions={<Button variant="primary">Create order</Button>}
          />
        </div>,
      );
      const bar = screen.getByRole('banner').element().getBoundingClientRect();
      const action = screen.getByRole('button').element().getBoundingClientRect();
      expect(action.right).toBeLessThanOrEqual(bar.right);
      expect(bar.height).toBe(64);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLElement>();
      await renderWithProvider(
        <TopBar ref={ref} title="Orders" className="extra" data-testid="t" />,
      );
      expect(ref.current?.tagName).toBe('HEADER');
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('t');
    });
  });

  describe('keyboard', () => {
    it('keeps the primary action reachable in reading order', async () => {
      const screen = await renderWithProvider(
        <TopBar
          title="Orders"
          actions={
            <>
              <Button>Export</Button>
              <Button variant="primary" trailing={<Kbd keys={['N']} />}>
                Create order
              </Button>
            </>
          }
        />,
      );
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: 'Export' })).toHaveFocus();
      await userEvent.keyboard('{Tab}');
      await expect.element(screen.getByRole('button', { name: /Create order/ })).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations with a title, subtitle and actions (axe)', async () => {
      const screen = await renderWithProvider(
        <TopBar
          title="Orders"
          subtitle="1,248 orders"
          actions={
            <Button variant="primary" trailing={<Kbd keys={['N']} />}>
              Create order
            </Button>
          }
        />,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations with a breadcrumb (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <TopBar breadcrumb={[{ label: 'Orders', href: '#orders' }, { label: 'ORD-1048' }]} />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
