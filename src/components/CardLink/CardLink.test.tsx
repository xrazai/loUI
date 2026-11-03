import { createRef } from 'react';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { CardLink } from './CardLink';

describe('CardLink', () => {
  it('renders a real anchor named by the title only, described by the description and meta', async () => {
    const screen = await renderWithProvider(
      <CardLink title="Billing" description="Plans and invoices." meta="3 plans" href="#billing" />,
    );
    const link = screen.getByRole('link', { name: 'Billing' });
    expect(link.element().tagName).toBe('A');
    expect(link.element().getAttribute('href')).toBe('#billing');
    await expect.element(link).toHaveAccessibleName('Billing');
    await expect.element(link).toHaveAccessibleDescription('Plans and invoices. 3 plans');
  });

  it('puts the link inside a heading of the chosen level (default 3)', async () => {
    const screen = await renderWithProvider(
      <>
        <CardLink title="One" href="#one" />
        <CardLink title="Two" href="#two" headingLevel={2} />
      </>,
    );
    await expect.element(screen.getByRole('heading', { level: 3, name: 'One' })).toBeVisible();
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Two' })).toBeVisible();
  });

  it('renders a real button with onPress and runs it on click', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(<CardLink title="Import data" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Import data' });
    expect(button.element().tagName).toBe('BUTTON');
    await button.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('covers the whole card with the hit area, not only the title text', async () => {
    const screen = await renderWithProvider(
      <CardLink
        title="Import"
        description="Upload a CSV file."
        onPress={() => undefined}
        data-testid="c"
      />,
    );
    const root = screen.getByTestId('c').element();
    const rect = root.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.right - 8, rect.bottom - 8);
    expect(hit?.closest('button')).not.toBeNull();
  });

  it('activates a button with Enter and Space and a link with Enter', async () => {
    const onButton = vi.fn();
    const onLink = vi.fn();
    await renderWithProvider(
      <>
        <CardLink title="Action" onPress={onButton} />
        <CardLink title="Page" href="#page" onPress={onLink} />
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

  it('a disabled card is not focusable, ignores presses and is marked disabled', async () => {
    const onPress = vi.fn();
    const screen = await renderWithProvider(
      <CardLink title="Action" isDisabled onPress={onPress} />,
    );
    const button = screen.getByRole('button', { name: 'Action' });
    await expect.element(button).toBeDisabled();
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('marks a disabled link with aria-disabled', async () => {
    const screen = await renderWithProvider(<CardLink title="Page" href="#p" isDisabled />);
    await expect
      .element(screen.getByRole('link', { name: 'Page' }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('adds rel and a translated hidden note for target _blank', async () => {
    const screen = await renderWithProvider(
      <CardLink title="Docs" href="https://example.com" target="_blank" />,
      { locale: 'pt-BR' },
    );
    const link = screen.getByRole('link');
    expect(link.element().getAttribute('rel')).toBe('noopener noreferrer');
    await expect.element(link).toHaveAccessibleName('Docs (abre em uma nova aba)');
  });

  it('overrides messages per instance', async () => {
    const screen = await renderWithProvider(
      <CardLink
        title="Docs"
        href="https://example.com"
        target="_blank"
        messages={{ opensInNewTab: '(new tab)' }}
      />,
    );
    await expect.element(screen.getByRole('link')).toHaveAccessibleName('Docs (new tab)');
  });

  it('merges className and forwards the ref to the root', async () => {
    const ref = createRef<HTMLDivElement>();
    const screen = await renderWithProvider(
      <CardLink title="A" href="#a" ref={ref} className="extra" data-testid="c" />,
    );
    expect(ref.current).toBe(screen.getByTestId('c').element());
    expect(ref.current?.getAttribute('class')).toContain('extra');
  });

  it('draws a focus ring on the card outline for keyboard focus', async () => {
    const screen = await renderWithProvider(<CardLink title="A" href="#a" />);
    await userEvent.keyboard('{Tab}');
    const action = screen.getByRole('link').element();
    expect(action.hasAttribute('data-focus-visible')).toBe(true);
    expect(getComputedStyle(action, '::after').boxShadow).not.toBe('none');
  });

  it('has no axe violations as a link, a button, with meta and disabled', async () => {
    const screen = await renderWithProvider(
      <div>
        <CardLink title="Billing" description="Plans." meta="3" href="#b" />
        <CardLink title="Import" onPress={() => undefined} />
        <CardLink title="Off" href="#o" isDisabled />
      </div>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
