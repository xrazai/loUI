import { defineMessages, plural } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Progress text of a step, such as "Step 2 of 5". */
    progress: (current: number, total: number) =>
      plural('en', total, { other: `Step ${current} of ${total}` }),
    /** Goes to the previous step. */
    back: 'Back',
    /** Goes to the next step. */
    next: 'Next',
    /** Finishes the tour on the last step. */
    done: 'Done',
    /** Ends the tour before the last step. */
    skip: 'Skip tour',
  },
  'pt-BR': {
    progress: (current: number, total: number) =>
      plural('pt-BR', total, { other: `Passo ${current} de ${total}` }),
    back: 'Voltar',
    next: 'Avançar',
    done: 'Concluir',
    skip: 'Pular tour',
  },
});
