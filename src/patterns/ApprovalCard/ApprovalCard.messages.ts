import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Kind badge and the first word of the accessible name. */
    kindQuestion: 'Question',
    kindReview: 'Review',
    /** Visually hidden label before the original message. */
    messageLabel: 'Customer message',
    /** Label and hint of the editable draft. */
    draftLabel: 'Agent reply',
    draftHint: 'You can edit before sending',
    /** Verb plus object buttons. The card's heading describes which card they belong to. */
    send: 'Send reply',
    discard: 'Discard reply',
  },
  'pt-BR': {
    kindQuestion: 'Pergunta',
    kindReview: 'Avaliação',
    messageLabel: 'Mensagem do cliente',
    draftLabel: 'Resposta do agente',
    draftHint: 'Você pode editar antes de enviar',
    send: 'Enviar resposta',
    discard: 'Descartar resposta',
  },
});
