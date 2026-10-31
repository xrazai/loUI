import { defineMessages } from '../i18n';

export const messages = defineMessages({
  en: {
    /** Label of the action button on the toast. A verb. */
    undo: 'Undo',
    /** Toast shown when the deferred commit failed and the change was reverted. */
    commitFailed: "Couldn't complete the change. It was undone. Try again.",
    /** Toast shown when reverting (Undo) failed. */
    undoFailed: "Couldn't undo the change. Try again.",
  },
  'pt-BR': {
    undo: 'Desfazer',
    commitFailed: 'Não foi possível concluir a alteração. Ela foi desfeita. Tente novamente.',
    undoFailed: 'Não foi possível desfazer a alteração. Tente novamente.',
  },
});
