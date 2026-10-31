import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Text } from './Text';

describe('Text', () => {
  it('renders a span at body size by default', async () => {
    const screen = await renderWithProvider(<Text data-testid="text">Hello</Text>);
    const element = screen.getByTestId('text').element();
    expect(element.tagName).toBe('SPAN');
    expect(getComputedStyle(element).fontSize).toBe('15px');
    expect(getComputedStyle(element).lineHeight).toBe('24px');
  });

  it.each([
    ['body', '15px', '24px'],
    ['small', '14px', '22px'],
    ['label', '13px', '18px'],
    ['meta', '12px', '16px'],
    ['caption', '11.5px', '16px'],
  ] as const)('size %s is %s over %s', async (size, fontSize, lineHeight) => {
    const screen = await renderWithProvider(
      <Text size={size} data-testid="text">
        Hello
      </Text>,
    );
    const style = getComputedStyle(screen.getByTestId('text').element());
    expect(style.fontSize).toBe(fontSize);
    expect(style.lineHeight).toBe(lineHeight);
  });

  it('caption is mono, uppercase and tracked', async () => {
    const screen = await renderWithProvider(
      <Text size="caption" data-testid="text">
        Group name
      </Text>,
    );
    const style = getComputedStyle(screen.getByTestId('text').element());
    expect(style.fontFamily).toContain('Geist Mono');
    expect(style.textTransform).toBe('uppercase');
    expect(style.letterSpacing).not.toBe('normal');
    expect(parseFloat(style.letterSpacing)).toBeCloseTo(0.92, 1);
  });

  it('maps tone to the text tokens', async () => {
    const screen = await renderWithProvider(
      <>
        <Text data-testid="default">A</Text>
        <Text tone="secondary" data-testid="secondary">
          B
        </Text>
        <Text tone="tertiary" data-testid="tertiary">
          C
        </Text>
      </>,
    );
    const root = getComputedStyle(document.documentElement);
    const color = (id: string) => getComputedStyle(screen.getByTestId(id).element()).color;
    const resolve = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = root.getPropertyValue(token);
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    expect(color('default')).toBe(resolve('--ds-text'));
    expect(color('secondary')).toBe(resolve('--ds-text-2'));
    expect(color('tertiary')).toBe(resolve('--ds-text-3'));
  });

  it('mono switches to Geist Mono', async () => {
    const screen = await renderWithProvider(
      <Text mono data-testid="text">
        ORD-1048
      </Text>,
    );
    expect(getComputedStyle(screen.getByTestId('text').element()).fontFamily).toContain(
      'Geist Mono',
    );
  });

  it('truncate keeps one line with an ellipsis in a narrow box', async () => {
    const screen = await renderWithProvider(
      <div style={{ inlineSize: 80 }}>
        <Text truncate data-testid="text">
          A very long value that cannot fit in the box
        </Text>
      </div>,
    );
    const element = screen.getByTestId('text').element();
    const style = getComputedStyle(element);
    expect(style.whiteSpace).toBe('nowrap');
    expect(style.textOverflow).toBe('ellipsis');
    expect(element.getBoundingClientRect().height).toBeLessThanOrEqual(24);
    expect(element.scrollWidth).toBeGreaterThan(element.clientWidth);
  });

  it('renders the element given by as', async () => {
    const screen = await renderWithProvider(<Text as="p">Paragraph</Text>);
    await expect.element(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Paragraph').element().tagName).toBe('P');
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(
      <Text ref={ref} className="extra" id="t">
        Hello
      </Text>,
    );
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('t');
  });

  it('has no axe violations for the readable tones', async () => {
    const screen = await renderWithProvider(
      <main>
        <h1>Page</h1>
        <Text as="p">Body</Text>
        <Text as="p" size="small" tone="secondary">
          Small secondary
        </Text>
        <Text as="p" size="caption" tone="secondary">
          Caption
        </Text>
        <Text as="p" size="meta" tone="tertiary">
          Hint
        </Text>
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
