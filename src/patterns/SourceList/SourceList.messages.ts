import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Default heading of the source list. */
    title: 'Sources',
    /** Accessible name of a citation marker: "Source 2: Title". */
    citation: (number: number, title: string) => `Source ${String(number)}: ${title}`,
  },
  'pt-BR': {
    title: 'Fontes',
    citation: (number: number, title: string) => `Fonte ${String(number)}: ${title}`,
  },
});
