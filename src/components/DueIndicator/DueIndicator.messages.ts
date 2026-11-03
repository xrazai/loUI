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
    /**
     * Status of an item paid on a known day. `date` is already formatted for the locale
     * ("Oct 30"). Word it without grammatical gender so it fits any item ("Paid", not "Paga").
     */
    paidOn: (date: string) => `Paid ${date}`,
  },
  'pt-BR': {
    overdue: (days: number) =>
      plural('pt-BR', days, { one: `Vencido há ${days} dia`, other: `Vencido há ${days} dias` }),
    due: (relative: string) => `Vence ${relative}`,
    paid: 'Pago',
    paidOn: (date: string) => `Pagamento em ${date}`,
  },
});
