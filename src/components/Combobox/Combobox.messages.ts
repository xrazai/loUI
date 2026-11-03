import { defineMessages } from '../../i18n';

export const messages = defineMessages({
  en: {
    /** Shown in the list when the typed text matches no option. */
    noResults: 'No results',
    /** Shown in the list while options are loading and there are none yet; also names the spinner. */
    loading: 'Loading',
    /** Accessible name of the button that opens the list. */
    showOptions: 'Show options',
    /** Last row of the list when `onCreate` is set and the typed text matches no option. */
    createOption: (value: string) => `Create “${value}”`,
  },
  'pt-BR': {
    noResults: 'Nenhum resultado',
    loading: 'Carregando',
    showOptions: 'Mostrar opções',
    createOption: (value: string) => `Criar “${value}”`,
  },
});
