import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Icon } from './Icon';
import { CheckIcon, ChevronRightIcon, iconNames, iconSet } from './icons';

describe('Icon', () => {
  it('is decorative by default', async () => {
    const screen = await renderWithProvider(<Icon icon={CheckIcon} />);
    const svg = screen.container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.getAttribute('role')).toBeNull();
    expect(svg?.getAttribute('aria-label')).toBeNull();
  });

  it('becomes an image with a name when `label` is set', async () => {
    const screen = await renderWithProvider(<Icon icon={CheckIcon} label="Saved" />);
    await expect.element(screen.getByRole('img', { name: 'Saved' })).toBeInTheDocument();
    expect(screen.container.querySelector('svg')?.getAttribute('aria-hidden')).toBeNull();
  });

  it.each([
    ['xs', 12],
    ['sm', 14],
    ['md', 18],
    ['lg', 20],
  ] as const)('draws size %s at %i px (from --ds-icon-* tokens)', async (size, px) => {
    const ref = createRef<SVGSVGElement>();
    await renderWithProvider(<Icon ref={ref} icon={CheckIcon} size={size} />);
    const rect = ref.current?.getBoundingClientRect();
    expect(rect?.width).toBe(px);
    expect(rect?.height).toBe(px);
  });

  it('defaults to the md size', async () => {
    const ref = createRef<SVGSVGElement>();
    await renderWithProvider(<Icon ref={ref} icon={CheckIcon} />);
    expect(ref.current?.getBoundingClientRect().width).toBe(18);
  });

  it('draws a 1.5px non-scaling stroke from the token and follows the text color', async () => {
    const ref = createRef<SVGSVGElement>();
    await renderWithProvider(
      <span style={{ color: 'rgb(10, 20, 30)' }}>
        <Icon ref={ref} icon={CheckIcon} />
      </span>,
    );
    const style = getComputedStyle(ref.current as SVGSVGElement);
    expect(style.strokeWidth).toBe('1.5px');
    expect(style.stroke).toBe('rgb(10, 20, 30)');
    const path = ref.current?.querySelector('path') as SVGPathElement;
    expect(getComputedStyle(path).vectorEffect).toBe('non-scaling-stroke');
  });

  it('merges className, forwards the ref and passes other props through', async () => {
    const ref = createRef<SVGSVGElement>();
    await renderWithProvider(
      <Icon ref={ref} icon={CheckIcon} className="extra" data-testid="icon" />,
    );
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.classList.length).toBeGreaterThan(1);
    expect(ref.current?.getAttribute('data-testid')).toBe('icon');
  });

  it('mirrors directional icons in RTL only', async () => {
    const plain = createRef<SVGSVGElement>();
    const mirrored = createRef<SVGSVGElement>();
    const mirroredLtr = createRef<SVGSVGElement>();
    await renderWithProvider(
      <>
        <div dir="rtl">
          <Icon ref={plain} icon={ChevronRightIcon} />
          <Icon ref={mirrored} icon={ChevronRightIcon} directional />
        </div>
        <div dir="ltr">
          <Icon ref={mirroredLtr} icon={ChevronRightIcon} directional />
        </div>
      </>,
    );
    const transform = (el: SVGSVGElement | null) => getComputedStyle(el as SVGSVGElement).transform;
    expect(transform(plain.current)).toBe('none');
    expect(transform(mirrored.current)).toBe('matrix(-1, 0, 0, 1, 0, 0)');
    expect(transform(mirroredLtr.current)).toBe('none');
  });

  it('is inline SVG: nothing is fetched at runtime', async () => {
    const screen = await renderWithProvider(<Icon icon={CheckIcon} />);
    expect(screen.container.querySelector('svg path, svg circle, svg line')).not.toBeNull();
    expect(screen.container.querySelector('img, use, image')).toBeNull();
  });

  it('has no axe violations (decorative and labeled)', async () => {
    const screen = await renderWithProvider(
      <main>
        <p>
          <Icon icon={CheckIcon} /> Done
        </p>
        <Icon icon={CheckIcon} label="Saved" />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});

describe('icon set', () => {
  it('lists every exported icon once, with a documented use', () => {
    expect(Object.keys(iconSet).sort()).toEqual(Object.keys(iconNames).sort());
    for (const use of Object.values(iconNames)) expect(use.length).toBeGreaterThan(8);
  });

  it('includes the generic action icons (GAP-028)', () => {
    for (const name of [
      'trash',
      'pencil',
      'printer',
      'archive',
      'bell',
      'link',
      'filter',
      'users',
      'bot',
      'sparkles',
    ] as const) {
      expect(iconSet[name], name).toBeDefined();
      expect(iconNames[name].length, name).toBeGreaterThan(8);
    }
  });

  it('keeps domain icons out of the core set', () => {
    for (const name of ['truck', 'wallet', 'cart', 'whatsapp']) {
      expect(Object.keys(iconSet)).not.toContain(name);
    }
  });

  it('renders every icon of the set', async () => {
    const screen = await renderWithProvider(
      <>
        {Object.entries(iconSet).map(([name, glyph]) => (
          <Icon key={name} icon={glyph} />
        ))}
      </>,
    );
    expect(screen.container.querySelectorAll('svg').length).toBe(Object.keys(iconSet).length);
  });
});
