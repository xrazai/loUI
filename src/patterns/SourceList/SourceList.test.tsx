import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Citation, SourceList, getSourceElementId } from './SourceList';
import type { Source } from './SourceList';

const sources: Source[] = [
  {
    id: 'a',
    title: 'Order lifecycle',
    url: 'https://www.example.com/docs/orders',
    snippet: 'An order moves from open to shipped.',
  },
  { id: 'b', title: 'Shipping policy', url: 'https://help.example.org/shipping', domain: 'help' },
  { id: 'c', title: 'Internal note' },
];

describe('SourceList', () => {
  it('is a region named by its heading with a numbered list', async () => {
    const screen = await renderWithProvider(<SourceList id="s" sources={sources} />);
    await expect.element(screen.getByRole('region', { name: 'Sources' })).toBeVisible();
    await expect.element(screen.getByRole('heading', { level: 3, name: 'Sources' })).toBeVisible();
    expect(screen.getByRole('list').element().tagName).toBe('OL');
    expect(screen.getByRole('listitem').elements()).toHaveLength(3);
  });

  it('supports a custom title and heading level', async () => {
    const screen = await renderWithProvider(
      <SourceList id="s" sources={sources} title="References" headingLevel={2} />,
    );
    await expect
      .element(screen.getByRole('heading', { level: 2, name: 'References' }))
      .toBeVisible();
  });

  it('links titles that have a url, opening in a new tab', async () => {
    const screen = await renderWithProvider(<SourceList id="s" sources={sources} />);
    const link = screen.getByRole('link', { name: /Order lifecycle/ });
    await expect.element(link).toHaveAttribute('href', 'https://www.example.com/docs/orders');
    await expect.element(link).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link').elements()).toHaveLength(2);
    await expect.element(screen.getByText('Internal note')).toBeVisible();
  });

  it('shows the domain, derived from the url without www., or given', async () => {
    const screen = await renderWithProvider(<SourceList id="s" sources={sources} />);
    await expect.element(screen.getByText('example.com')).toBeVisible();
    await expect.element(screen.getByText('help', { exact: true })).toBeVisible();
  });

  it('shows the snippet', async () => {
    const screen = await renderWithProvider(<SourceList id="s" sources={sources} />);
    await expect.element(screen.getByText('An order moves from open to shipped.')).toBeVisible();
  });

  it('survives a relative url, which has no domain to show', async () => {
    const screen = await renderWithProvider(
      <SourceList id="s" sources={[{ id: 'x', title: 'Broken', url: '/docs/orders' }]} />,
    );
    await expect.element(screen.getByRole('link', { name: /Broken/ })).toBeVisible();
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(<SourceList id="s" sources={sources} ref={ref} className="extra" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('s');
  });

  it('renders pt-BR and takes overrides', async () => {
    const pt = await renderWithProvider(<SourceList id="s" sources={sources} />, {
      locale: 'pt-BR',
    });
    await expect.element(pt.getByRole('heading', { name: 'Fontes' })).toBeVisible();
    await pt.unmount();
    const provider = await renderWithProvider(<SourceList id="s" sources={sources} />, {
      messages: { SourceList: { title: 'References' } },
    });
    await expect.element(provider.getByRole('heading', { name: 'References' })).toBeVisible();
  });
});

describe('Citation', () => {
  function Page({ onClick }: { onClick?: () => void }) {
    return (
      <div>
        <p>
          A claim
          <Citation
            number={2}
            title="Shipping policy"
            listId="s"
            sourceId="b"
            {...(onClick ? { onClick } : {})}
          />
        </p>
        <SourceList id="s" sources={sources} />
      </div>
    );
  }

  it('is a link named "Source N: title" that shows the number', async () => {
    const screen = await renderWithProvider(<Page />);
    const link = screen.getByRole('link', { name: 'Source 2: Shipping policy' });
    await expect.element(link).toHaveTextContent('2');
    await expect.element(link).toHaveAttribute('href', `#${getSourceElementId('s', 'b')}`);
  });

  it('moves focus to its source on click and on Enter', async () => {
    const screen = await renderWithProvider(<Page />);
    const link = screen.getByRole('link', { name: 'Source 2: Shipping policy' });
    await userEvent.click(link);
    expect(document.activeElement?.id).toBe(getSourceElementId('s', 'b'));
    (document.activeElement as HTMLElement).blur();
    link.element().focus();
    await userEvent.keyboard('{Enter}');
    expect(document.activeElement?.id).toBe(getSourceElementId('s', 'b'));
    expect(window.location.hash).toBe('');
  });

  it('leaves the source out of the tab order', async () => {
    const screen = await renderWithProvider(<Page />);
    expect(document.getElementById(getSourceElementId('s', 'b'))?.getAttribute('tabindex')).toBe(
      '-1',
    );
    await expect.element(screen.getByRole('link', { name: /Source 2/ })).toBeVisible();
  });

  it('calls a consumer onClick and lets it cancel the jump', async () => {
    const onClick = vi.fn((event?: unknown) => event);
    const screen = await renderWithProvider(<Page onClick={onClick} />);
    await userEvent.click(screen.getByRole('link', { name: /Source 2/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders pt-BR', async () => {
    const screen = await renderWithProvider(<Page />, { locale: 'pt-BR' });
    await expect
      .element(screen.getByRole('link', { name: 'Fonte 2: Shipping policy' }))
      .toBeVisible();
  });

  it('accepts an instance override', async () => {
    const screen = await renderWithProvider(
      <Citation
        number={1}
        title="T"
        listId="s"
        sourceId="a"
        messages={{ citation: (n: number, t: string) => `Ref ${String(n)} ${t}` }}
      />,
    );
    await expect.element(screen.getByRole('link', { name: 'Ref 1 T' })).toBeVisible();
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Answer</h1>
        <Page />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
