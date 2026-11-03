import { createRef, useState } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { ResponseFeedback } from './ResponseFeedback';
import type { ResponseRating } from './ResponseFeedback';

describe('ResponseFeedback', () => {
  describe('rating', () => {
    it('is a labelled group of two toggle buttons, neither pressed at first', async () => {
      const screen = await renderWithProvider(<ResponseFeedback />);
      await expect.element(screen.getByRole('group', { name: 'Rate this response' })).toBeVisible();
      await expect
        .element(screen.getByRole('button', { name: 'Good response' }))
        .toHaveAttribute('aria-pressed', 'false');
      await expect
        .element(screen.getByRole('button', { name: 'Bad response' }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('presses one at a time and reports the rating', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(<ResponseFeedback onChange={onChange} />);
      const good = screen.getByRole('button', { name: 'Good response' });
      const bad = screen.getByRole('button', { name: 'Bad response' });
      await userEvent.click(good);
      expect(onChange).toHaveBeenLastCalledWith('positive');
      await userEvent.click(bad);
      expect(onChange).toHaveBeenLastCalledWith('negative');
      await expect.element(good).toHaveAttribute('aria-pressed', 'false');
      await expect.element(bad).toHaveAttribute('aria-pressed', 'true');
    });

    it('takes the rating back when the pressed button is pressed again', async () => {
      const onChange = vi.fn();
      const screen = await renderWithProvider(
        <ResponseFeedback defaultValue="positive" onChange={onChange} />,
      );
      const good = screen.getByRole('button', { name: 'Good response' });
      await expect.element(good).toHaveAttribute('aria-pressed', 'true');
      await userEvent.click(good);
      expect(onChange).toHaveBeenLastCalledWith(null);
      await expect.element(good).toHaveAttribute('aria-pressed', 'false');
    });

    it('works controlled', async () => {
      function Controlled() {
        const [value, setValue] = useState<ResponseRating | null>(null);
        return <ResponseFeedback value={value} onChange={setValue} />;
      }
      const screen = await renderWithProvider(<Controlled />);
      await userEvent.click(screen.getByRole('button', { name: 'Bad response' }));
      await expect
        .element(screen.getByRole('button', { name: 'Bad response' }))
        .toHaveAttribute('aria-pressed', 'true');
    });

    it('stays put when controlled and the parent ignores the change', async () => {
      const screen = await renderWithProvider(<ResponseFeedback value={null} onChange={vi.fn()} />);
      await userEvent.click(screen.getByRole('button', { name: 'Good response' }));
      await expect
        .element(screen.getByRole('button', { name: 'Good response' }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('works with the keyboard', async () => {
      const screen = await renderWithProvider(<ResponseFeedback />);
      await userEvent.tab();
      await expect.element(screen.getByRole('button', { name: 'Good response' })).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect
        .element(screen.getByRole('button', { name: 'Good response' }))
        .toHaveAttribute('aria-pressed', 'true');
      await userEvent.tab();
      await userEvent.keyboard('{Enter}');
      await expect
        .element(screen.getByRole('button', { name: 'Bad response' }))
        .toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('announcements', () => {
    it('is silent at first, says "Feedback sent" and then "Feedback removed"', async () => {
      const screen = await renderWithProvider(<ResponseFeedback defaultValue="positive" />);
      const region = screen.getByRole('status');
      await expect.element(region).toHaveTextContent('');
      await userEvent.click(screen.getByRole('button', { name: 'Bad response' }));
      await expect.element(region).toHaveTextContent('Feedback sent');
      await userEvent.click(screen.getByRole('button', { name: 'Bad response' }));
      await expect.element(region).toHaveTextContent('Feedback removed');
    });
  });

  describe('actions', () => {
    it('shows Copy and Regenerate only when handlers are given, and calls them', async () => {
      const bare = await renderWithProvider(<ResponseFeedback />);
      expect(bare.getByRole('button', { name: 'Copy response' }).elements()).toHaveLength(0);
      expect(bare.getByRole('button', { name: 'Regenerate response' }).elements()).toHaveLength(0);
      await bare.unmount();
      const onCopy = vi.fn();
      const onRegenerate = vi.fn();
      const screen = await renderWithProvider(
        <ResponseFeedback onCopy={onCopy} onRegenerate={onRegenerate} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Copy response' }));
      await userEvent.click(screen.getByRole('button', { name: 'Regenerate response' }));
      expect(onCopy).toHaveBeenCalledTimes(1);
      expect(onRegenerate).toHaveBeenCalledTimes(1);
    });

    it('disables Regenerate while regenerating, and everything when disabled', async () => {
      const first = await renderWithProvider(
        <ResponseFeedback onRegenerate={vi.fn()} onCopy={vi.fn()} isRegenerating />,
      );
      await expect
        .element(first.getByRole('button', { name: 'Regenerate response' }))
        .toBeDisabled();
      await expect.element(first.getByRole('button', { name: 'Copy response' })).toBeEnabled();
      await first.unmount();
      const second = await renderWithProvider(
        <ResponseFeedback onRegenerate={vi.fn()} onCopy={vi.fn()} isDisabled />,
      );
      for (const name of [
        'Good response',
        'Bad response',
        'Copy response',
        'Regenerate response',
      ]) {
        await expect.element(second.getByRole('button', { name })).toBeDisabled();
      }
    });
  });

  describe('i18n', () => {
    it('renders pt-BR', async () => {
      const screen = await renderWithProvider(
        <ResponseFeedback onCopy={vi.fn()} onRegenerate={vi.fn()} />,
        { locale: 'pt-BR' },
      );
      await expect
        .element(screen.getByRole('group', { name: 'Avaliar esta resposta' }))
        .toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Resposta boa' })).toBeVisible();
      await expect.element(screen.getByRole('button', { name: 'Copiar resposta' })).toBeVisible();
    });

    it('accepts provider and instance overrides', async () => {
      const provider = await renderWithProvider(<ResponseFeedback />, {
        messages: { ResponseFeedback: { positive: 'Helpful' } },
      });
      await expect.element(provider.getByRole('button', { name: 'Helpful' })).toBeVisible();
      await provider.unmount();
      const instance = await renderWithProvider(
        <ResponseFeedback messages={{ negative: 'Not helpful' }} />,
      );
      await expect.element(instance.getByRole('button', { name: 'Not helpful' })).toBeVisible();
    });
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithProvider(<ResponseFeedback ref={ref} className="extra" id="feedback-1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('feedback-1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Chat</h1>
        <ResponseFeedback onCopy={vi.fn()} onRegenerate={vi.fn()} defaultValue="positive" />
        <ResponseFeedback />
        <ResponseFeedback isDisabled onCopy={vi.fn()} />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
