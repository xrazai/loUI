import { describe, expect, it } from 'vitest';
import { axNodes } from '../../test/live-regions/helpers';
import { renderWithProvider } from '../../test/render';
import { Kbd } from '../Kbd';
import { Button } from './Button';

describe('Button shortcut hint (GAP-045)', () => {
  it('names the button once when a Kbd is the trailing hint', async () => {
    await renderWithProvider(
      <main>
        <Button trailing={<Kbd keys={['Esc']} />}>Settings</Button>
      </main>,
    );
    const nodes = await axNodes();
    const button = nodes.find((node) => node.role === 'button');
    expect(button?.name).toBe('Settings');
  });

  it('exposes the shortcut once through aria-keyshortcuts', async () => {
    const screen = await renderWithProvider(
      <main>
        <Button shortcut={['Mod', 'K']}>Open search</Button>
      </main>,
    );
    const element = screen.getByRole('button', { name: 'Open search' }).element();
    expect(element.getAttribute('aria-keyshortcuts')).toBe('Control+K');
    expect(element.querySelector('kbd')).not.toBeNull();
    const button = (await axNodes()).find((node) => node.role === 'button');
    expect(button?.name).toBe('Open search');
  });
});
