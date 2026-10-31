import { defineMessages, plural } from '../../i18n';
import { formatNumber } from '../../utils/number';

export const messages = defineMessages({
  en: {
    /** Visible counter next to the label, for example "12 / 200". Arguments are already formatted. */
    count: (used: string, max: string) => `${used} / ${max}`,
    /** Polite announcement, made once typing pauses. */
    remaining: (n: number) =>
      plural('en', n, {
        zero: 'No characters remaining',
        one: '1 character remaining',
        other: `${formatNumber(n, 'en')} characters remaining`,
      }),
    /** Announcement when a controlled value exceeds `maxLength`. */
    over: (n: number) =>
      plural('en', n, {
        one: '1 character over the limit',
        other: `${formatNumber(n, 'en')} characters over the limit`,
      }),
  },
  'pt-BR': {
    count: (used: string, max: string) => `${used} / ${max}`,
    remaining: (n: number) =>
      plural('pt-BR', n, {
        zero: 'Nenhum caractere restante',
        one: '1 caractere restante',
        other: `${formatNumber(n, 'pt-BR')} caracteres restantes`,
      }),
    over: (n: number) =>
      plural('pt-BR', n, {
        one: '1 caractere acima do limite',
        other: `${formatNumber(n, 'pt-BR')} caracteres acima do limite`,
      }),
  },
});
