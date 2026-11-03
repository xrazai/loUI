import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Visually hidden prefix read before the title of an event with a tone; color and icon alone cannot carry it. */
    accent: 'Highlighted',
    success: 'Success',
    warning: 'Warning',
    danger: 'Error',
    /** Visible label before the person or system that caused the event. */
    actor: (actor: string) => `By ${actor}`,
  },
  'pt-BR': {
    accent: 'Destaque',
    success: 'Sucesso',
    warning: 'Atenção',
    danger: 'Erro',
    actor: (actor: string) => `Por ${actor}`,
  },
});
