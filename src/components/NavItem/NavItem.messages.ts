import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Spoken text for a count when the consumer gives no `countLabel`. */
    count: (value: string) => `Count: ${value}`,
  },
  'pt-BR': {
    count: (value: string) => `Quantidade: ${value}`,
  },
});
