import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the legend list, unless the consumer passes `aria-label` or `aria-labelledby`. */
    label: 'Legend',
    /** Accessible description of an interactive legend: what pressing an item does. Read after the name of the list. */
    toggleHint: 'Press a series to show or hide it.',
  },
  'pt-BR': {
    label: 'Legenda',
    toggleHint: 'Pressione uma série para mostrá-la ou ocultá-la.',
  },
});
