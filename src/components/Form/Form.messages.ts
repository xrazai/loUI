import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Title of the error summary shown after a failed submit. `count` is the number of invalid fields. */
    summaryTitle: (count: number) =>
      plural('en', count, {
        one: 'Fix 1 field before saving',
        other: `Fix ${String(count)} fields before saving`,
      }),
  },
  'pt-BR': {
    summaryTitle: (count: number) =>
      plural('pt-BR', count, {
        one: 'Corrija 1 campo antes de salvar',
        other: `Corrija ${String(count)} campos antes de salvar`,
      }),
  },
});
