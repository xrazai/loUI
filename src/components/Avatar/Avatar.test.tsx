import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { renderWithProvider } from '../../test/render';
import { Avatar } from './Avatar';

const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="gray"/></svg>',
  );
const BROKEN = 'data:image/png;base64,AAAA';

describe('Avatar', () => {
  it('shows the initials of the name and exposes the name as an image', async () => {
    const screen = await renderWithProvider(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    await expect.element(avatar).toBeVisible();
    expect(avatar.element().textContent).toBe('AL');
    expect(avatar.element().querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('uses the name as the alt text of the photo', async () => {
    const screen = await renderWithProvider(<Avatar name="Ada Lovelace" src={PHOTO} />);
    await expect.element(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeVisible();
    expect(screen.container.querySelector('img')?.getAttribute('alt')).toBe('Ada Lovelace');
  });

  it('falls back to the initials when the photo fails to load', async () => {
    const screen = await renderWithProvider(<Avatar name="Ada Lovelace" src={BROKEN} />);
    await expect.poll(() => screen.container.querySelector('img')).toBeNull();
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar.element().textContent).toBe('AL');
  });

  it('tries again when src changes after a failure', async () => {
    const screen = await renderWithProvider(<Avatar name="Ada Lovelace" src={BROKEN} />);
    await expect.poll(() => screen.container.querySelector('img')).toBeNull();
    await screen.rerender(<Avatar name="Ada Lovelace" src={PHOTO} />);
    await expect.poll(() => screen.container.querySelector('img')).not.toBeNull();
  });

  it('is hidden from assistive technology when decorative', async () => {
    const screen = await renderWithProvider(
      <>
        <Avatar decorative name="Ada Lovelace" data-testid="initials" />
        <Avatar decorative name="Ada Lovelace" src={PHOTO} data-testid="photo" />
      </>,
    );
    const initials = screen.getByTestId('initials').element();
    expect(initials.getAttribute('role')).toBeNull();
    expect(initials.getAttribute('aria-label')).toBeNull();
    expect(initials.querySelector('[aria-hidden="true"]')?.textContent).toBe('AL');
    expect(screen.container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('computes initials with the locale of the provider', async () => {
    const screen = await renderWithProvider(<Avatar name="irmak ilgaz" />, { locale: 'tr-TR' });
    expect(screen.getByRole('img', { name: 'irmak ilgaz' }).element().textContent).toBe('İİ');
  });

  it('exposes size and ring as data attributes and sizes the circle with tokens', async () => {
    const screen = await renderWithProvider(
      <>
        <Avatar name="Ada Lovelace" size="sm" data-testid="sm" />
        <Avatar name="Ada Lovelace" data-testid="md" ring />
        <Avatar name="Ada Lovelace" size="lg" data-testid="lg" />
      </>,
    );
    const size = (id: string) => screen.getByTestId(id).element().getBoundingClientRect().width;
    expect(size('sm')).toBe(24);
    expect(size('md')).toBe(28);
    expect(size('lg')).toBe(40);
    expect(screen.getByTestId('md').element().hasAttribute('data-ring')).toBe(true);
  });

  it('merges className, spreads rest props and takes the ref as a prop', async () => {
    const ref = createRef<HTMLSpanElement>();
    await renderWithProvider(<Avatar ref={ref} name="Ada Lovelace" className="extra" id="a1" />);
    expect(ref.current?.classList.contains('extra')).toBe(true);
    expect(ref.current?.id).toBe('a1');
  });

  it('has no axe violations', async () => {
    const screen = await renderWithProvider(
      <main>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" size="lg" ring />
        <Avatar name="Alan Turing" src={PHOTO} size="sm" />
        <Avatar decorative name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" src={BROKEN} />
      </main>,
    );
    await expectNoA11yViolations(screen.container);
  });
});
