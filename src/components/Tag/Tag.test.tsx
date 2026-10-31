import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Tag, TagGroup } from './Tag';
import type { TagGroupProps } from './Tag';

const INITIAL = ['linen', 'cotton', 'silk'];

function Filters({
  onRemove,
  ...props
}: { onRemove?: (keys: Set<string | number>) => void } & Partial<TagGroupProps>) {
  const [tags, setTags] = useState(INITIAL);
  return (
    <TagGroup
      label="Fabric"
      onRemove={(keys) => {
        onRemove?.(keys);
        setTags((current) => current.filter((tag) => !keys.has(tag)));
      }}
      {...props}
    >
      {tags.map((tag) => (
        <Tag key={tag} id={tag}>
          {tag}
        </Tag>
      ))}
    </TagGroup>
  );
}

describe('Tag (standalone)', () => {
  it('renders static text without a button', async () => {
    const screen = await renderWithProvider(<Tag>v2.4.0</Tag>);
    await expect.element(screen.getByText('v2.4.0')).toBeVisible();
    expect(screen.container.querySelector('button')).toBeNull();
  });

  it('shows a remove button named with the tag text and calls onRemove', async () => {
    const onRemove = vi.fn();
    const screen = await renderWithProvider(<Tag onRemove={onRemove}>linen</Tag>);
    const button = screen.getByRole('button', { name: 'Remove linen' });
    await button.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('removes with the keyboard through the button', async () => {
    const onRemove = vi.fn();
    const screen = await renderWithProvider(<Tag onRemove={onRemove}>linen</Tag>);
    await userEvent.tab();
    await expect.element(screen.getByRole('button', { name: 'Remove linen' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('uses textValue to name the button when the content is not text', async () => {
    const screen = await renderWithProvider(
      <Tag textValue="linen" onRemove={() => undefined}>
        <strong>linen</strong>
      </Tag>,
    );
    await expect.element(screen.getByRole('button', { name: 'Remove linen' })).toBeVisible();
  });

  it('makes the remove button a target of at least 24 by 24 pixels', async () => {
    const screen = await renderWithProvider(<Tag onRemove={() => undefined}>linen</Tag>);
    const rect = screen
      .getByRole('button', { name: 'Remove linen' })
      .element()
      .getBoundingClientRect();
    expect(rect.width).toBeGreaterThanOrEqual(24);
    expect(rect.height).toBeGreaterThanOrEqual(24);
  });

  it('disables the remove button when the tag is disabled', async () => {
    const screen = await renderWithProvider(
      <Tag isDisabled onRemove={() => undefined}>
        linen
      </Tag>,
    );
    await expect.element(screen.getByRole('button', { name: 'Remove linen' })).toBeDisabled();
  });

  it('uses the pt-BR message, the provider override and the instance override', async () => {
    const pt = await renderWithProvider(<Tag onRemove={() => undefined}>linho</Tag>, {
      locale: 'pt-BR',
    });
    await expect.element(pt.getByRole('button', { name: 'Remover linho' })).toBeVisible();
    await pt.unmount();

    const provider = await renderWithProvider(<Tag onRemove={() => undefined}>linho</Tag>, {
      messages: { Tag: { remove: (label: string) => `Excluir ${label}` } },
    });
    await expect.element(provider.getByRole('button', { name: 'Excluir linho' })).toBeVisible();
    await provider.unmount();

    const instance = await renderWithProvider(
      <Tag onRemove={() => undefined} messages={{ remove: (label: string) => `Tirar ${label}` }}>
        linho
      </Tag>,
      { messages: { Tag: { remove: (label: string) => `Excluir ${label}` } } },
    );
    await expect.element(instance.getByRole('button', { name: 'Tirar linho' })).toBeVisible();
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(
      <Tag ref={ref} className="extra" id="t1" data-testid="tag">
        v1
      </Tag>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('t1');
    expect(ref.current?.getAttribute('data-testid')).toBe('tag');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Tag>v2.4.0</Tag>
        <Tag onRemove={() => undefined}>linen</Tag>
        <Tag isDisabled onRemove={() => undefined}>
          cotton
        </Tag>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('TagGroup', () => {
  it('renders a labelled grid with one row per tag', async () => {
    const screen = await renderWithProvider(<Filters />);
    await expect.element(screen.getByRole('grid', { name: 'Fabric' })).toBeVisible();
    expect(screen.getByRole('row').elements()).toHaveLength(3);
  });

  it('has one roving tab stop for the tags and moves with the arrow keys', async () => {
    const screen = await renderWithProvider(
      <>
        <button type="button">Before</button>
        <Filters />
      </>,
    );
    const rows = screen.getByRole('row').elements();
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(rows[0]);
    expect(rows.filter((row) => row.getAttribute('tabindex') === '0')).toEqual([rows[0]]);
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(rows[1]);
    expect(rows.filter((row) => row.getAttribute('tabindex') === '0')).toEqual([rows[1]]);
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(rows[0]);
  });

  it.each(['Backspace', 'Delete'])('removes the focused tag with %s', async (key) => {
    const onRemove = vi.fn();
    const screen = await renderWithProvider(<Filters onRemove={onRemove} />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard(`{${key}}`);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(Array.from(onRemove.mock.calls[0]?.[0] as Set<string>)).toEqual(['cotton']);
    expect(screen.getByRole('row').elements()).toHaveLength(2);
    await expect.element(screen.getByText('cotton')).not.toBeInTheDocument();
  });

  it('gives each remove button a name that includes the tag text', async () => {
    const screen = await renderWithProvider(<Filters />);
    for (const tag of INITIAL) {
      await expect.element(screen.getByRole('button', { name: `Remove ${tag}` })).toBeVisible();
    }
  });

  it('removes a tag with its remove button', async () => {
    const onRemove = vi.fn();
    const screen = await renderWithProvider(<Filters onRemove={onRemove} />);
    await screen.getByRole('button', { name: 'Remove silk' }).click();
    expect(Array.from(onRemove.mock.calls[0]?.[0] as Set<string>)).toEqual(['silk']);
  });

  it('names the remove buttons in pt-BR', async () => {
    const screen = await renderWithProvider(<Filters />, { locale: 'pt-BR' });
    await expect.element(screen.getByRole('button', { name: 'Remover linen' })).toBeVisible();
  });

  it('shows no remove buttons without onRemove', async () => {
    const screen = await renderWithProvider(
      <TagGroup label="Versions">
        <Tag id="a">v1</Tag>
        <Tag id="b">v2</Tag>
      </TagGroup>,
    );
    expect(screen.getByRole('button').elements()).toHaveLength(0);
  });

  it('does not remove a disabled tag with the keyboard', async () => {
    const onRemove = vi.fn();
    await renderWithProvider(
      <TagGroup label="Fabric" onRemove={onRemove} disabledKeys={['linen']}>
        <Tag id="linen">linen</Tag>
        <Tag id="cotton">cotton</Tag>
      </TagGroup>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{Backspace}');
    expect(document.activeElement?.textContent).toContain('cotton');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(Array.from(onRemove.mock.calls[0]?.[0] as Set<string>)).toEqual(['cotton']);
  });

  it('marks selected tags when selection is enabled', async () => {
    const screen = await renderWithProvider(
      <TagGroup label="Fabric" selectionMode="multiple" defaultSelectedKeys={['linen']}>
        <Tag id="linen">linen</Tag>
        <Tag id="cotton">cotton</Tag>
      </TagGroup>,
    );
    const rows = screen.getByRole('row').elements();
    expect(rows[0]?.getAttribute('aria-selected')).toBe('true');
    expect(rows[1]?.getAttribute('aria-selected')).toBe('false');
  });

  it('shows the empty state', async () => {
    const screen = await renderWithProvider(
      <TagGroup label="Fabric" renderEmptyState={() => 'No filters applied'}>
        {[]}
      </TagGroup>,
    );
    await expect.element(screen.getByText('No filters applied')).toBeVisible();
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Filters />
        <TagGroup label="Versions" selectionMode="single" defaultSelectedKeys={['a']}>
          <Tag id="a">v1</Tag>
          <Tag id="b">v2</Tag>
        </TagGroup>
        <TagGroup aria-label="Static tags">
          <Tag id="x">alpha</Tag>
        </TagGroup>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
