import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Accessible name of the region that holds the toasts (a landmark reachable with F6). */
    region: 'Toast notifications',
    /** Name of the dismiss button of a toast. */
    dismiss: 'Dismiss notification',
    /** Visually hidden prefix that tells screen reader users the kind of toast; the dot alone cannot. */
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    danger: 'Error',
  },
  'pt-BR': {
    region: 'Notificações temporárias',
    dismiss: 'Dispensar notificação',
    info: 'Informação',
    success: 'Sucesso',
    warning: 'Atenção',
    danger: 'Erro',
  },
});
