import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Status badge text. */
    statusTesting: 'In testing',
    statusActive: 'Active',
    statusPaused: 'Paused',
    statusSoon: 'Coming soon',
    /** Footer text of a card that is not available yet and has no last-activity text. */
    notConfigured: 'Not set up yet',
    /** Text after the (separately styled) pending number: "4 to approve". */
    pending: (n: number) => plural('en', n, { one: 'to approve', other: 'to approve' }),
  },
  'pt-BR': {
    statusTesting: 'Em teste',
    statusActive: 'Ativo',
    statusPaused: 'Pausado',
    statusSoon: 'Em breve',
    notConfigured: 'Ainda não configurado',
    pending: (n: number) => plural('pt-BR', n, { one: 'para aprovar', other: 'para aprovar' }),
  },
});
