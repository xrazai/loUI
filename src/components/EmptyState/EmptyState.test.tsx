import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Button } from '../Button';
import { Icon, SearchIcon } from '../Icon';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title as a level 2 heading and the description', async () => {
    const screen = await renderWithProvider(
      <EmptyState title="No orders found" description="Try another filter or search term." />,
    );
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'No orders found' }))
      .toBeVisible();
    await expect.element(screen.getByText('Try another filter or search term.')).toBeVisible();
  });

  it.each([1, 3, 4, 5, 6] as const)('supports heading level %i', async (level) => {
    const screen = await renderWithProvider(
      <EmptyState title="No orders found" headingLevel={level} />,
    );
    await expect.element(screen.getByRole('heading', { level })).toBeInTheDocument();
  });

  it('renders the description only when given', async () => {
    const screen = await renderWithProvider(<EmptyState title="No orders found" />);
    expect(screen.container.querySelector('p')).toBeNull();
    expect(screen.container.querySelector('button')).toBeNull();
  });

  it('renders the secondary action before the primary action', async () => {
    const screen = await renderWithProvider(
      <EmptyState
        title="No orders yet"
        action={<Button variant="primary">Create order</Button>}
        secondaryAction={<Button>Import CSV</Button>}
      />,
    );
    const buttons = screen.getByRole('button').elements();
    expect(buttons.map((button) => button.textContent)).toEqual(['Import CSV', 'Create order']);
  });

  it('hides the icon from assistive technology', async () => {
    const screen = await renderWithProvider(
      <EmptyState title="No results" icon={<Icon icon={SearchIcon} />} />,
    );
    const wrapper = screen.container.querySelector('svg')?.parentElement;
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws a dashed border by default and none when bordered is false', async () => {
    const screen = await renderWithProvider(
      <>
        <EmptyState title="Bordered" data-testid="bordered" />
        <EmptyState title="Plain" bordered={false} data-testid="plain" />
      </>,
    );
    expect(getComputedStyle(screen.getByTestId('bordered').element()).borderStyle).toBe('dashed');
    expect(getComputedStyle(screen.getByTestId('plain').element()).borderStyle).toBe('none');
  });

  it('uses less padding and a smaller title when compact', async () => {
    const screen = await renderWithProvider(
      <>
        <EmptyState title="Regular" data-testid="regular" />
        <EmptyState title="Compact" compact data-testid="compact" />
      </>,
    );
    const height = (id: string) => screen.getByTestId(id).element().getBoundingClientRect().height;
    expect(height('compact')).toBeLessThan(height('regular'));
    const fontSize = (name: string) =>
      getComputedStyle(screen.getByRole('heading', { name }).element()).fontSize;
    expect(fontSize('Compact')).not.toBe(fontSize('Regular'));
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<EmptyState ref={ref} title="Empty" className="extra" id="e1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('e1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Orders</h1>
        <EmptyState
          title="No orders found"
          description="Try another filter or search term."
          icon={<Icon icon={SearchIcon} />}
          action={<Button variant="primary">Clear filters</Button>}
          secondaryAction={<Button>Import CSV</Button>}
        />
        <EmptyState title="Nothing here" compact bordered={false} headingLevel={3} />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
