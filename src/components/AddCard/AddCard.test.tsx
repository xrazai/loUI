import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { AddCard } from './AddCard';

describe('AddCard', () => {
  it('renders a real button named by its label, with a decorative plus icon', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(<AddCard onPress={onPress}>Create agent</AddCard>);
    const button = screen.getByRole('button', { name: 'Create agent' });
    expect(button.element().tagName).toBe('BUTTON');
    expect(button.element().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    await button.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a real anchor with href', async () => {
    const screen = await renderWithProvider(<AddCard href="#new">Create agent</AddCard>);
    const link = screen.getByRole('link', { name: 'Create agent' });
    expect(link.element().tagName).toBe('A');
    expect(link.element().getAttribute('href')).toBe('#new');
  });

  it('has a dashed border', async () => {
    const screen = await renderWithProvider(
      <AddCard onPress={() => undefined}>Create agent</AddCard>,
    );
    const style = getComputedStyle(screen.getByRole('button').element());
    expect(style.borderStyle).toBe('dashed');
  });

  it('activates a button with Enter and Space and a link with Enter', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    await renderWithProvider(
      <>
        <AddCard onPress={onButton}>Create agent</AddCard>
        <AddCard href="#new" onPress={onLink}>
          Create report
        </AddCard>
      </>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onButton).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onLink).toHaveBeenCalledTimes(1);
  });

  it('a disabled tile is not focusable and ignores presses', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(
      <AddCard isDisabled onPress={onPress}>
        Create agent
      </AddCard>,
    );
    await expect.element(screen.getByRole('button')).toBeDisabled();
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('adds rel and a translated note for target _blank', async () => {
    const screen = await renderWithProvider(
      <AddCard href="https://example.com/new" target="_blank">
        Create agent
      </AddCard>,
      { locale: 'pt-BR' },
    );
    const link = screen.getByRole('link');
    expect(link.element().getAttribute('rel')).toBe('noopener noreferrer');
    await expect.element(link).toHaveAccessibleName('Create agent (abre em uma nova aba)');
  });

  it('merges className, forwards the ref and meets the 24 px target size', async () => {
    const ref = createRef<HTMLButtonElement>();
    const screen = await renderWithProvider(
      <AddCard ref={ref} className="extra" onPress={() => undefined}>
        Create agent
      </AddCard>,
    );
    const button = screen.getByRole('button').element();
    expect(ref.current).toBe(button);
    expect(button.getAttribute('class')).toContain('extra');
    const rect = button.getBoundingClientRect();
    expect(rect.height).toBeGreaterThanOrEqual(24);
    expect(rect.width).toBeGreaterThanOrEqual(24);
  });

  it('has no axe violations as a button, a link and disabled', async () => {
    const screen = await renderWithProvider(
      <div>
        <AddCard onPress={() => undefined}>Create agent</AddCard>
        <AddCard href="#new">Create report</AddCard>
        <AddCard isDisabled onPress={() => undefined}>
          Create team
        </AddCard>
      </div>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
