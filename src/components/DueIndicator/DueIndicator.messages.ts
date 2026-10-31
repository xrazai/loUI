import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Status of a date in the past. `days` is a positive whole number. */
    overdue: (days: number) =>
      plural('en', days, { one: `Overdue by ${days} day`, other: `Overdue by ${days} days` }),
    /**
     * Status of a date today or later. `relative` is the locale's relative time from
     * `formatRelativeDays` ("today", "tomorrow", "in 3 days").
     */
    due: (relative: string) => `Due ${relative}`,
    /** Status of a settled item: the due date no longer matters. */
    paid: 'Paid',
  },
  'pt-BR': {
    overdue: (days: number) =>
      plural('pt-BR', days, { one: `Vencido há ${days} dia`, other: `Vencido há ${days} dias` }),
    due: (relative: string) => `Vence ${relative}`,
    paid: 'Pago',
  },
});
