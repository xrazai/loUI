import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Card } from './Card';
import { Divider } from '../Divider';
import { Heading } from '../Heading';
import { Text } from '../Text';

describe('Card', () => {
  it('renders a section without a header when there is no title or actions', async () => {
    const screen = await renderWithProvider(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card').element();
    expect(card.tagName).toBe('SECTION');
    expect(card.querySelector('header')).toBeNull();
    expect(card.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders the title as a level 2 heading that names the region', async () => {
    const screen = await renderWithProvider(<Card title="Storage">Content</Card>);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Storage' })).toBeVisible();
    await expect.element(screen.getByRole('region', { name: 'Storage' })).toBeInTheDocument();
  });

  it.each([1, 3, 4, 5, 6] as const)('supports heading level %i', async (level) => {
    const screen = await renderWithProvider(
      <Card title="Storage" headingLevel={level}>
        Content
      </Card>,
    );
    await expect
      .element(screen.getByRole('heading', { level, name: 'Storage' }))
      .toBeInTheDocument();
  });

  it('lets the consumer name the region with aria-label or aria-labelledby', async () => {
    const screen = await renderWithProvider(
      <>
        <Card title="Storage" aria-label="Disk usage">
          One
        </Card>
        <h3 id="outside">Outside</h3>
        <Card aria-labelledby="outside">Two</Card>
      </>,
    );
    await expect.element(screen.getByRole('region', { name: 'Disk usage' })).toBeInTheDocument();
    await expect.element(screen.getByRole('region', { name: 'Outside' })).toBeInTheDocument();
  });

  it('renders actions in the header', async () => {
    const screen = await renderWithProvider(
      <Card title="Storage" actions={<button type="button">Manage</button>}>
        Content
      </Card>,
    );
    await expect.element(screen.getByRole('button', { name: 'Manage' })).toBeVisible();
  });

  it('exposes variant and padding as data attributes', async () => {
    const screen = await renderWithProvider(
      <Card data-testid="card" variant="raised" padding="none">
        Content
      </Card>,
    );
    const card = screen.getByTestId('card').element();
    expect(card.getAttribute('data-variant')).toBe('raised');
    expect(card.getAttribute('data-padding')).toBe('none');
  });

  it('shows the overlay shadow only on the raised variant', async () => {
    const screen = await renderWithProvider(
      <>
        <Card data-testid="flat">Flat</Card>
        <Card data-testid="raised" variant="raised">
          Raised
        </Card>
      </>,
    );
    expect(getComputedStyle(screen.getByTestId('flat').element()).boxShadow).toBe('none');
    expect(getComputedStyle(screen.getByTestId('raised').element()).boxShadow).not.toBe('none');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(
      <Card ref={ref} className="extra" id="card-1">
        Content
      </Card>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('card-1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <Card title="Storage" actions={<button type="button">Manage</button>}>
          <p>6.2 of 10 GB used</p>
        </Card>
        <Card title="Floating" variant="raised">
          <p>Raised</p>
        </Card>
        <Card padding="none">
          <p>No title</p>
        </Card>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });

  describe('paper scope', () => {
    function Receipt() {
      return (
        <Card data-theme="paper" data-testid="paper-card" title="Receipt #1051">
          <Heading level={3}>Northwind Web</Heading>
          <Text tone="secondary">Order placed 29 Oct 2026</Text>
          <Divider />
          <Text mono>Subtotal $1,200.00</Text>
          <Divider variant="dashed" />
          <Text mono>Total $1,240.00</Text>
        </Card>
      );
    }

    it('switches surface, border and text to the paper tokens', async () => {
      const screen = await renderWithProvider(
        <>
          <Card data-testid="dark-card">Dark</Card>
          <Receipt />
        </>,
      );
      const dark = getComputedStyle(screen.getByTestId('dark-card').element());
      const paper = getComputedStyle(screen.getByTestId('paper-card').element());
      expect(paper.backgroundColor).not.toBe(dark.backgroundColor);
      expect(paper.borderTopColor).not.toBe(dark.borderTopColor);
      expect(paper.color).not.toBe(dark.color);
      const root = getComputedStyle(document.documentElement);
      const probe = document.createElement('div');
      probe.style.color = root.getPropertyValue('--ds-paper');
      document.body.append(probe);
      const paperColor = getComputedStyle(probe).color;
      probe.remove();
      expect(paper.backgroundColor).toBe(paperColor);
    });

    it('has no axe violations, including color contrast', async () => {
      const screen = await renderWithProvider(
        <main>
          <h1>Page</h1>
          <Receipt />
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });
  });
});
