import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ApprovalCard } from './ApprovalCard';
import type { ApprovalCardProps } from './ApprovalCard';

const review: ApprovalCardProps = {
  kind: 'review',
  author: 'buyer_sp',
  rating: 2,
  itemName: 'Knit jersey, black',
  itemColor: '#1b1b1d',
  when: 'today, 10:40',
  whenDateTime: '2026-10-31T10:40:00',
  message: 'The backpack came with a small defect at the zipper.',
  defaultDraft: 'Sorry about that. We will check the batch.',
  flag: '2-star review: read it carefully before sending.',
};

describe('ApprovalCard', () => {
  describe('semantics', () => {
    it('is an article named by kind and author', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      await expect.element(screen.getByRole('article', { name: 'Review buyer_sp' })).toBeVisible();
      await expect
        .element(screen.getByRole('heading', { level: 3, name: 'Review buyer_sp' }))
        .toBeVisible();
    });

    it('is named by the kind alone without an author, and supports another heading level', async () => {
      const screen = await renderWithProvider(
        <ApprovalCard message="Do you ship abroad?" headingLevel={2} />,
      );
      await expect.element(screen.getByRole('article', { name: 'Question' })).toBeVisible();
      await expect.element(screen.getByRole('heading', { level: 2 })).toBeVisible();
    });

    it('describes the card with the flag', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      await expect
        .element(screen.getByRole('article'))
        .toHaveAccessibleDescription('2-star review: read it carefully before sending.');
    });

    it('shows the rating only for reviews', async () => {
      const screen = await renderWithProvider(
        <>
          <ApprovalCard {...review} />
          <ApprovalCard kind="question" rating={5} author="q1" message="Question text" />
        </>,
      );
      expect(screen.getByRole('img', { name: '2 out of 5 stars' }).elements()).toHaveLength(1);
    });

    it('renders the item with a decorative dot and a machine-readable time', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      await expect.element(screen.getByText('Knit jersey, black')).toBeVisible();
      const article = screen.getByRole('article').element();
      expect(article.querySelector('time')?.getAttribute('datetime')).toBe('2026-10-31T10:40:00');
      expect(article.querySelectorAll('[role="img"]')).toHaveLength(1); // the rating only
    });

    it('labels the customer message for screen readers', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      expect(screen.getByRole('article').element().textContent).toContain(
        'Customer message: The backpack came',
      );
    });

    it('uses a secondary Send and a ghost Discard, both described by the card', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      const send = screen.getByRole('button', { name: 'Send reply' });
      const discard = screen.getByRole('button', { name: 'Discard reply' });
      await expect.element(send).toHaveAttribute('data-variant', 'secondary');
      await expect.element(discard).toHaveAttribute('data-variant', 'ghost');
      await expect.element(send).toHaveAccessibleDescription('Review buyer_sp');
    });
  });

  describe('draft', () => {
    it('labels the textarea and links the hint', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      const field = screen.getByRole('textbox', { name: 'Agent reply' });
      await expect.element(field).toHaveValue('Sorry about that. We will check the batch.');
      await expect.element(field).toHaveAccessibleDescription('You can edit before sending');
    });

    it('works uncontrolled and reports edits', async () => {
      const onDraftChange = vi.fn();
      const screen = await renderWithProvider(
        <ApprovalCard {...review} defaultDraft="Hi" onDraftChange={onDraftChange} />,
      );
      screen.getByRole('textbox', { name: 'Agent reply' }).element().focus();
      await userEvent.keyboard('{Control>}{End}{/Control}!');
      expect(onDraftChange).toHaveBeenLastCalledWith('Hi!');
    });

    it('works controlled', async () => {
      function Controlled() {
        const [draft, setDraft] = useState('One');
        return (
          <ApprovalCard
            {...review}
            defaultDraft={undefined}
            draft={draft}
            onDraftChange={setDraft}
          />
        );
      }
      const screen = await renderWithProvider(<Controlled />);
      const field = screen.getByRole('textbox', { name: 'Agent reply' });
      field.element().focus();
      await userEvent.keyboard('{Control>}{End}{/Control} two');
      await expect.element(field).toHaveValue('One two');
    });
  });

  describe('actions', () => {
    it('calls onSend and onDiscard from the keyboard without asking for confirmation', async () => {
      const onSend = vi.fn();
      const onDiscard = vi.fn();
      const screen = await renderWithProvider(
        <ApprovalCard {...review} onSend={onSend} onDiscard={onDiscard} />,
      );
      screen.getByRole('button', { name: 'Discard reply' }).element().focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.tab();
      await userEvent.keyboard(' ');
      expect(onDiscard).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('dialog').elements()).toHaveLength(0);
    });

    it('keeps the tab order: draft, discard, send', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />);
      await userEvent.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('textbox', { name: 'Agent reply' }).element(),
      );
      await userEvent.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Discard reply' }).element(),
      );
      await userEvent.tab();
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Send reply' }).element(),
      );
    });
  });

  describe('i18n', () => {
    it('renders pt-BR', async () => {
      const screen = await renderWithProvider(<ApprovalCard {...review} />, { locale: 'pt-BR' });
      await expect
        .element(screen.getByRole('article', { name: 'Avaliação buyer_sp' }))
        .toBeVisible();
      await expect
        .element(screen.getByRole('textbox', { name: 'Resposta do agente' }))
        .toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Enviar resposta' })).toBeVisible();
      await expect.element(screen.getByRole('img', { name: '2 de 5 estrelas' })).toBeVisible();
    });

    it('accepts instance and provider overrides', async () => {
      const instance = await renderWithProvider(
        <ApprovalCard {...review} messages={{ send: 'Approve and send' }} />,
      );
      await expect
        .element(instance.getByRole('button', { name: 'Approve and send' }))
        .toBeVisible();
      await instance.unmount();
      const provider = await renderWithProvider(<ApprovalCard {...review} />, {
        messages: { ApprovalCard: { discard: 'Drop reply' } },
      });
      await expect.element(provider.getByRole('button', { name: 'Drop reply' })).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(
      <ApprovalCard {...review} ref={ref} className="extra" id="approval-1" />,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('approval-1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Approvals</h1>
        <ApprovalCard {...review} headingLevel={2} />
        <ApprovalCard
          headingLevel={2}
          author="q1"
          message="Do you ship abroad?"
          defaultDraft="Yes."
        />
        <ApprovalCard
          headingLevel={2}
          kind="review"
          rating={5}
          message="Great"
          defaultDraft="Thanks"
        />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
