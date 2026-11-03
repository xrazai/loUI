import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Read after the label of a step that is done. */
    complete: 'Completed',
    /** Read after the label of the step in progress. */
    current: 'Current',
    /** Read after the label of a step that has not started. */
    upcoming: 'Not started',
    /** Visible summary of the progress when the labels do not fit; `current` and `total` are formatted numbers. */
    summary: (current: string, total: string) => `Step ${current} of ${total}`,
  },
  'pt-BR': {
    complete: 'Concluída',
    current: 'Atual',
    upcoming: 'Não iniciada',
    summary: (current: string, total: string) => `Etapa ${current} de ${total}`,
  },
});
