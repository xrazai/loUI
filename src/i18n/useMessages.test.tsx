import { useLocale } from 'react-aria-components';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { renderWithProvider } from '../test/render';
import { DSProvider } from '../providers/DSProvider';
import { defineMessages } from './messages';
import { plural } from './plural';
import { useDSLocale, useMessages } from './useMessages';
import type { MessageOverrides } from './messages';

const messages = defineMessages({
  en: {
    close: 'Close',
    selected: (n: number) =>
      plural('en', n, { one: '1 item selected', other: `${n} items selected` }),
  },
  'pt-BR': {
    close: 'Fechar',
    selected: (n: number) =>
      plural('pt-BR', n, { one: `${n} item selecionado`, other: `${n} itens selecionados` }),
  },
});

function Probe({ overrides }: { overrides?: MessageOverrides }) {
  const t = useMessages('Probe', messages, overrides);
  const locale = useDSLocale();
  const rac = useLocale();
  return (
    <div>
      <button type="button">{t.close}</button>
      <output data-testid="count">{t.selected(2)}</output>
      <output data-testid="locale">{locale}</output>
      <output data-testid="rac">{`${rac.locale} ${rac.direction}`}</output>
    </div>
  );
}

describe('useMessages', () => {
  it('uses English without a provider', async () => {
    const screen = await render(<Probe />);
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    await expect.element(screen.getByTestId('locale')).toHaveTextContent('en-US');
  });

  it('uses English by default inside DSProvider', async () => {
    const screen = await renderWithProvider(<Probe />);
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    await expect.element(screen.getByTestId('count')).toHaveTextContent('2 items selected');
  });

  it('renders the pt-BR catalog', async () => {
    const screen = await renderWithProvider(<Probe />, { locale: 'pt-BR' });
    await expect.element(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    await expect.element(screen.getByTestId('count')).toHaveTextContent('2 itens selecionados');
  });

  it('re-renders when the locale changes', async () => {
    const screen = await renderWithProvider(<Probe />, { locale: 'en-US' });
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    await screen.rerender(
      <DSProvider locale="pt-BR">
        <Probe />
      </DSProvider>,
    );
    await expect.element(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    await expect.element(screen.getByTestId('locale')).toHaveTextContent('pt-BR');
  });

  it('applies provider overrides keyed by component', async () => {
    const screen = await renderWithProvider(<Probe />, {
      messages: { Probe: { close: 'Dismiss' } },
    });
    await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('applies instance overrides over provider overrides', async () => {
    const screen = await renderWithProvider(<Probe overrides={{ close: 'Instance' }} />, {
      messages: { Probe: { close: 'Provider' } },
    });
    await expect.element(screen.getByRole('button', { name: 'Instance' })).toBeInTheDocument();
  });

  it('does not apply overrides of other components', async () => {
    const screen = await renderWithProvider(<Probe />, { messages: { Other: { close: 'Nope' } } });
    await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('canonicalizes the locale tag and forwards it to RAC I18nProvider', async () => {
    const screen = await renderWithProvider(<Probe />, { locale: 'pt-br' });
    await expect.element(screen.getByTestId('locale')).toHaveTextContent('pt-BR');
    await expect.element(screen.getByTestId('rac')).toHaveTextContent('pt-BR ltr');
  });

  it('forwards RTL locales to RAC', async () => {
    const screen = await renderWithProvider(<Probe />, { locale: 'ar-EG' });
    await expect.element(screen.getByTestId('rac')).toHaveTextContent('ar-EG rtl');
  });
});
