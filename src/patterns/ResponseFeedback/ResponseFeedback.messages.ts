import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the group of rating buttons. */
    groupLabel: 'Rate this response',
    /** Toggle buttons; pressed means the rating is set. */
    positive: 'Good response',
    negative: 'Bad response',
    /** Action buttons (verb plus object). */
    copy: 'Copy response',
    regenerate: 'Regenerate response',
    /** Polite announcements after a rating changes. */
    sent: 'Feedback sent',
    removed: 'Feedback removed',
  },
  'pt-BR': {
    groupLabel: 'Avaliar esta resposta',
    positive: 'Resposta boa',
    negative: 'Resposta ruim',
    copy: 'Copiar resposta',
    regenerate: 'Gerar resposta de novo',
    sent: 'Avaliação enviada',
    removed: 'Avaliação removida',
  },
});
