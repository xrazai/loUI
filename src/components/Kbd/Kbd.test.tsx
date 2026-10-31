import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Kbd } from './Kbd';

/** Text a screen reader would read: everything except `aria-hidden` subtrees. */
function spoken(element: Element): string {
  if (element.getAttribute('aria-hidden') === 'true') return '';
  return Array.from(element.childNodes)
    .map((node) => (node instanceof Element ? spoken(node) : (node.textContent ?? '')))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Text a sighted user sees: the `aria-hidden` symbols, but not the visually hidden names. */
function seen(element: Element): string {
  return Array.from(element.querySelectorAll('kbd'))
    .map((key) => key.querySelector('[aria-hidden="true"]')?.textContent ?? key.textContent)
    .join('');
}

describe('Kbd', () => {
  it('renders a kbd element with children as is', async () => {
    const screen = await renderWithProvider(<Kbd data-testid="k">⌘K</Kbd>);
    const element = screen.getByTestId('k').element();
    expect(element.tagName).toBe('KBD');
    expect(element.textContent).toBe('⌘K');
  });

  it('renders Mod as the command symbol on Apple platforms, with its spoken name', async () => {
    const screen = await renderWithProvider(
      <Kbd platform="apple" keys={['Mod', 'k']} data-testid="k" />,
    );
    const element = screen.getByTestId('k').element();
    expect(seen(element)).toBe('⌘K');
    expect(spoken(element)).toBe('Command K');
  });

  it('renders Mod as Ctrl elsewhere, spoken as Control', async () => {
    const screen = await renderWithProvider(
      <Kbd platform="other" keys={['Mod', 'K']} data-testid="k" />,
    );
    const element = screen.getByTestId('k').element();
    expect(seen(element)).toBe('CtrlK');
    expect(spoken(element)).toBe('Control K');
  });

  it('expands symbols and abbreviations into names for screen readers', async () => {
    const screen = await renderWithProvider(
      <>
        <Kbd platform="apple" keys={['Shift', 'Enter']} data-testid="a" />
        <Kbd platform="other" keys={['Ctrl', 'Shift', 'Esc']} data-testid="b" />
        <Kbd platform="other" keys={['Alt', 'ArrowUp']} data-testid="c" />
      </>,
    );
    expect(spoken(screen.getByTestId('a').element())).toBe('Shift Enter');
    expect(seen(screen.getByTestId('a').element())).toBe('⇧↵');
    expect(spoken(screen.getByTestId('b').element())).toBe('Control Shift Escape');
    expect(spoken(screen.getByTestId('c').element())).toBe('Option Up arrow');
  });

  it('shows unknown keys as typed, upper-casing single letters', async () => {
    const screen = await renderWithProvider(<Kbd keys={['g', '/']} data-testid="k" />);
    expect(screen.getByTestId('k').element().textContent).toBe('G/');
  });

  it('nests one kbd per key', async () => {
    const screen = await renderWithProvider(<Kbd keys={['Mod', 'K']} data-testid="k" />);
    expect(screen.getByTestId('k').element().querySelectorAll('kbd')).toHaveLength(2);
  });

  it('detects the platform in the browser when it is not forced', async () => {
    const screen = await renderWithProvider(<Kbd keys={['Mod', 'K']} data-testid="k" />);
    const mac = /mac|iphone|ipad|ipod/i.test(navigator.platform);
    expect(spoken(screen.getByTestId('k').element())).toBe(mac ? 'Command K' : 'Control K');
  });

  it('uses the pt-BR names when the locale is pt-BR', async () => {
    const screen = await renderWithProvider(
      <Kbd platform="other" keys={['Mod', 'Space']} data-testid="k" />,
      {
        locale: 'pt-BR',
      },
    );
    expect(spoken(screen.getByTestId('k').element())).toBe('Control Espaço');
  });

  it('applies provider and instance message overrides', async () => {
    const provider = await renderWithProvider(
      <Kbd platform="apple" keys={['Mod', 'K']} data-testid="k" />,
      {
        messages: { Kbd: { name: (key: string) => `Tecla ${key}` } },
      },
    );
    expect(spoken(provider.getByTestId('k').element())).toBe('Tecla command K');

    const instance = await renderWithProvider(
      <Kbd
        platform="apple"
        keys={['Mod', 'K']}
        data-testid="i"
        messages={{ name: () => 'Comando' }}
      />,
      { messages: { Kbd: { name: () => 'Provider' } } },
    );
    expect(spoken(instance.getByTestId('i').element())).toBe('Comando K');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLElement>();
    await renderWithProvider(<Kbd ref={ref} className="extra" id="k1" keys={['Esc']} />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('k1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <p>
          Press <Kbd keys={['Mod', 'K']} /> to search,{' '}
          <Kbd keys={['Shift', 'Enter']} platform="apple" /> to send or <Kbd>Esc</Kbd> to close.
        </p>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
