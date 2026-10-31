import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { SuggestionChip } from './SuggestionChip';

describe('SuggestionChip', () => {
  describe('rendering', () => {
    it('renders a button named by the suggested text only (the plus is decorative)', async () => {
      const screen = await renderWithProvider(
        <SuggestionChip>Your order has shipped.</SuggestionChip>,
      );
      const chip = screen.getByRole('button', { name: 'Your order has shipped.' });
      await expect.element(chip).toBeVisible();
      const icon = chip.element().querySelector('svg');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('has a dashed border', async () => {
      const screen = await renderWithProvider(<SuggestionChip>Thanks</SuggestionChip>);
      const style = getComputedStyle(screen.getByRole('button').element());
      expect(style.borderTopStyle).toBe('dashed');
    });

    it('wraps long text inside a narrow container', async () => {
      const screen = await renderWithProvider(
        <div style={{ inlineSize: 200 }}>
          <SuggestionChip>
            We are checking with the carrier and will update you as soon as possible
          </SuggestionChip>
        </div>,
      );
      expect(
        screen.getByRole('button').element().getBoundingClientRect().width,
      ).toBeLessThanOrEqual(200);
    });

    it('merges className, forwards the ref and passes other props through', async () => {
      const ref = createRef<HTMLButtonElement>();
      await renderWithProvider(
        <SuggestionChip ref={ref} className="extra" data-testid="c" aria-describedby="hint">
          Thanks
        </SuggestionChip>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.classList.contains('extra')).toBe(true);
      expect(ref.current?.getAttribute('data-testid')).toBe('c');
      expect(ref.current?.getAttribute('aria-describedby')).toBe('hint');
    });
  });

  describe('interaction', () => {
    it('calls onPress on click, Enter and Space', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(
        <SuggestionChip onPress={onPress}>Thanks</SuggestionChip>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
      await expect.element(screen.getByRole('button')).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(onPress).toHaveBeenCalledTimes(2);
      await userEvent.keyboard(' ');
      expect(onPress).toHaveBeenCalledTimes(3);
    });

    it('is disabled with the shared disabled opacity and ignores presses', async () => {
      const onPress = vi.fn();
      const screen = await renderWithProvider(
        <SuggestionChip isDisabled onPress={onPress}>
          Thanks
        </SuggestionChip>,
      );
      const chip = screen.getByRole('button');
      await expect.element(chip).toBeDisabled();
      expect(getComputedStyle(chip.element()).opacity).toBe('0.35');
      await userEvent.click(chip, { force: true });
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <div role="group" aria-label="Suggested replies">
            <SuggestionChip>Thanks for your patience.</SuggestionChip>
            <SuggestionChip isDisabled>Your order has shipped.</SuggestionChip>
          </div>
        </main>,
      );
      await expectNoA11yViolations(screen.container);
    });

    it('has no axe violations when focused (axe)', async () => {
      const screen = await renderWithProvider(
        <main>
          <SuggestionChip>Thanks for your patience.</SuggestionChip>
        </main>,
      );
      await userEvent.keyboard('{Tab}');
      await expectNoA11yViolations(screen.container);
    });
  });
});
