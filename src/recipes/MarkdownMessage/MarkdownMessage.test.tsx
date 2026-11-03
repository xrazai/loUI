import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { renderWithProvider } from '../../test/render';
import { expectNoViolationsOnceSettled } from '../settled';
import { MarkdownChat, renderMarkdown } from './MarkdownMessage';

async function show(markdown: string) {
  return renderWithProvider(<div>{renderMarkdown(markdown)}</div>);
}

describe('MarkdownMessage', () => {
  it('renders paragraphs and keeps single line breaks', async () => {
    const screen = await show('First line\nsecond line\n\nNext paragraph');
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.querySelectorAll('br')).toHaveLength(1);
    await expect.element(screen.getByText('Next paragraph')).toBeVisible();
  });

  it('renders bold, italic and inline code, nested', async () => {
    await show('**bold *both* text**, _under_, *star* and `ORD-1048`');
    expect(document.querySelector('strong')?.textContent).toBe('bold both text');
    expect(document.querySelector('strong em')?.textContent).toBe('both');
    expect([...document.querySelectorAll('em')].map((e) => e.textContent)).toEqual([
      'both',
      'under',
      'star',
    ]);
    expect(document.querySelector('code')?.textContent).toBe('ORD-1048');
  });

  it('does not treat math or snake_case as emphasis', async () => {
    await show('2 * 3 * 4 and snake_case_name');
    expect(document.querySelector('em')).toBeNull();
  });

  it('renders fenced code as a block, even before the fence is closed', async () => {
    await show('Run:\n\n```\nGET /orders\n  --verbose\n```\n\nThen:\n\n```\nunclosed');
    const blocks = document.querySelectorAll('pre code');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.textContent).toBe('GET /orders\n  --verbose');
    expect(blocks[1]?.textContent).toBe('unclosed');
  });

  it('renders bullet and numbered lists with real list semantics', async () => {
    const screen = await show('- one\n* two\n\n3. three\n4. four');
    const lists = screen.getByRole('list').elements();
    expect(lists).toHaveLength(2);
    expect(lists[0]?.tagName).toBe('UL');
    expect(lists[1]?.tagName).toBe('OL');
    expect(screen.getByRole('listitem').elements()).toHaveLength(4);
    expect(lists[1]?.textContent).toBe('3.three4.four');
    expect(lists[0]?.querySelector('[aria-hidden="true"]')?.textContent).toBe('•');
  });

  it('keeps https and mailto links, opening them in a new tab', async () => {
    const screen = await show('[guide](https://example.com/a) and [mail](mailto:a@example.com)');
    const guide = screen.getByRole('link', { name: /guide/ });
    await expect.element(guide).toHaveAttribute('href', 'https://example.com/a');
    await expect.element(guide).toHaveAttribute('target', '_blank');
    await expect.element(screen.getByRole('link', { name: /mail/ })).toBeVisible();
  });

  it('drops unsafe link addresses but keeps their text', async () => {
    const screen = await show('[x](javascript:void) and [y](data:text/html;base64,AAAA)');
    expect(document.querySelector('a')).toBeNull();
    await expect.element(screen.getByText(/x and y/)).toBeVisible();
  });

  it('shows raw HTML as text and creates no elements from it', async () => {
    const screen = await show('<img src=x onerror=alert(1)> <script>alert(2)</script> <b>no</b>');
    expect(screen.container.querySelector('img, script, b')).toBeNull();
    await expect.element(screen.getByText(/<img src=x onerror=alert\(1\)>/)).toBeVisible();
  });

  it('leaves unclosed emphasis as typed while a reply streams', async () => {
    await show('A **half-written and `open');
    expect(document.querySelector('strong, code')).toBeNull();
    expect(document.querySelector('p')?.textContent).toBe('A **half-written and `open');
  });

  describe('in a ChatPanel', () => {
    it('formats assistant replies and leaves your own messages plain', async () => {
      const screen = await renderWithProvider(
        <MarkdownChat
          initialItems={[
            { id: 'a', role: 'user', content: 'use **this**' },
            { id: 'b', role: 'assistant', content: 'Use **that**' },
            { id: 'c', role: 'assistant', status: 'error', content: 'Failed with **code**' },
          ]}
        />,
      );
      expect(document.querySelectorAll('strong')).toHaveLength(1);
      expect(document.querySelector('strong')?.textContent).toBe('that');
      expect(screen.container.textContent).toContain('use **this**');
      expect(screen.container.textContent).toContain('Failed with **code**');
    });

    it('adds a sent message as plain text', async () => {
      const screen = await renderWithProvider(<MarkdownChat initialItems={[]} />);
      await userEvent.type(screen.getByRole('textbox', { name: 'Message' }), '**x**{Enter}');
      await expect.poll(() => screen.container.textContent).toContain('**x**');
      expect(screen.container.querySelector('strong')).toBeNull();
    });

    it('has no axe violations', async () => {
      await renderWithProvider(<MarkdownChat />);
      await expectNoViolationsOnceSettled();
    });
  });
});
